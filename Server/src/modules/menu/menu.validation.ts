import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  cuisineType: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  location: z.object({
    address: z.string().optional(),
    coordinates: z.array(z.number()).optional()
  }).optional(),
  menu: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    price: z.number().positive(),
    category: z.string().optional(),
    image: z.string().optional(),
    isAvailable: z.boolean().optional()
  })).optional()
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const createMenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string().optional(),
  image: z.string().optional(),
  isAvailable: z.boolean().optional()
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
