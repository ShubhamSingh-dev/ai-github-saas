// src/hooks/use-project.ts
"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/trpc/react";

const useProject = () => {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");
  const [projectId, setProjectId] = useLocalStorage<string | null>(
    "TellGit-projectId",
    projectIdFromUrl,
  );

  const { data: projects } = api.project.getProjects.useQuery(undefined, {
    enabled: !!projectIdFromUrl, // Ensure the query is enabled only when a project ID exists
  });
  const project = projects?.find((p) => p.id === projectId) || null;
  return { project, projects, setProjectId, projectId };
};

export default useProject;
