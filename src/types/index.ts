/* ═══════════════════════════════════════ */
/* SolarCheck Nigeria — Database Types     */
/* Mirrors Supabase schema exactly         */
/* ═══════════════════════════════════════ */

export type SubscriptionTier = "free" | "featured" | "premium";
export type LeadType = "shared" | "exclusive";
export type LeadStatus = "new" | "contacted" | "quoted" | "converted";
export type OwnershipStatus = "own" | "rent";
export type Timeline = "asap" | "1-3months" | "researching";

export interface Installer {
  id: string;
  slug: string;
  company_name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  state: string;
  city: string;
  lga: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  cac_number: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  services: string[];
  system_sizes: string[];
  brands_used: string[];
  average_rating: number;
  total_reviews: number;
  total_leads: number;
  created_at: string;
}

export interface Lead {
  id: string;
  installer_id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  state: string;
  city: string;
  monthly_bill_range: string | null;
  system_size_interest: string | null;
  ownership_status: OwnershipStatus | null;
  timeline: Timeline | null;
  message: string | null;
  lead_type: LeadType;
  status: LeadStatus;
  whatsapp_sent: boolean;
  email_sent: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  installer_id: string;
  reviewer_name: string;
  reviewer_phone: string | null;
  rating: number;
  title: string;
  body: string;
  system_size: string | null;
  install_date: string | null;
  is_verified: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  author: string;
  read_time: number;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

export interface NigerianLocation {
  id: string;
  state: string;
  city: string;
  lga: string;
  installer_count: number;
}

export interface InstallerSubscription {
  id: string;
  installer_id: string;
  paystack_reference: string;
  plan: string;
  amount: number;
  status: string;
  starts_at: string;
  expires_at: string;
}

export interface CalculatorSubmission {
  id: string;
  monthly_bill: number;
  appliances: Record<string, unknown>;
  estimated_system_size: string;
  estimated_cost_min: number;
  estimated_cost_max: number;
  state: string;
  phone: string | null;
  converted_to_lead: boolean;
  created_at: string;
}

/* ── API Response types ── */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/* ── Form input types ── */

export interface LeadFormInput {
  full_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  state: string;
  city?: string;
  monthly_bill_range: string;
  system_size_interest?: string;
  ownership_status?: OwnershipStatus;
  timeline?: Timeline;
  message?: string;
  lead_type?: LeadType;
}

export interface ReviewFormInput {
  installer_id: string;
  reviewer_name: string;
  reviewer_phone?: string;
  rating: number;
  title: string;
  body: string;
  system_size?: string;
  install_date?: string;
}

export interface InstallerRegistrationInput {
  company_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  state: string;
  city: string;
  lga?: string;
  address: string;
  cac_number?: string;
  description: string;
  website?: string;
  services: string[];
  system_sizes: string[];
  brands_used: string[];
  plan: SubscriptionTier;
}

export interface CalculatorInput {
  monthly_bill: number;
  appliances: Record<string, boolean>;
  state: string;
  phone?: string;
}
