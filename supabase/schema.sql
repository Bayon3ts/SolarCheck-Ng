-- ═══════════════════════════════════════
-- SolarCheck Nigeria — Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════
-- TABLE: installers
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS installers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  lga TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  cac_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'featured', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  services TEXT[] DEFAULT '{}',
  system_sizes TEXT[] DEFAULT '{}',
  brands_used TEXT[] DEFAULT '{}',
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_installers_state ON installers(state);
CREATE INDEX idx_installers_city ON installers(city);
CREATE INDEX idx_installers_slug ON installers(slug);
CREATE INDEX idx_installers_active_verified ON installers(is_active, is_verified);
CREATE INDEX idx_installers_tier_rating ON installers(subscription_tier DESC, average_rating DESC);

-- ═══════════════════════════════════════
-- TABLE: leads
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id UUID REFERENCES installers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  state TEXT NOT NULL,
  city TEXT,
  monthly_bill_range TEXT,
  system_size_interest TEXT,
  ownership_status TEXT CHECK (ownership_status IN ('own', 'rent')),
  timeline TEXT CHECK (timeline IN ('asap', '1-3months', 'researching')),
  message TEXT,
  lead_type TEXT DEFAULT 'shared' CHECK (lead_type IN ('shared', 'exclusive')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted')),
  whatsapp_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_installer ON leads(installer_id);
CREATE INDEX idx_leads_state ON leads(state);
CREATE INDEX idx_leads_status ON leads(status);

-- ═══════════════════════════════════════
-- TABLE: reviews
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id UUID REFERENCES installers(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  system_size TEXT,
  install_date DATE,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_installer ON reviews(installer_id);
CREATE INDEX idx_reviews_published ON reviews(is_published);

-- ═══════════════════════════════════════
-- TABLE: blog_posts
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL,
  read_time INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(is_published);

-- ═══════════════════════════════════════
-- TABLE: nigerian_locations
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS nigerian_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  lga TEXT NOT NULL,
  installer_count INTEGER DEFAULT 0
);

CREATE INDEX idx_locations_state ON nigerian_locations(state);
CREATE INDEX idx_locations_city ON nigerian_locations(city);
CREATE UNIQUE INDEX idx_locations_unique ON nigerian_locations(state, city, lga);

-- ═══════════════════════════════════════
-- TABLE: installer_subscriptions
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS installer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id UUID REFERENCES installers(id) ON DELETE CASCADE NOT NULL,
  paystack_reference TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_subscriptions_installer ON installer_subscriptions(installer_id);

-- ═══════════════════════════════════════
-- TABLE: calculator_submissions
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS calculator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_bill INTEGER NOT NULL,
  appliances JSONB DEFAULT '{}',
  estimated_system_size TEXT,
  estimated_cost_min INTEGER,
  estimated_cost_max INTEGER,
  state TEXT,
  phone TEXT,
  converted_to_lead BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nigerian_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_submissions ENABLE ROW LEVEL SECURITY;

-- Installers: Public read for active installers, authenticated write for own
CREATE POLICY "Public can read active installers"
  ON installers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anon can insert installer registrations"
  ON installers FOR INSERT
  WITH CHECK (true);

-- Leads: Anon can insert, installers can read own leads
CREATE POLICY "Anon can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role full access to leads"
  ON leads FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reviews: Public read for published, anon can insert
CREATE POLICY "Public can read published reviews"
  ON reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anon can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Blog: Public read for published
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Locations: Public read
CREATE POLICY "Public can read locations"
  ON nigerian_locations FOR SELECT
  USING (true);

-- Subscriptions: Service role only (managed server-side)
CREATE POLICY "Service role manages subscriptions"
  ON installer_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Calculator: Anon can insert, service role reads
CREATE POLICY "Anon can submit calculator results"
  ON calculator_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role reads calculator submissions"
  ON calculator_submissions FOR SELECT
  USING (true);

-- ═══════════════════════════════════════
-- FUNCTION: Auto-update installer ratings
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_installer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE installers
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE installer_id = COALESCE(NEW.installer_id, OLD.installer_id)
      AND is_published = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE installer_id = COALESCE(NEW.installer_id, OLD.installer_id)
      AND is_published = true
    )
  WHERE id = COALESCE(NEW.installer_id, OLD.installer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installer_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_installer_rating();

-- ═══════════════════════════════════════
-- FUNCTION: Auto-increment installer lead count
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_installer_leads()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.installer_id IS NOT NULL THEN
    UPDATE installers
    SET total_leads = total_leads + 1
    WHERE id = NEW.installer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_leads
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION increment_installer_leads();
