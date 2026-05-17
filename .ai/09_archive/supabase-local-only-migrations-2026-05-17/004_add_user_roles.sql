-- Migration: 004_add_user_roles.sql
-- Phase 4: Admin & Content Operations
-- Creates user_roles table for role-based access control

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'sme_reviewer')),
    created_at timestamptz DEFAULT NOW() NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'content_admin')
    );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
    );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is SME reviewer
CREATE OR REPLACE FUNCTION public.can_review_content()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'content_admin', 'sme_reviewer')
    );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy for questions table - admins only
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
CREATE POLICY "Admins can manage questions"
    ON public.questions
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());

-- RLS policy for wiki_articles table - admins only
DROP POLICY IF EXISTS "Admins can manage wiki_articles" ON public.wiki_articles;
CREATE POLICY "Admins can manage wiki_articles"
    ON public.wiki_articles
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());

-- RLS policy for taxonomy_tree table - admins only
DROP POLICY IF EXISTS "Admins can manage taxonomy_tree" ON public.taxonomy_tree;
CREATE POLICY "Admins can manage taxonomy_tree"
    ON public.taxonomy_tree
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());

-- Add SELECT policy for everyone
DROP POLICY IF EXISTS "Users can read taxonomy tree" ON public.taxonomy_tree;
CREATE POLICY "Users can read taxonomy tree"
    ON public.taxonomy_tree
    FOR SELECT
    USING (true);

-- RLS policy for models_3d table - admins only
DROP POLICY IF EXISTS "Admins can manage models_3d" ON public.models_3d;
CREATE POLICY "Admins can manage models_3d"
    ON public.models_3d
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());

-- Insert current admin as super_admin (your email)
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
    id,
    'super_admin',
    id
FROM auth.users
WHERE email = 'philipjonlewis@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
