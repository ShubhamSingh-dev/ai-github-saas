// src/lib/github.ts

import { Octokit } from "octokit";
import { db } from "../server/db";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = "https://github.com/ShubhamSingh-dev/ai-github-saas";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author?.date || "").getTime() -
      new Date(a.commit.author?.date || "").getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "", // Fix is here.
    commitDate: commit.commit.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map(async (commit) => {
      try {
        const summary = await summariseCommit(githubUrl, commit.commitHash);
        return { ...commit, summary: summary || commit.commitMessage };
      } catch (error) {
        console.error(
          `Failed to summarize commit ${commit.commitHash}:`,
          error,
        );
        return { ...commit, summary: commit.commitMessage };
      }
    }),
  );

  const successfulSummaries = summaryResponses
    .filter(
      (response): response is PromiseFulfilledResult<any> =>
        response.status === "fulfilled",
    )
    .map((response) => response.value);

  let commits = { count: 0 };

  if (successfulSummaries.length > 0) {
    commits = await db.commit.createMany({
      data: successfulSummaries.map((summaryObj) => ({
        projectId,
        commitHash: summaryObj.commitHash,
        commitMessage: summaryObj.commitMessage,
        commitAuthorName: summaryObj.commitAuthorName,
        commitAuthorAvatar: summaryObj.commitAuthorAvatar,
        commitDate: summaryObj.commitDate,
        summary: summaryObj.summary,
      })),
    });
  } else {
    console.log("No new commits to process or all failed.");
  }

  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return (await aiSummariseCommit(data)) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project not found or GitHub URL is missing");
  }

  return { project, githubUrl: project?.githubUrl || "" };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processed: { commitHash: string }) =>
          processed.commitHash === commit.commitHash,
      ),
  );
  return unprocessedCommits;
}
