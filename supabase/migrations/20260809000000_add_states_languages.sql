-- Migration: Add states_covered and languages_spoken columns to installers

ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS states_covered TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{}';

-- Add missing warranty columns if they aren't there yet
ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS warranty_workmanship TEXT,
  ADD COLUMN IF NOT EXISTS warranty_roof_leak TEXT,
  ADD COLUMN IF NOT EXISTS warranty_equipment TEXT,
  ADD COLUMN IF NOT EXISTS price_per_watt NUMERIC,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
