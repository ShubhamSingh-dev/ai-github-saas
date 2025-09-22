"use client";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import React, { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "@ai-sdk/rsc";
import CodeRefrences from "./code-refrences";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; summary: string; sourceCode: string }[]>();
  const [answer, setAnswer] = useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear previous answer before starting new stream
    setAnswer("");
    setFilesReferences([]);
    if (!project?.id) return;
    setLoading(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[90vh] w-[98vw] !max-w-[70vw] flex-col"
          style={{ width: "98vw", maxWidth: "98vw" }}
        >
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <DialogTitle className="text-lg font-semibold">
                  TellGit Assistant
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={saveAnswer.isPending}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    saveAnswer.mutate(
                      {
                        projectId: project!.id,
                        question,
                        answer,
                        filesReferences,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Answer saved successfully!");
                          refetch();
                        },
                        onError: () => {
                          toast.error("Failed to save answer!");
                        },
                      },
                    );
                  }}
                >
                  {saveAnswer.isPending ? "Saving..." : "Save Answer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
            {/* Question display */}
            <div className="bg-muted flex-shrink-0 rounded-lg p-4">
              <p className="text-muted-foreground mb-2 text-sm font-medium">
                Question:
              </p>
              <p className="text-sm leading-relaxed">{question}</p>
            </div>

            {/* Answer section */}
            <div className="flex min-h-0 flex-1 flex-col">
              <h3 className="mb-3 flex-shrink-0 text-base font-medium">
                Answer
              </h3>
              <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
                {answer ? (
                  <div
                    className="h-full overflow-auto p-6"
                    style={{ width: "100%" }}
                  >
                    <div style={{ width: "100%", maxWidth: "none" }}>
                      <MDEditor.Markdown
                        source={answer}
                        style={{
                          backgroundColor: "transparent",
                          color: "inherit",
                          width: "100%",
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-muted-foreground text-center">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>Asking TellGit...</span>
                        </div>
                      ) : (
                        <p>
                          Please provide a question. I'm ready to assist you
                          with any questions about the codebase.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code references section */}
            {filesReferences && filesReferences.length > 0 && (
              <div className="flex-shrink-0">
                <h3 className="mb-3 text-base font-medium">Code References</h3>
                <div className="max-h-80 overflow-auto rounded-lg border">
                  <CodeRefrences filesReferences={filesReferences} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 flex h-[250px] flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-lg">Ask a question</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            TellGit has knowledge of your codebase
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-full flex-col pt-0">
          <form onSubmit={onSubmit} className="flex h-full flex-col">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              onChange={(e) => setQuestion(e.target.value)}
              value={question}
              className="min-h-[60px] flex-1 resize-none"
              disabled={loading}
            />
            <div className="h-3"></div>
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="mt-auto w-32"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Asking TellGit...</span>
                </div>
              ) : (
                "Ask TellGit!"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
