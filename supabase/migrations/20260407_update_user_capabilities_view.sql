-- Migration: 20260407_update_user_capabilities_view.sql
-- Purpose: Update user_capabilities view to join user_subscriptions instead of hardcoded 'free'
-- Depends on: 20260407_user_subscriptions.sql

CREATE OR REPLACE VIEW user_capabilities AS
SELECT
  p.user_id,
  p.email,
  COALESCE(us.tier::TEXT, 'free') AS subscription_tier,
  COALESCE(us.status::TEXT, 'active') AS subscription_status,
  ur.role AS user_role
FROM profiles p
LEFT JOIN user_subscriptions us ON p.user_id = us.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
