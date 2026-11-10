import { z } from "zod";
import { PLATFORMS, PROVINCES } from "./constants";

const platformEnum = z.enum(PLATFORMS as unknown as [string, ...string[]]);
const provinceEnum = z.enum(PROVINCES as unknown as [string, ...string[]]);

export const registerSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(100),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  role: z.enum(["DRIVER", "OWNER"]),
  popiaConsent: z
    .boolean()
    .refine((v) => v === true, { message: "POPIA consent is required" }),
});

export const listingSchema = z.object({
  kind: z.enum(["motorcycle", "car"]),
  make: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60),
  province: provinceEnum,
  price: z.coerce.number().int().min(1).max(1_000_000),
  period: z.enum(["day", "week", "month"]),
  platforms: z.array(platformEnum).min(1).max(8),
  description: z.string().trim().min(10).max(1000),
  phone: z.string().trim().min(7).max(25),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export const requestSchema = z.object({
  kind: z.enum(["motorcycle", "car", "either"]),
  city: z.string().trim().min(2).max(60),
  province: provinceEnum,
  budgetMax: z.coerce.number().int().min(1).max(1_000_000).optional().nullable(),
  period: z.enum(["day", "week", "month"]),
  platforms: z.array(platformEnum).min(1).max(8),
  details: z.string().trim().min(10).max(1200),
});

export const enquirySchema = z.object({
  listingId: z.string().cuid(),
  message: z.string().trim().min(10).max(1200),
});

export const requestReplySchema = z.object({
  requestId: z.string().cuid(),
  message: z.string().trim().min(10).max(1200),
});

export const reportSchema = z.object({
  targetType: z.enum(["LISTING", "REQUEST", "USER", "ENQUIRY"]),
  targetId: z.string().min(1).max(64),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(1000).optional(),
});

export const adminModerationSchema = z.object({
  action: z.enum([
    "approve_listing",
    "reject_listing",
    "remove_listing",
    "pause_listing",
    "dismiss_report",
    "action_report",
    "suspend_user",
    "unsuspend_user",
  ]),
  listingId: z.string().cuid().optional(),
  reportId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  note: z.string().trim().max(500).optional(),
});
