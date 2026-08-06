import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerClient,
  getAuthUser,
  imageUploadService,
  isSupabaseConfigured,
} from "@pixora/api";
import { formatDate } from "@pixora/shared";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { EmptyState } from "@pixora/ui/components/empty-state";
import { Button } from "@pixora/ui/components/ui/button";
import { ImageUploader } from "@/features/uploads/components/image-uploader";
import { UploadGallery } from "@/features/uploads/components/upload-gallery";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?redirectTo=/uploads");
  }

  const supabase = await createServerClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login?redirectTo=/uploads");
  }

  const uploads = await imageUploadService.listUserUploads(supabase, user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My uploads" },
        ]}
        className="mb-6"
      />

      <div className="mb-8 space-y-2">
        <h1 className="text-title">My uploads</h1>
        <p className="text-body text-muted-foreground">
          Upload JPG, PNG, WEBP, or HEIC photos up to 50 MB. Files are stored
          securely in your private library.
        </p>
      </div>

      <ImageUploader className="mb-10" />

      {uploads.length === 0 ? (
        <EmptyState
          title="No uploads yet"
          description="Your uploaded photos will appear here. Use them when personalising products in the editor."
          action={
            <Link href="/products">
              <Button variant="soft">Browse products</Button>
            </Link>
          }
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold">
              {uploads.length} {uploads.length === 1 ? "photo" : "photos"}
            </h2>
          </div>
          <UploadGallery
            uploads={uploads.map((upload) => ({
              id: upload.id,
              fileName: upload.fileName,
              signedUrl: upload.signedUrl,
              sizeBytes: upload.sizeBytes,
              createdAt: formatDate(upload.createdAt),
            }))}
          />
        </section>
      )}
    </div>
  );
}
