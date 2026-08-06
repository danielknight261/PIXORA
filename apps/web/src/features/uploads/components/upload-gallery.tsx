"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@pixora/ui/components/ui/button";
import { deleteUploadAction } from "@/features/uploads/actions";

export type UploadGalleryItem = {
  id: string;
  fileName: string;
  signedUrl: string | null;
  sizeBytes: number;
  createdAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadGallery({ uploads }: { uploads: UploadGalleryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {uploads.map((upload) => (
        <article
          key={upload.id}
          className="overflow-hidden rounded-2xl border bg-card shadow-card"
        >
          <div className="relative aspect-square bg-muted">
            {upload.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={upload.signedUrl}
                alt={upload.fileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Preview unavailable
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <p className="truncate text-sm font-medium">{upload.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(upload.sizeBytes)} · {upload.createdAt}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await deleteUploadAction(upload.id);
                  router.refresh();
                });
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
