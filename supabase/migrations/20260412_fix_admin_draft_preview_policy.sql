-- Align admin_draft_previews access with the current admin role model.
-- The original policy checked for role = 'admin', which is stale in this codebase.

DROP POLICY IF EXISTS "Admins have full access to draft previews"
  ON public.admin_draft_previews;

CREATE POLICY "Content admins manage draft previews"
  ON public.admin_draft_previews
  FOR ALL
  TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());
