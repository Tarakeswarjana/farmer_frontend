import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, "Use at least 6 letters")
  .max(72, "Password is too long");

export const phoneSchema = z
  .string()
  .min(10, "Enter a 10 digit phone number")
  .max(15, "Enter a 10 digit phone number");

export const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your phone or email"),
  password: z.string().min(1, "Enter your password"),
});

export const registerAccountSchema = z.object({
  name: z.string().min(2).max(80),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  password: passwordSchema,
  role: z.enum(["FARMER", "BUYER", "TRADER", "RETAILER", "RESTAURANT", "TRANSPORTER"]),
});

export const verifyPhoneSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Enter the 6 digit code"),
});

export const resetSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6),
  newPassword: passwordSchema,
});

export const listingDraftSchema = z.object({
  cropId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Choose a vegetable"),
  quantity: z.coerce.number().int().positive(),
  unit: z.enum(["KG", "QUINTAL", "TONNE", "PIECE", "BUNDLE", "CRATE"]),
  expectedPrice: z.coerce.number().positive(),
  qualityGrade: z.enum(["A", "B", "C"]),
  harvestDate: z.string().min(8),
  marketId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().or(z.literal("")),
  district: z.string().min(2).optional().or(z.literal("")),
});

export const offerSchema = z.object({
  quantity: z.coerce.number().int().positive(),
  offeredPrice: z.coerce.number().positive(),
  message: z.string().max(500).optional().or(z.literal("")),
});

export const requirementSchema = z.object({
  cropId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  quantity: z.coerce.number().int().positive(),
  unit: z.enum(["KG", "QUINTAL", "TONNE", "PIECE", "BUNDLE", "CRATE"]),
  targetPrice: z.coerce.number().positive(),
  requiredDate: z.string().min(8),
  marketId: z.string().optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export const disputeSchema = z.object({
  reason: z.enum(["Quantity mismatch", "Quality issue", "Payment issue", "Late delivery", "Wrong vegetable", "Other"]),
  description: z.string().min(10).max(2000),
});

export const locationSchema = z.object({
  longitude: z.coerce.number().gte(-180).lte(180),
  latitude: z.coerce.number().gte(-90).lte(90),
});
