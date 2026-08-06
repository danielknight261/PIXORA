import { EditorUploadPanel } from "@/features/editor/components/editor-upload-panel";

type EditorPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { productId } = await params;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editor</h1>
          <p className="text-muted-foreground">Product: {productId}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr_280px]">
        <aside className="rounded-3xl border bg-card p-6">
          <EditorUploadPanel />
        </aside>
        <main className="flex min-h-[480px] items-center justify-center rounded-3xl border bg-muted">
          <p className="text-muted-foreground">Canvas preview (Fabric.js)</p>
        </main>
        <aside className="rounded-3xl border bg-card p-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Layers
          </h2>
        </aside>
      </div>
    </div>
  );
}
