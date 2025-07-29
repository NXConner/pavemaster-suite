-- Comprehensive Security Fixes Migration
-- Addresses critical RLS and security issues identified by the linter

-- 1. Enable RLS on tables that currently have RLS disabled but policies exist
-- Check which tables these are and enable RLS
DO $$ 
DECLARE
    table_record RECORD;
BEGIN
    -- Enable RLS on files table if it has policies but RLS is disabled
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files') AND 
       NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'files' AND rowsecurity = true) THEN
        ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on backups table if it has policies but RLS is disabled  
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'backups') AND 
       NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backups' AND rowsecurity = true) THEN
        ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create missing RLS policies for tables that have RLS enabled but no policies

-- Files table policies (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'Users can view their own files') THEN
    EXECUTE 'CREATE POLICY "Users can view their own files" ON public.files FOR SELECT USING (uploadedby = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'Users can upload their own files') THEN
    EXECUTE 'CREATE POLICY "Users can upload their own files" ON public.files FOR INSERT WITH CHECK (uploadedby = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'Users can update their own files') THEN
    EXECUTE 'CREATE POLICY "Users can update their own files" ON public.files FOR UPDATE USING (uploadedby = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'Users can delete their own files') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own files" ON public.files FOR DELETE USING (uploadedby = auth.uid())';
  END IF;
END $$;

-- Backups table policies (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'backups' AND policyname = 'Admins can manage backups') THEN
    EXECUTE 'CREATE POLICY "Admins can manage backups" ON public.backups FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = ''super_admin'')))';
  END IF;
END $$;

-- Jobs table policies (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Users can view jobs assigned to them') THEN
    EXECUTE 'CREATE POLICY "Users can view jobs assigned to them" ON public.jobs FOR SELECT USING (assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role IN (''super_admin'', ''project_manager''))))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Admins can manage jobs') THEN
    EXECUTE 'CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role IN (''super_admin'', ''project_manager''))))';
  END IF;
END $$;

-- Rate limits policies (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rate_limits' AND policyname = 'System can manage rate limits') THEN
    EXECUTE 'CREATE POLICY "System can manage rate limits" ON public.rate_limits FOR ALL USING (true)';
  END IF;
END $$;

-- Vehicles policies (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can view vehicles assigned to them') THEN
    EXECUTE 'CREATE POLICY "Users can view vehicles assigned to them" ON public.vehicles FOR SELECT USING (assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role IN (''super_admin'', ''fleet_manager''))))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Fleet managers can manage vehicles') THEN
    EXECUTE 'CREATE POLICY "Fleet managers can manage vehicles" ON public.vehicles FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role IN (''super_admin'', ''fleet_manager''))))';
  END IF;
END $$;

-- 3. Fix database functions to include proper search_path for security
-- Update existing functions to be more secure

-- Update handle_new_user function to include search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    CASE 
      WHEN NEW.email = 'n8ter8@gmail.com' THEN 'super_admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email = 'n8ter8@gmail.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Update validate_input_data function
CREATE OR REPLACE FUNCTION public.validate_input_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate email format in profiles
  IF TG_TABLE_NAME = 'profiles' AND NEW.email IS NOT NULL THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Validate phone format if provided
  IF TG_TABLE_NAME = 'profiles' AND NEW.phone IS NOT NULL THEN
    -- Remove all non-digit characters for validation
    IF length(regexp_replace(NEW.phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Invalid phone number format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
EXCEPTION
  WHEN others THEN
    NULL; -- Don't fail if logging fails
END;
$$;

-- Update check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  DELETE FROM rate_limits 
  WHERE window_start < (now() - (p_window_minutes || ' minutes')::interval);
  
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND window_start >= window_start;
  
  IF current_count < p_limit THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET count = rate_limits.count + 1, created_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update prevent_role_escalation function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can change roles
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
    ) THEN
      RAISE EXCEPTION 'Insufficient privileges to change role or admin status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Security audit log policy (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_log' AND policyname = 'Admins can view security audit log') THEN
    EXECUTE 'CREATE POLICY "Admins can view security audit log" ON public.security_audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = ''super_admin'')))';
  END IF;
END $$;

-- 5. Ensure all critical tables have RLS enabled
DO $$
DECLARE
    tables_to_secure text[] := ARRAY['files', 'backups', 'jobs', 'rate_limits', 'vehicles'];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;