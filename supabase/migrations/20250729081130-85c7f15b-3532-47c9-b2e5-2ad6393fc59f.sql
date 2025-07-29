-- Critical Security Fixes Migration (Safe Version)
-- This migration addresses security vulnerabilities while handling existing policies

-- PART 1: Fix Function Search Path Security Issues (with IF NOT EXISTS where applicable)
-- Secure all functions by setting search_path to prevent SQL injection

CREATE OR REPLACE FUNCTION public.validate_input_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins or super_admins can change roles
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
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'user'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result jsonb;
    tables_with_rls integer;
    tables_without_rls integer;
    total_policies integer;
BEGIN
    -- Count tables with and without RLS
    SELECT 
        COUNT(*) FILTER (WHERE relrowsecurity = true),
        COUNT(*) FILTER (WHERE relrowsecurity = false)
    INTO tables_with_rls, tables_without_rls
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relkind = 'r';
    
    -- Count total policies
    SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
    
    result := jsonb_build_object(
        'tables_with_rls', tables_with_rls,
        'tables_without_rls', tables_without_rls,
        'total_policies', total_policies,
        'admin_configured', EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE email = 'n8ter8@gmail.com' 
            AND role = 'super_admin' 
            AND is_admin = true
        ),
        'security_audit_log_exists', EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'security_audit_log' 
            AND schemaname = 'public'
        ),
        'timestamp', now()
    );
    
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT is_admin OR role = 'super_admin' FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_count integer;
  time_threshold timestamp with time zone;
BEGIN
  time_threshold := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE created_at < time_threshold;
  
  -- Get current count for this identifier and action
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND created_at >= time_threshold;
  
  -- Check if under limit
  IF current_count < p_limit THEN
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET count = public.rate_limits.count + 1, created_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- PART 2: Create missing tables for security if they don't exist
-- Create security_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create rate_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- PART 3: Add role escalation protection trigger
CREATE OR REPLACE FUNCTION public.prevent_self_role_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent users from modifying their own role unless they're super_admin
  IF OLD.id = auth.uid() AND (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin) THEN
    IF OLD.role != 'super_admin' THEN
      RAISE EXCEPTION 'Users cannot modify their own role or admin status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Apply the role protection trigger to user_profiles (safe)
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_modification();

-- PART 4: Enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log important user activities
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      'record_created',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'INSERT')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      'record_updated',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'UPDATE')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      'record_deleted',
      TG_TABLE_NAME,
      OLD.id,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'DELETE')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- PART 5: Add indexes for better performance on security-related queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON public.rate_limits(created_at);

-- PART 6: Ensure all tables have RLS enabled (safe operation)
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('spatial_ref_sys')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
  END LOOP;
END $$;

-- PART 7: Create essential RLS policies for security tables (safe with DROP IF EXISTS)
-- Security audit log policies
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_log;
CREATE POLICY "Admins can view security logs" ON public.security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;
CREATE POLICY "System can insert security logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- Rate limits policies
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);