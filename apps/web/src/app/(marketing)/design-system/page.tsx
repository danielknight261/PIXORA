"use client";

import { useState } from "react";
import { Badge } from "@pixora/ui/components/ui/badge";
import { Button } from "@pixora/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pixora/ui/components/ui/card";
import { Input } from "@pixora/ui/components/ui/input";
import { Label } from "@pixora/ui/components/ui/label";
import { Skeleton } from "@pixora/ui/components/ui/skeleton";
import { Textarea } from "@pixora/ui/components/ui/textarea";
import { CategoryCard } from "@pixora/ui/components/category-card";
import { HeroBanner } from "@pixora/ui/components/hero-banner";
import { HowItWorks } from "@pixora/ui/components/how-it-works";
import { Modal } from "@pixora/ui/components/modal";
import { ProductCard } from "@pixora/ui/components/product-card";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { EmptyState } from "@pixora/ui/components/empty-state";
import { NewsletterSignup } from "@pixora/ui/components/newsletter-signup";
import { PriceTag } from "@pixora/ui/components/price-tag";
import { PromoBanner } from "@pixora/ui/components/promo-banner";
import { StepIndicator } from "@pixora/ui/components/step-indicator";
import { TestimonialCard } from "@pixora/ui/components/testimonial-card";
import { TrustBar } from "@pixora/ui/components/trust-bar";
import { UploadCta } from "@pixora/ui/components/upload-cta";
import { Separator } from "@pixora/ui/components/ui/separator";
import { ShoppingBag } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-title border-b pb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      <div className="space-y-2">
        <Badge variant="soft">Internal reference</Badge>
        <h1 className="text-display">Pixora Design System</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          Premium ecommerce components built on brand tokens — Primary
          #2563EB, Dark #0F172A, Background #F8FAFC, Poppins + Inter.
        </p>
      </div>

      <Section title="Typography">
        <div className="space-y-4 rounded-3xl border bg-card p-8">
          <p className="text-display">Display heading</p>
          <p className="text-title">Title heading</p>
          <p className="text-body">Body text for product descriptions.</p>
          <p className="text-caption">Caption for metadata and labels.</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="premium">Premium</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="premium" loading>
            Loading
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input id="demo-email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-error">With error</Label>
            <Input id="demo-error" error placeholder="Invalid value" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-notes">Textarea</Label>
            <Textarea id="demo-notes" placeholder="Add a personal message..." />
          </div>
        </div>
      </Section>

      <Section title="Cards & Badges">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Standard card</CardTitle>
              <CardDescription>
                Used for auth forms and checkout sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>Default</Badge>{" "}
              <Badge variant="soft">Soft badge</Badge>
            </CardContent>
          </Card>
          <Card interactive>
            <CardHeader>
              <CardTitle>Interactive card</CardTitle>
              <CardDescription>Hover for elevation effect.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section title="Commerce cards">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CategoryCard
            title="Canvas Prints"
            description="Gallery-quality wall art from your photos."
            href="/products/canvas-prints"
          />
          <ProductCard
            name="Canvas Print — Standard"
            description="Personalise with your favourite photo."
            price={2999}
            href="/editor/canvas-prints-standard"
            category="Canvas Prints"
          />
          <ProductCard loading />
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="flex gap-4">
          <Skeleton className="h-24 w-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Section>

      <Section title="Modal">
        <Button variant="premium" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Confirm your design"
          description="Review your personalisation before adding to cart."
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="premium" onClick={() => setModalOpen(false)}>
                Continue
              </Button>
            </>
          }
        >
          <p className="text-body text-muted-foreground">
            Modal wrapper over Dialog for quick confirmations and quick-view
            panels.
          </p>
        </Modal>
      </Section>

      <Section title="Inspired">
        <div className="space-y-8">
          <PromoBanner
            message="Free delivery on orders over £35."
            href="/products"
          />
          <HeroBanner
            eyebrow="Demo"
            title="Turn moments into keepsakes"
            description="Hero banner with split layout and photo collage placeholder."
            primaryAction={<Button variant="premium">Browse products</Button>}
          />
          <TrustBar />
          <HowItWorks />
          <UploadCta />
          <div className="grid gap-6 md:grid-cols-2">
            <TestimonialCard
              quote="The preview before checkout was brilliant."
              author="Demo user"
              context="Canvas print"
            />
            <NewsletterSignup />
          </div>
        </div>
      </Section>

      <Section title="Navigation & layout">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Canvas prints" },
          ]}
        />
        <Separator className="my-6" />
        <StepIndicator
          steps={[
            { id: "upload", label: "Upload" },
            { id: "design", label: "Design" },
            { id: "preview", label: "Preview" },
            { id: "order", label: "Order" },
          ]}
          currentStep="design"
        />
      </Section>

      <Section title="Pricing & empty states">
        <PriceTag price={2999} compareAtPrice={3499} size="lg" />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Start personalising a product to see it here."
          action={<Button variant="soft">Browse products</Button>}
        />
      </Section>
    </div>
  );
}
