import { NextResponse } from "next/server";
import { listSlots } from "@/lib/providers/booking";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ slots: [] }, { status: 400 });
  }
  return NextResponse.json({ slots: listSlots(date), source: "demo" });
}
