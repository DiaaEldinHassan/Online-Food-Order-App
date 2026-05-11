import { z } from "zod";

export const placeOrderSchema = z.object({
  restaurantId: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    name: z.string(),
    quantity: z.number().int().positive(),
    priceAtPurchase: z.number().positive()
  })),
  totalAmount: z.number().positive(),
  paymentMethod: z.enum(["online", "cod"]),
  deliveryAddress: z.object({
    title: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    isDefault: z.boolean().optional()
  }).optional()
});

export const cancelOrderSchema = z.object({
  reason: z.string().optional()
});
