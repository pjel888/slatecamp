-- Migration: Migrate LemonSqueezy to LemonSqueezy
-- Generated: 2026-04-07

-- 1. Rename columns in user_subscriptions
ALTER TABLE user_subscriptions RENAME COLUMN lemon_squeezy_customer_id TO lemonsqueezy_customer_id;
ALTER TABLE user_subscriptions RENAME COLUMN lemon_squeezy_subscription_id TO lemonsqueezy_subscription_id;

-- 2. Update existing data (optional, depends if IDs are compatible, usually not but we keep them for history or null them)
-- For now, we just rename the columns to maintain the schema structure.

-- 3. Add comment for clarity
COMMENT ON COLUMN user_subscriptions.lemonsqueezy_customer_id IS 'LemonSqueezy customer identifier';
COMMENT ON COLUMN user_subscriptions.lemonsqueezy_subscription_id IS 'LemonSqueezy subscription identifier';

