-- Add intent_score to leads table for Lead Qualification
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intent_score INTEGER DEFAULT 0;

-- Optional: Create an index if we want to sort or filter leads by intent in the dashboard quickly
CREATE INDEX IF NOT EXISTS idx_leads_intent ON leads(intent_score DESC);
