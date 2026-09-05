import { NextResponse } from "next/server";
import { chargeOrder } from "@/lib/providers/payment";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/checkout";
import { fieldErrors } from "@/lib/validation/helpers";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request.headers, "checkout"), 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  try {
    const result = await chargeOrder(parsed.data);
    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      mode: result.mode,
      total: result.order.total,
      currency: result.order.currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "generic";
    return NextResponse.json({ ok: false, error: message === "empty" ? "empty" : "generic" }, { status: 400 });
  }
}
