-- Create the check_user_admin_role RPC function used by middleware
-- This was missing, causing all /admin access to redirect to /dashboard
CREATE OR REPLACE FUNCTION public.check_user_admin_role(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
        AND role IN ('super_admin', 'content_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
