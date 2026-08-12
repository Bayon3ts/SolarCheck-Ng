-- Migration: Add workflow column to installers table
ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS workflow JSONB DEFAULT '[]';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
