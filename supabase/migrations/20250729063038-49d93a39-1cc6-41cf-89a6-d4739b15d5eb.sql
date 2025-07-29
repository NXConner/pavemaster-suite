-- Phase 1: Critical Database Security Fixes

-- 1. Enable RLS and create policies for tables missing them

-- Enable RLS on tables that don't have it
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies table
CREATE POLICY "Users can view companies" ON public.companies
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage companies" ON public.companies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Create RLS policies for spatial_ref_sys (read-only for authenticated users)
CREATE POLICY "Authenticated users can read spatial_ref_sys" ON public.spatial_ref_sys
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Fix database function security by adding search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.validate_input_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    IF length(regexp_replace(NEW.phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Invalid phone number format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
    SELECT COALESCE(
        (SELECT role FROM user_profiles WHERE id = auth.uid()),
        'user'
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
    SELECT COALESCE(
        (SELECT is_admin OR role = 'super_admin' FROM user_profiles WHERE id = auth.uid()),
        false
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 3. Create rate_limits table for rate limiting functionality
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier text NOT NULL,
    action text NOT NULL,
    count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL 
USING (true);

-- 4. Create security_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to view security audit logs
CREATE POLICY "Admins can view security audit log" ON public.security_audit_log
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- System can insert security events
CREATE POLICY "System can insert security events" ON public.security_audit_log
FOR INSERT 
WITH CHECK (true);

-- 5. Fix security_events table RLS policies
DROP POLICY IF EXISTS "Admins can delete security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can update security events" ON public.security_events;

CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage security events" ON public.security_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);