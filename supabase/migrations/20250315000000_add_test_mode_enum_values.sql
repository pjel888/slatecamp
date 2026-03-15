-- Add missing test_mode enum values for app modes (chill, storm, etc.)
-- Safe for DBs that already have the type with only ('camp', 'timed', 'practice').
-- IF NOT EXISTS requires Postgres 15+ (Supabase default).

ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'storm';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'chill';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'custom';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'blindspot';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'proof_sim';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'endurance';
