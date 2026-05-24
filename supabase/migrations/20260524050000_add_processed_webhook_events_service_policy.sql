-- Add explicit service-role-only access for the PayRex webhook idempotency ledger.
--
-- processed_webhook_events has RLS enabled and is used only by the server-side
-- PayRex webhook route through the Supabase service-role key. Learners/admin
-- browser sessions should not read or write this ledger.

BEGIN;

REVOKE ALL ON TABLE public.processed_webhook_events FROM anon;
REVOKE ALL ON TABLE public.processed_webhook_events FROM authenticated;

GRANT SELECT, INSERT ON TABLE public.processed_webhook_events TO service_role;

DROP POLICY IF EXISTS "processed_webhook_events_service_select" ON public.processed_webhook_events;
CREATE POLICY "processed_webhook_events_service_select"
  ON public.processed_webhook_events
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "processed_webhook_events_service_insert" ON public.processed_webhook_events;
CREATE POLICY "processed_webhook_events_service_insert"
  ON public.processed_webhook_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMIT;
