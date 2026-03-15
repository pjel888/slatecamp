-- Migration: 007_add_audit_logs.sql
-- Phase 4: Audit Logging
-- Creates audit_logs table for tracking admin actions

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'VIEW', 'EXPORT')),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  content_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(table_name, record_id);

-- Enable RLS (read-only for super_admin, inserts via trigger)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only super_admin can read audit logs
CREATE POLICY "Super admins can read audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  audit_row audit_logs%ROWTYPE;
  changed_fields TEXT[] := NULL;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    -- Skip logging if no user (e.g., system operations)
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;
  
  audit_row.actor_id := current_user_id;
  audit_row.table_name := TG_TABLE_NAME;
  audit_row.created_at := NOW();
  
  IF TG_OP = 'INSERT' THEN
    audit_row.event_type := 'CREATE';
    audit_row.record_id := NEW.id;
    audit_row.content_snapshot := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    audit_row.event_type := 'UPDATE';
    audit_row.record_id := NEW.id;
    audit_row.content_snapshot := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    
    -- Track changed fields
    IF OLD IS NOT NULL AND NEW IS NOT NULL THEN
      changed_fields := ARRAY(
        SELECT key
        FROM jsonb_object_keys(to_jsonb(NEW)) AS key
        WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
      );
      audit_row.metadata := jsonb_build_object('changed_fields', changed_fields);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    audit_row.event_type := 'DELETE';
    audit_row.record_id := OLD.id;
    audit_row.content_snapshot := to_jsonb(OLD);
  END IF;
  
  INSERT INTO audit_logs VALUES (audit_row.*);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS audit_questions ON public.questions;
CREATE TRIGGER audit_questions
  AFTER INSERT OR UPDATE OR DELETE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_wiki_articles ON public.wiki_articles;
CREATE TRIGGER audit_wiki_articles
  AFTER INSERT OR UPDATE OR DELETE ON public.wiki_articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_models_3d ON public.models_3d;
CREATE TRIGGER audit_models_3d
  AFTER INSERT OR UPDATE OR DELETE ON public.models_3d
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
