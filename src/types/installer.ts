export interface InstallerProfile {
  id: string;
  company_name: string;
  slug: string;
  phone?: string;
  website?: string;
  services: string[];
  system_sizes: string[];
  brands_used?: string[];
  cac_number?: string;
  years_in_business?: string;
  crew_size?: string;
  certifications?: string[];
  description?: string;
  city: string;
  state: string;
  address?: string;
  is_verified?: boolean;
  average_rating?: number;
  total_reviews: number;
  subscription_tier: string;
  business_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  photo_urls?: string[];
  logo_url?: string;
  cover_image_url?: string;
  video_url?: string;
  is_active: boolean;

  // Mockable Tripadvisor-style fields
  tagline?: string;
  demand_badge?: string;
  starting_price?: number;
  warranties?: {
    workmanship: string;
    roof_leak: string;
    equipment: string;
  };
  supported_languages?: string[];
  featured_testimonial?: string;
  recommendation_percentage?: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  installer_id: string;
  reviewer_name: string;
  reviewer_city?: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  created_at: string;
  system_size?: string;
}

export interface SimilarInstaller {
  id: string;
  company_name: string;
  slug: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
  starting_price?: number;
  services: string[];
  logo_url?: string;
}
