-- Add soft delete column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
