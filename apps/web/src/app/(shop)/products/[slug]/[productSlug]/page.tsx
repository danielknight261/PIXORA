import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency, mockProducts, productPagePath } from "@pixora/shared";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { PriceTag } from "@pixora/ui/components/price-tag";
import { ProductCard } from "@pixora/ui/components/product-card";
import { Button } from "@pixora/ui/components/ui/button";
import { Badge } from "@pixora/ui/components/ui/badge";
import { ImagePlaceholder } from "@/features/marketing/components/image-placeholder";
import {
  getCatalogCategory,
  getCatalogProduct,
  getRelatedProducts,
} from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string; productSlug: string }>;
};

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.categorySlug,
    productSlug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const product = await getCatalogProduct(slug, productSlug);

  if (!product) {
    return { title: "Product not found | Pixora" };
  }

  const title = `${product.name} | Pixora`;
  const description =
    product.description ??
    `Personalise ${product.name} with your photos on Pixora.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productSlug } = await params;
  const [product, category] = await Promise.all([
    getCatalogProduct(slug, productSlug),
    getCatalogCategory(slug),
  ]);

  if (!product || !category) {
    notFound();
  }

  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Pixora" },
    category: category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: (product.basePrice / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://pixora.app${productPagePath(product)}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: category.name, href: `/products/${category.slug}` },
            { label: product.name },
          ]}
          className="mb-8"
        />

        <article className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
            <div className="relative aspect-square">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlaceholder
                  variant="product"
                  slug={product.categorySlug}
                  label={product.name}
                  className="min-h-full"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Badge variant="soft">{category.name}</Badge>
              <h1 className="text-title text-balance">{product.name}</h1>
              {product.description ? (
                <p className="text-body text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
            </div>

            <PriceTag price={product.basePrice} size="lg" />

            <div className="flex flex-wrap gap-3">
              <Link href={`/editor/${product.slug}`}>
                <Button size="lg" variant="premium">
                  Start designing
                </Button>
              </Link>
              <Link href={`/products/${category.slug}`}>
                <Button size="lg" variant="outline">
                  More {category.name.toLowerCase()}
                </Button>
              </Link>
            </div>

            <dl className="grid gap-3 rounded-2xl border bg-muted/40 p-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-semibold">
                  {formatCurrency(product.basePrice)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-semibold">{category.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Personalisation</dt>
                <dd className="font-semibold">Upload your photo</dd>
              </div>
            </dl>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-title mb-8">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.basePrice}
                  href={productPagePath(item)}
                  imageUrl={item.imageUrl}
                  category={
                    typeof item.category === "string"
                      ? item.category
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
