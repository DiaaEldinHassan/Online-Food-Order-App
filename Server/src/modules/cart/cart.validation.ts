import { z } from "zod";

export const addToCartSchema = z.object({
  menuItemId: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional()
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive()
});
