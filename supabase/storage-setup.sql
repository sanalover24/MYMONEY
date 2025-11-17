-- ============================================
-- Supabase Storage Bucket Configuration
-- ============================================
-- This file sets up storage buckets for file uploads
-- Run this in your Supabase SQL Editor

-- Create receipts bucket for transaction receipt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Receipts Bucket

-- Allow authenticated users to upload their own receipts
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own receipts
CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own receipts
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Note: To enable Google OAuth
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials:
--    - Client ID
--    - Client Secret
-- 4. Add redirect URL: http://localhost:5173/#/dashboard (for local dev)
--    and your production URL for production

