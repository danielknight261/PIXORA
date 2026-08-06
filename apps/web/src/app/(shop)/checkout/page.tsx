import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { StepIndicator } from "@pixora/ui/components/step-indicator";
import { Button } from "@pixora/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@pixora/ui/components/ui/card";
import { Input } from "@pixora/ui/components/ui/input";
import { Label } from "@pixora/ui/components/ui/label";

const checkoutSteps = [
  { id: "cart", label: "Cart" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirm" },
];

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
        className="mb-8"
      />
      <h1 className="text-title">Checkout</h1>
      <p className="text-body mt-2 text-muted-foreground">
        Secure payment powered by Stripe.
      </p>

      <StepIndicator
        steps={checkoutSteps}
        currentStep="details"
        className="my-10"
      />

      <Card>
        <CardHeader>
          <CardTitle>Shipping details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="premium" className="w-full">
                Pay with Stripe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
