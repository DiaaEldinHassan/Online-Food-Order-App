import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9+_.-]+@(gmail|yahoo|hotmail|outlook)\.(com|net)(\.edu|\.eg)?$/;

export const signUpSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().regex(emailRegex, "Invalid email provider or format"),
  password: z.string().min(8),
  bio: z.string().optional(),
  profilePicture: z.string().url().optional(),
  phone: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email provider or format"),
  password: z.string().min(8),
});

export const sendOtpSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email provider or format"),
});

export const verifyOtpSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email provider or format"),
  otp: z.string().length(6),
});

export const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});
