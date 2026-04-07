-- Migration: 20260407_webhook_idempotency.sql
-- Purpose: Track processed webhook events to prevent duplicate processing

CREATE TABLE IF NOT EXISTS processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT,
    processed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(provider, event_id)
);

-- Enable RLS
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (webhooks use admin client)
-- No user-facing policies needed
