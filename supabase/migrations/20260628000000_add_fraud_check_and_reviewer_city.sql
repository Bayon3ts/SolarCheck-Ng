-- Migration: Add fraud_check_source and reviewer_city

-- Add fraud_check_source to leads table
-- Expected values (enum-like): 'battery_detector', 'controller_detector'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fraud_check_source TEXT;

-- Add reviewer_city to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_city TEXT;
