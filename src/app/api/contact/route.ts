import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/providers/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { shortReference } from "@/lib/utils";
import { contactSchema } from "@/lib/validation/contact";
import { fieldErrors } from "@/lib/validation/helpers";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request.headers, "contact"), 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const data = parsed.data;
  const reference = shortReference("INQ");
  await sendEmail({
    to: data.email,
    subject: `Inquiry ${reference}`,
    text: `${data.name} · ${data.type} · ${data.budget}\n\n${data.message}`,
  });

  return NextResponse.json({ ok: true, reference, mode: "demo" });
}
