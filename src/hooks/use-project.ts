import React from "react";
import { api } from "~/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage<string | null>(
    "TellGit-projectId",
    "",
  );

  const project = projects?.find((p) => p.id === projectId) || null;
  return { project, projects, setProjectId, projectId };
};

export default useProject;
