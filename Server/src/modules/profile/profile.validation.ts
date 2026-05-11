import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  address: z.object({
    title: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }).optional(),
});

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const fileSchema = z.object({
  originalname: z.string(),
  size: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),
  mimetype: z
    .string()
    .refine((type) => ACCEPTED_IMAGE_TYPES.includes(type), {
      message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
    }),
  buffer: z.any().refine((val) => val instanceof Buffer, "Invalid file data"),
});