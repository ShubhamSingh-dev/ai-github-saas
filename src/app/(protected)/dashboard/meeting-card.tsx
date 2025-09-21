
"use client";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/cloudinary";
import { Presentation, Upload } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/router";

const MeetingCard = () => {
  const project = useProject();
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
  const uploadMeeting = api.project.uploadMeeting.useMutation();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 25000000, // 25MB limit for Cloudinary free tier
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      setProgress(0);
      console.log(acceptedFiles);

      try {
        if (!project) return;
        const file = acceptedFiles[0];
        if (!file) return;
        const downloadUrl = (await uploadFile(
          file as File,
          setProgress,
        )) as string;
        uploadMeeting.mutate(
          {
            projectId: project.id,
            meetingUrl: downloadUrl,
            name: file.name,
          },
          {
            onSuccess: () => {
              toast.success("Meeting uploaded successfully!");
              router.push("/meetings");
            },
            onError: (error) => {
              toast.error("Failed to upload meeting");
            },
          },
        );

        console.log("File uploaded successfully:", downloadUrl);
        // Handle successful upload here
      } catch (error) {
        console.error("Upload failed:", error);
        // Handle upload error here
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
  });

  return (
    <Card
      className={`col-span-2 cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-2 border-dashed border-blue-300 bg-blue-50"
          : "border-2 border-dashed border-gray-200 hover:bg-gray-50"
      } ${isUploading ? "pointer-events-none" : ""} `}
      {...getRootProps()}
    >
      <div className="flex min-h-[200px] flex-col items-center justify-center p-8">
        {!isUploading && (
          <>
            <Presentation
              className={`mb-4 h-12 w-12 text-gray-600 ${isDragActive ? "animate-bounce" : ""}`}
            />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Create a new meeting
            </h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              {isDragActive
                ? "Drop your audio file here..."
                : "Analyze your meeting with TellGit. Powered by AI"}
            </p>
            <Button disabled={isUploading} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Meeting
            </Button>
            <input {...getInputProps()} />
            <p className="mt-3 text-center text-xs text-gray-400">
              Supports MP3, WAV, M4A files up to 25MB
            </p>
          </>
        )}

        {isUploading && (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-20 w-20">
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  pathColor: "#22c55e",
                  textColor: "#22c55e",
                  trailColor: "#e5e7eb",
                  textSize: "16px",
                })}
              />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Uploading your meeting...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Please don't close this window
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MeetingCard;
