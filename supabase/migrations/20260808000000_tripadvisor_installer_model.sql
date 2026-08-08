-- Migration: TripAdvisor Installer Model

-- 1. Add new columns to `installers` table
ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_in_business TEXT,
  ADD COLUMN IF NOT EXISTS crew_size TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';

-- 2. Create the public storage bucket for installer media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'installer_public_media',
  'installer_public_media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for the storage bucket
-- Allow public read access to all objects in the bucket
CREATE POLICY "Public Access for installer_public_media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'installer_public_media');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload to installer_public_media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'installer_public_media');

CREATE POLICY "Authenticated users can update installer_public_media" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'installer_public_media');

CREATE POLICY "Authenticated users can delete from installer_public_media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'installer_public_media');
