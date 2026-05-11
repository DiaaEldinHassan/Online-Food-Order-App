import { z } from "zod";

export const processPaymentSchema = z.object({
  orderId: z.string(),
  method: z.enum(["online", "cod"]),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional()
});
