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

const AskQuestionCard = () => {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; summary: string; sourceCode: string }[]>();
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!project?.id) return;
    setLoading(true);
    setOpen(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.png" alt="logo" width={40} height={40} />
            </DialogTitle>
          </DialogHeader>
          {answer}
          <h1>Files References</h1>
          {filesReferences?.map((file) => {
            return <span>{file.fileName}</span>;
          })}
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            TellGit has knowledge of your codebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea placeholder="Which file should I edit to change the home page?" />
            <div className="h-4"></div>
            <Button type="submit">Ask TellGit!</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
