"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_UPLOAD_BYTES_LABEL,
} from "@pixora/shared";
import { Button } from "@pixora/ui/components/ui/button";
import { cn } from "@pixora/ui/lib/utils";
import type { ClientUploadProgress } from "@/features/uploads/upload-client";
import { uploadImageFile } from "@/features/uploads/upload-client";

const accept = ALLOWED_IMAGE_EXTENSIONS.join(",");

export type ImageUploaderProps = {
  onUploadComplete?: (upload: {
    id: string;
    signedUrl: string | null;
    fileName: string;
  }) => void;
  multiple?: boolean;
  className?: string;
};

type QueueItem = ClientUploadProgress & { id: string };

export function ImageUploader({
  onUploadComplete,
  multiple = true,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const updateQueueItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();
      setQueue((current) => [
        ...current,
        {
          id,
          fileName: file.name,
          progress: 0,
          status: "validating",
        },
      ]);

      try {
        const result = await uploadImageFile(file, (state) => {
          updateQueueItem(id, state);
        });

        onUploadComplete?.({
          id: result.id,
          signedUrl: result.signedUrl,
          fileName: result.fileName,
        });
      } catch (error) {
        updateQueueItem(id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    },
    [onUploadComplete, updateQueueItem],
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const toUpload = multiple ? list : list.slice(0, 1);
      void Promise.all(toUpload.map((file) => processFile(file)));
    },
    [multiple, processFile],
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Upload className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-lg font-semibold">
          Drop photos here or click to browse
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          JPG, PNG, WEBP, or HEIC · Max {MAX_UPLOAD_BYTES_LABEL} per file
        </p>
        <Button type="button" variant="soft" className="mt-6" tabIndex={-1}>
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {queue.length > 0 ? (
        <ul className="space-y-3">
          {queue.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {item.status === "uploading" || item.status === "registering" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.status === "error"
                    ? item.error
                    : item.status === "done"
                      ? "Uploaded"
                      : `${item.progress}%`}
                </p>
                {item.status !== "error" && item.status !== "done" ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
              {item.status === "error" ? (
                <button
                  type="button"
                  aria-label="Dismiss"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setQueue((current) => current.filter((q) => q.id !== item.id))
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
