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
import { useRouter } from "next/navigation"; // Changed from "next/router" to "next/navigation"
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const { project } = useProject(); // Destructured project from the hook return
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      projectId: string;
      meetingId: string;
    }) => {
      const { meetingUrl, projectId, meetingId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        projectId,
        meetingId,
      });
      return response.data;
    },
  });

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
        if (!project) return; // Check if project exists
        const file = acceptedFiles[0];
        if (!file) return;
        const downloadUrl = (await uploadFile(
          file as File,
          setProgress,
        )) as string;
        uploadMeeting.mutate(
          {
            projectId: project.id, // Now correctly accessing project.id
            meetingUrl: downloadUrl,
            name: file.name,
          },
          {
            onSuccess: (meeting) => {
              toast.success("Meeting uploaded successfully!");
              router.push("/meetings");
              processMeeting.mutateAsync({
                meetingUrl: downloadUrl,
                projectId: project.id,
                meetingId: meeting.id,
              });
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
      className={`col-span-2 h-[250px] cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-2 border-dashed border-blue-300 bg-blue-50"
          : "border-2 border-dashed border-gray-200 hover:bg-gray-50"
      } ${isUploading ? "pointer-events-none" : ""} `}
      {...getRootProps()}
    >
      <div className="flex h-full flex-col items-center justify-center p-6">
        {!isUploading && (
          <>
            <Presentation
              className={`mb-3 h-10 w-10 text-gray-600 ${isDragActive ? "animate-bounce" : ""}`}
            />
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Create a new meeting
            </h3>
            <p className="mb-4 max-w-xs text-center text-sm text-gray-500">
              {isDragActive
                ? "Drop your audio file here..."
                : "Analyze your meeting with TellGit. Powered by AI"}
            </p>
            <Button disabled={isUploading} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Meeting
            </Button>
            <input {...getInputProps()} />
            <p className="mt-2 text-center text-xs text-gray-400">
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
