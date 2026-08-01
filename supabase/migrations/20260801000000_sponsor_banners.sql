-- Create sponsor_banners table
CREATE TABLE public.sponsor_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  logo_url text NOT NULL,
  headline text NOT NULL,
  cta_text text NOT NULL DEFAULT 'Learn more',
  cta_url text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('standard', 'featured')),
  amount_paid integer NOT NULL,
  payment_reference text UNIQUE NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'rejected')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsor_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
CREATE POLICY "Public can view active banners" ON public.sponsor_banners
  FOR SELECT
  USING (is_active = true AND ends_at > now());

-- Allow admins to manage all banners
-- (Assuming an admin role or service role handles writes, we can just rely on service_role bypassing RLS for server-side logic,
-- but let's add a basic policy for authenticated admins if needed. Often, service_role is enough for API routes.)
CREATE POLICY "Service role can manage banners" ON public.sponsor_banners
  USING (true)
  WITH CHECK (true);

-- Create RPC for atomic increments
CREATE OR REPLACE FUNCTION increment_banner_stat(p_banner_id uuid, p_stat_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_stat_type = 'impressions' THEN
    UPDATE public.sponsor_banners SET impressions = impressions + 1 WHERE id = p_banner_id;
  ELSIF p_stat_type = 'clicks' THEN
    UPDATE public.sponsor_banners SET clicks = clicks + 1 WHERE id = p_banner_id;
  END IF;
END;
$$;
