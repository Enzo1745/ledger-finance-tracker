import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().refine((n) => n !== 0, "Amount cannot be zero"),
  description: z.string().max(200),
  category_id: z.string().uuid("Pick a category"),
  receipt_path: z.string(),
});
