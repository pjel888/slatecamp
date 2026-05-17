-- Migration: 20260412_unify_owner_rbac_and_rls.sql
-- Description: Unifies RBAC and RLS policies across all tables to correctly include the 'owner' role and other newly added staff roles.
-- This migration ensures that 'owner' has the highest privilege level, matching the TypeScript entitlement policy.

-- 1. Update user_roles table check constraint to include all recognized roles
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('owner', 'super_admin', 'content_admin', 'sme_reviewer', 'admin', 'developer', 'ceo'));

-- 2. Update functions to include 'owner' and other staff roles correctly

-- Update is_ceo_or_super_admin to include owner
CREATE OR REPLACE FUNCTION public.is_ceo_or_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('owner', 'super_admin', 'ceo')
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'super_admin', 'ceo')
  );
$$;

-- Update check_user_admin_role (used by middleware/RPC) to be broad
CREATE OR REPLACE FUNCTION public.check_user_admin_role(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check user_roles table
    IF EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
        AND role IN ('owner', 'super_admin', 'content_admin', 'admin', 'developer', 'ceo', 'sme_reviewer')
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check profiles table (legacy/compatibility)
    IF EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
        AND role IN ('owner', 'super_admin', 'content_admin', 'admin', 'developer', 'ceo', 'sme_reviewer')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update audit_logs RLS to include owner
DROP POLICY IF EXISTS "Super admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Super admins and owners can read audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- 4. Update user_roles RLS
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 5. Ensure has_admin_role is consistent (should have been updated by 20260412_update_has_admin_role_function.sql but re-affirming here for safety)
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
  BEGIN
    -- Check user_roles table
    IF EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'super_admin', 'content_admin', 'admin', 'developer', 'ceo', 'sme_reviewer')
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check profiles table
    IF EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'super_admin', 'content_admin', 'admin', 'developer', 'ceo', 'sme_reviewer')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
