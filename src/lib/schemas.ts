import { z } from "zod";

// Reusable primitives
const amountSchema = z.coerce
  .number({
    error: (issue) =>
      issue.input === undefined
        ? "Amount is required"
        : "Amount must be a number",
  })
  .refine((n) => n !== 0, "Amount cannot be zero")
  .refine((n) => Math.abs(n) < 1_000_000, "Amount seems too large");

export const uuidSchema = z.string().uuid("Invalid ID");

export const addTransactionSchema = z.object({
  amount: amountSchema,
  description: z.string().max(200, "Too long"),
  category_id: uuidSchema,
  receipt_path: z.string(),
});

export const updateTransactionSchema = addTransactionSchema.partial().extend({
  id: uuidSchema,
});

// Profile schema
export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, "At least 2 characters")
    .max(50, "50 characters max")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Letters, numbers, spaces only"),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[0-9]/, "At least one number"),
});
