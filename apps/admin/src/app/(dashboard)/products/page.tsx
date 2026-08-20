export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products & fulfillment</h1>
        <p className="mt-2 text-muted-foreground">
          Snapp Daddy commerce moved to <strong>Shopify + Gelato</strong>. Publish
          canvas and mug products from the Gelato Shopify app — do not use the
          old catalog import.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">What to do</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Install Gelato on your Shopify store and enable Personalizer.</li>
          <li>
            Push the theme from{" "}
            <code className="text-xs">apps/shopify-theme</code>.
          </li>
          <li>
            Publish personalized canvas + mug products from Gelato → Shopify.
          </li>
          <li>Point DNS / cut over using the migration runbook.</li>
        </ol>
        <ul className="space-y-1 text-sm">
          <li>
            Runbook:{" "}
            <code className="text-xs">docs/shopify-gelato-migration.md</code>
          </li>
          <li>
            Product publish:{" "}
            <code className="text-xs">docs/shopify-product-publish.md</code>
          </li>
          <li>
            Theme: <code className="text-xs">apps/shopify-theme/</code>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Orders and catalog live in Shopify Admin — not this dashboard.
        </p>
      </div>
    </div>
  );
}
