// src/app/(protected)/dashboard/commit-log.tsx

"use client";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

// The CommitLog component now receives all its necessary data via props.
const CommitLog = ({
  commits,
  status,
  project,
}: {
  commits: any[] | undefined;
  status: "pending" | "success" | "error";
  project: any | null | undefined;
}) => {
  if (status === "pending") {
    return <div>Loading commits...</div>;
  }

  if (!commits || commits.length === 0) {
    return <div>No commits found.</div>;
  }

  return (
    <>
      <ul className="space-y-6">
        {commits.map((commit, commitIdx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                  `absolute top-0 left-0 flex w-6 justify-center`,
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit author"
                  className="relative mt-4 size-8 flex-none rounded-full bg-gray-500"
                />
                <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-gray-200 ring-inset">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                      className="py-0.5 text-xs leading-5 text-gray-500"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex items-center">
                        commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-semibold">{commit.commitMessage}</span>
                  <pre className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-500">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
