"use client";

import Link from "next/link";
import { ImageUploader } from "@/features/uploads/components/image-uploader";

export function EditorUploadPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your photos
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, HEIC · up to 50 MB
        </p>
      </div>
      <ImageUploader multiple className="[&>div:first-child]:py-8" />
      <Link
        href="/uploads"
        className="text-xs font-medium text-primary hover:underline"
      >
        View all uploads →
      </Link>
    </div>
  );
}
