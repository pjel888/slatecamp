-- Migration: Update has_admin_role to include 'admin' and 'developer' roles
-- This resolves the redirect issue where users with the 'admin' role in app_metadata
-- were being blocked by RLS or failing the canReviewContent check.

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
  BEGIN
    -- 1. Check user_roles table
    IF EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'content_admin', 'admin')
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Check profiles table
    IF EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'content_admin', 'admin', 'developer', 'ceo')
    ) THEN
        RETURN TRUE;
    END IF;

    -- 3. Check auth.jwt() metadata (for app_metadata based roles)
    IF (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin', 'content_admin', 'developer', 'ceo')) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update can_review_content for SME reviewers
CREATE OR REPLACE FUNCTION public.can_review_content()
RETURNS BOOLEAN AS $$
  BEGIN
    -- 1. Check user_roles table
    IF EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'content_admin', 'sme_reviewer', 'admin')
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Check profiles table
    IF EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'content_admin', 'sme_reviewer', 'admin', 'developer', 'ceo')
    ) THEN
        RETURN TRUE;
    END IF;

    -- 3. Check auth.jwt() metadata
    IF (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin', 'content_admin', 'sme_reviewer', 'developer', 'ceo')) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

