// src/app/(protected)/dashboard/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import useProject from "~/hooks/use-project";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import { api } from "~/trpc/react"; // Import the API
import MeetingCard from "./meeting-card";

const DashboardPage = () => {
  const { project, projectId } = useProject();
  const { data: commits, status } = api.project.getCommits.useQuery(
    { projectId: projectId || "" }, // Pass a default empty string if projectId is null
    { enabled: !!projectId }, // Only run the query if projectId exists
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Github Link */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This Project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">Tea</div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8"></div>
      {/* Conditionally render CommitLog or a loading state based on the query status */}
      <CommitLog commits={commits} status={status} project={project} />
    </div>
  );
};

export default DashboardPage;
