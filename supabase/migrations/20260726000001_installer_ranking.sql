-- Add ranking_score to installers table for the Installer Ranking Algorithm
ALTER TABLE installers ADD COLUMN IF NOT EXISTS ranking_score NUMERIC(5,2) DEFAULT 0;

-- Create an index to speed up the lead matching engine
CREATE INDEX IF NOT EXISTS idx_installers_ranking ON installers(ranking_score DESC);
