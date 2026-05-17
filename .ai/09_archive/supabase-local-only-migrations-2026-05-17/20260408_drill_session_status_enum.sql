-- Add missing session_status enum values required by the drill feature
-- See: .ai/09_archive/store/IMPLEMENTED/2026-04-08_DONE_drill-optimization-implementation.md Section 02, Fix 2C

ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'auto_submitted';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'configuring';
