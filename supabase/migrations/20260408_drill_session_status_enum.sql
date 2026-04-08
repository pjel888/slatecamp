-- Add missing session_status enum values required by the drill feature
-- See: .ai/plans/drill-optimization-implementation-plan-2026-04-08.md Section 02, Fix 2C

ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'auto_submitted';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'configuring';
