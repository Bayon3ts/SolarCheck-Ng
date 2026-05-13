import { z } from "zod";

/* ═══════════════════════════════════════ */
/* SolarCheck Nigeria — Zod Validations    */
/* Server-side + client-side validation    */
/* ═══════════════════════════════════════ */

// ── Nigerian states list ──
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
] as const;

export const MONTHLY_BILL_RANGES = [
  "₦5,000 - ₦15,000",
  "₦15,000 - ₦30,000",
  "₦30,000 - ₦50,000",
  "₦50,000 - ₦100,000",
  "₦100,000 - ₦200,000",
  "₦200,000 - ₦500,000",
  "₦500,000+",
] as const;

export const SYSTEM_SIZES = [
  "1KVA", "2KVA", "3KVA", "5KVA", "7.5KVA", "10KVA", "10KVA+",
] as const;

export const SERVICES = [
  "residential",
  "commercial",
  "industrial",
  "maintenance",
  "battery-storage",
] as const;

export const SUBSCRIPTION_TIERS = ["free", "featured", "premium"] as const;

// ── Lead submission schema ──
export const leadSubmitSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Phone number is too long")
    .regex(/^[\d+\-\s()]+$/, "Invalid phone format"),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  state: z.enum(NIGERIAN_STATES, { message: "Select a valid state" }),
  city: z.string().optional(),
  monthly_bill_range: z.string().min(1, "Select your monthly bill range"),
  system_size_interest: z.string().optional(),
  ownership_status: z.enum(["own", "rent"]).optional(),
  timeline: z.enum(["asap", "1-3months", "researching"]).optional(),
  message: z.string().max(500, "Message is too long").optional(),
  lead_type: z.enum(["shared", "exclusive"]).default("shared"),
});

// ── Review submission schema ──
export const reviewSubmitSchema = z.object({
  installer_id: z.string().uuid("Invalid installer ID"),
  reviewer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  reviewer_phone: z.string().optional(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title is too long"),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review is too long"),
  system_size: z.string().optional(),
  install_date: z.string().optional(),
});

// ── Installer registration schema ──
export const installerRegistrationSchema = z.object({
  company_name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(200),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15),
  whatsapp: z.string().optional(),
  state: z.enum(NIGERIAN_STATES),
  city: z.string().min(1, "City is required"),
  lga: z.string().optional(),
  address: z.string().min(5, "Enter a valid address").max(300),
  cac_number: z.string().optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  services: z
    .array(z.string())
    .min(1, "Select at least one service"),
  system_sizes: z.array(z.string()),
  brands_used: z.array(z.string()),
  plan: z.enum(SUBSCRIPTION_TIERS).default("free"),
});

// ── Calculator submission schema ──
export const calculatorSubmitSchema = z.object({
  monthly_bill: z
    .number()
    .min(5000, "Minimum bill is ₦5,000")
    .max(500000, "Maximum bill is ₦500,000"),
  appliances: z.record(z.string(), z.boolean()),
  state: z.enum(NIGERIAN_STATES),
  phone: z.string().optional(),
});

// ── Paystack webhook schema ──
export const paystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string(),
    status: z.string(),
    amount: z.number(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

// ── Inferred types ──
export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;
export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
export type InstallerRegistrationInput = z.infer<typeof installerRegistrationSchema>;
export type CalculatorSubmitInput = z.infer<typeof calculatorSubmitSchema>;
export type PaystackWebhookPayload = z.infer<typeof paystackWebhookSchema>;
