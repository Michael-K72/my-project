import { z } from "zod";
import { productIds } from "@/data/products";

export const checkoutLineSchema = z.object({
  productId: z.enum(productIds),
  variantId: z.enum(["essential", "extended", "signature"]),
  quantity: z.number().int().min(1).max(9),
});

export const checkoutSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().min(4).max(120),
  city: z.string().trim().min(2).max(80),
  postal: z.string().trim().min(3).max(16),
  country: z.string().trim().min(2).max(80),
  coupon: z.string().trim().max(24).optional().or(z.literal("")),
  lines: z.array(checkoutLineSchema).min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
