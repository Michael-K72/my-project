import { z } from "zod";
import { budgetOptions, projectTypes } from "@/data/booking";

export const bookingServiceIds = ["discovery", "strategy", "review"] as const;

export const bookingSchema = z.object({
  serviceId: z.enum(bookingServiceIds),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.enum(budgetOptions),
  type: z.enum(projectTypes),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;
