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
  price_per_watt?: number;
  subscription_tier: string;
  business_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  photo_urls?: string[];
  logo_url?: string;
  cover_image_url?: string;
  video_url?: string;
  is_active: boolean;
  states_covered?: string[];
  workflow?: WorkflowStep[];



  warranty_workmanship?: string;
  warranty_roof_leak?: string;
  warranty_equipment?: string;
  languages_spoken?: string[];
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
  price_per_watt?: number;
  services: string[];
  logo_url?: string;
}
