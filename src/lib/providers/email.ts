import "server-only";
import { serverFeatures } from "@/config/features";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Email adapter. Demo mode records the payload and returns a receipt id.
 * Production wiring (Resend) activates only when RESEND_API_KEY is present.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ id: string; mode: "demo" | "live" }> {
  if (serverFeatures().email) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "hello@michaelkalachin.ch",
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
      }),
    });
    if (!res.ok) throw new Error("Email provider rejected the request");
    const data = (await res.json()) as { id?: string };
    return { id: data.id ?? "live", mode: "live" };
  }
  return { id: `demo-mail-${Date.now().toString(36)}`, mode: "demo" };
}
