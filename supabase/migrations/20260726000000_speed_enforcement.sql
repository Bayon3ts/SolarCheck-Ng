-- Add columns for Speed Enforcement
ALTER TABLE leads ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS missed_installer_ids UUID[] DEFAULT '{}'::UUID[];

-- Optional: Create an index for the cron job to find stale leads quickly
CREATE INDEX IF NOT EXISTS idx_leads_speed_enforcement ON leads (status, matched_at) WHERE status = 'new' AND accepted_at IS NULL;
