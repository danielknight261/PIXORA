import { Resend } from "resend";
import { env } from "../env";

export function createResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(env.RESEND_API_KEY);
}

export async function sendOrderConfirmation(
  resend: Resend,
  to: string,
  orderId: string,
): Promise<void> {
  await resend.emails.send({
    from: "Pixora <orders@pixora.app>",
    to,
    subject: `Order confirmed — ${orderId}`,
    html: `<p>Thank you for your order! Your order <strong>${orderId}</strong> has been confirmed.</p>`,
  });
}
