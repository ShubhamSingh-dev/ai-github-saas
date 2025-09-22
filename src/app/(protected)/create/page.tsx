"use client";
import { Info } from "lucide-react";
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
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data: formInput) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          projectName: data.projectName,
          githubUrl: data.githubUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              refetch();
            }, 100);

            toast.success(
              "Project created successfully! Indexing in progress...",
            );
            reset();
          },
          onError: (error) => {
            toast.error("Failed to create project: " + error.message);
          },
        },
      );
      return true;
    } else {
      checkCredits.mutate({
        githubUrl: data.githubUrl,
        githubToken: data.githubToken,
      });
    }
  };

  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;

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
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repository.
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits remaining.
                  </p>
                </div>
              </>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={
                createProject.isPending ||
                !!checkCredits.isPending ||
                !hasEnoughCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
