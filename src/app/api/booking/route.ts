import { NextResponse } from "next/server";
import { confirmBooking } from "@/lib/providers/booking";
import { sendEmail } from "@/lib/providers/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { bookingSchema } from "@/lib/validation/booking";
import { fieldErrors } from "@/lib/validation/helpers";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request.headers, "booking"), 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  try {
    const record = confirmBooking(parsed.data);
    await sendEmail({
      to: parsed.data.email,
      subject: `Booking ${record.reference}`,
      text: `${record.date} ${record.time} ${record.timezone}`,
    });
    return NextResponse.json({ ok: true, ...record });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 409 });
  }
}
