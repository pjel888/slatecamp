-- CAGE: Store session key server-side for HMAC verification
-- See: .ai/09_archive/store/RESEARCH/2026-04-08_RESEARCH_cage-session-key-storage-proposal.md

ALTER TABLE quiz_sessions
ADD COLUMN IF NOT EXISTS cage_session_key TEXT;

COMMENT ON COLUMN quiz_sessions.cage_session_key IS
  'CAGE HMAC signing key (64-char hex string from randomBytes(32)). Service role only — no RLS policy grants client access. Null if CAGE unavailable at session start.';
