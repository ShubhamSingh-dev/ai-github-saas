"use client";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  const alert = async () => {
    const confirm = window.confirm(
      "Are you sure you want to archive this project?",
    );
    if (confirm) {
      await archiveProject.mutateAsync(
        { projectId: projectId || "" },
        {
          onSuccess: () => {
            toast.success("Project archived successfully!");
            refetch();
          },
          onError: (error) => {
            toast.error("Failed to archive project");
          },
        },
      );
    }
  };
  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      onClick={alert}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
