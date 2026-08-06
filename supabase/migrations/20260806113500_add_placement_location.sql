-- Add placement_location column to sponsor_banners table
ALTER TABLE public.sponsor_banners ADD COLUMN IF NOT EXISTS placement_location text NOT NULL DEFAULT 'calculator' CHECK (placement_location IN ('calculator', 'directory', 'guides'));
