-- Add admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add PayRex payment tracking columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payrex_customer_id TEXT;

-- Add payment_provider column to marketplace purchases
ALTER TABLE public.marketplace_purchases
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'payrex';

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = TRUE;
