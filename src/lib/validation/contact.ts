import { z } from "zod";
import { budgetOptions, projectTypes } from "@/data/booking";

export const timelineOptions = ["asap", "q", "h", "open"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.enum(projectTypes),
  budget: z.enum(budgetOptions),
  timeline: z.enum(timelineOptions),
  message: z.string().trim().min(12).max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
