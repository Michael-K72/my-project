import "server-only";
import { bookingServices } from "@/data/booking";
import { demoSlotsFor } from "@/features/booking/availability";
import type { BookingInput } from "@/lib/validation/booking";
import { shortReference } from "@/lib/utils";

export type BookingRecord = {
  reference: string;
  mode: "demo";
  serviceId: BookingInput["serviceId"];
  date: string;
  time: string;
  timezone: string;
  email: string;
};

const bookings: BookingRecord[] = [];

export function listSlots(iso: string): string[] {
  return demoSlotsFor(iso);
}

export function confirmBooking(input: BookingInput): BookingRecord {
  const service = bookingServices.find((s) => s.id === input.serviceId);
  if (!service) throw new Error("Unknown service");
  const slots = listSlots(input.date);
  if (!slots.includes(input.time)) throw new Error("Slot unavailable");
  const record: BookingRecord = {
    reference: shortReference("BK"),
    mode: "demo",
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    timezone: input.timezone,
    email: input.email,
  };
  bookings.push(record);
  return record;
}
