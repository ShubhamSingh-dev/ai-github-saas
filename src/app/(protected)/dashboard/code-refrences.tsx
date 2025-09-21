"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import React, { useState } from "react";

type Props = {
  filesReferences: { fileName: string; summary: string; sourceCode: string }[];
};

const CodeRefrences = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);
  if (filesReferences.length === 0) return null;

  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="bg-gary-200 flex gap-2 overflow-scroll rounded-md p-1">
          {filesReferences.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                `py-1.6 text-muted-foreground hover:bg-muted rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors`,
                {
                  "bg-primary text-primary-foreground": tab === file.fileName,
                },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] w-full overflow-scroll rounded-md"
          >
            <SyntaxHighlighter
              language="typescript"
              style={lucario}
              className="w-full"
            >
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeRefrences;
