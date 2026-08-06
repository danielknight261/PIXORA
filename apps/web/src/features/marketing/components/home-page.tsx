"use client";

import Link from "next/link";
import type { Category, CatalogProduct } from "@pixora/shared";
import { brand, productPagePath } from "@pixora/shared";
import { CategoryCard } from "@pixora/ui/components/category-card";
import { HowItWorks } from "@pixora/ui/components/how-it-works";
import { NewsletterSignup } from "@pixora/ui/components/newsletter-signup";
import { ProductCard } from "@pixora/ui/components/product-card";
import { TestimonialCard } from "@pixora/ui/components/testimonial-card";
import { Button } from "@pixora/ui/components/ui/button";
import { ImagePlaceholder } from "@/features/marketing/components/image-placeholder";
import {
  FadeIn,
  HeroImage,
  HeroItem,
  HeroStagger,
  StaggerContainer,
  StaggerItem,
} from "@/features/marketing/components/motion";
import { SectionHeader } from "@/features/marketing/components/section-header";

const testimonials = [
  {
    quote:
      "The live preview gave me confidence before ordering — I knew exactly how my canvas would look.",
    author: "Sarah M.",
    context: "Ordered a canvas print",
  },
  {
    quote:
      "So easy to upload from my phone and personalise a mug. Beautiful quality when it arrived.",
    author: "James T.",
    context: "Ordered a personalised mug",
  },
  {
    quote:
      "Beautiful print quality and fast delivery. I'll be back for calendars before Christmas.",
    author: "Emma L.",
    context: "Ordered a photo calendar",
  },
];

export type HomePageProps = {
  categories: Category[];
  bestSellers: CatalogProduct[];
};

function AnimatedHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card shadow-card">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-art-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-art-rose/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-art-cyan/15 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-0">
        <HeroStagger className="flex flex-col justify-center space-y-6 p-8 md:p-12 lg:p-16">
          <HeroItem>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 via-art-violet/10 to-art-rose/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/20">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-art-rose" />
              Your art studio, online
            </span>
          </HeroItem>
          <HeroItem>
            <h1 className="text-display text-balance">
              <span className="gradient-text-art">{brand.tagline}</span>
            </h1>
          </HeroItem>
          <HeroItem>
            <p className="text-body max-w-lg text-muted-foreground">
              Upload your photos, personalise premium products, preview them live,
              and order keepsakes delivered to your door.
            </p>
          </HeroItem>
          <HeroItem>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" variant="premium">
                  Browse products
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create free account
                </Button>
              </Link>
            </div>
          </HeroItem>
        </HeroStagger>
        <div className="relative min-h-[280px] lg:min-h-full">
          <HeroImage className="absolute inset-0">
            <ImagePlaceholder variant="hero" />
          </HeroImage>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ categories, bestSellers }: HomePageProps) {
  const featuredCategories = categories.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-6 py-12 md:space-y-28 md:py-16">
      <AnimatedHero />

      {/* Featured Categories */}
      <section>
        <FadeIn>
          <SectionHeader
            eyebrow="Shop"
            title="Featured categories"
            subtitle="Canvas prints, mugs, calendars and more — personalise in minutes."
            eyebrowClassName="text-art-violet"
          />
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <StaggerItem key={category.id}>
              <CategoryCard
                title={category.name}
                description={category.description}
                href={`/products/${category.slug}`}
                slug={category.slug}
                imageUrl={category.imageUrl}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How It Works */}
      <FadeIn>
        <div id="how-it-works">
          <HowItWorks />
        </div>
      </FadeIn>

      {/* Best Sellers */}
      <section>
        <FadeIn>
          <SectionHeader
            eyebrow="Popular"
            title="Best sellers"
            subtitle="Our most-loved personalised products, ready for your photos."
            action={
              <Link href="/products">
                <Button variant="soft">View all products</Button>
              </Link>
            }
            align="left"
            className="sm:items-end"
          />
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard
                name={product.name}
                description={product.description}
                price={product.basePrice}
                href={productPagePath(product)}
                imageUrl={product.imageUrl}
                category={
                  typeof product.category === "string"
                    ? product.category
                    : undefined
                }
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Testimonials */}
      <section>
        <FadeIn>
          <SectionHeader
            eyebrow="Reviews"
            title="Loved by customers"
            subtitle="Real stories from people turning moments into keepsakes."
          />
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <StaggerItem key={item.author}>
              <TestimonialCard
                quote={item.quote}
                author={item.author}
                context={item.context}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Newsletter */}
      <FadeIn>
        <NewsletterSignup />
      </FadeIn>
    </div>
  );
}
