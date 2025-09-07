"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type formInput = {
  githubUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<formInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data: formInput) => {
    createProject.mutate(
      {
        projectName: data.projectName,
        githubUrl: data.githubUrl,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully!");
          refetch();
          reset();
        },
        onError: (error) => {
          toast.error("Failed to create project: " + error.message);
        },
      },
    );
    return true;
  };

  return (
    <div className="flex h-full w-full items-center justify-center gap-6">
      {/* Left Illustration */}
      <div className="hidden flex-1 justify-end pr-8 md:flex">
        <img
          src="/undraw_github.svg"
          className="h-60 w-auto"
          alt="GitHub Illustration"
        />
      </div>

      {/* Right Form */}
      <div className="flex flex-1 justify-start">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">
              Link your GitHub repository
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter the URL of your GitHub repository to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <Input
              {...register("githubUrl", { required: true })}
              placeholder="GitHub URL"
              type="url"
              required
            />
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (optional)"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createProject.isPending}
            >
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
