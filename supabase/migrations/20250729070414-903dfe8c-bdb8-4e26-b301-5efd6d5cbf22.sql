-- Phase 1: Critical Database Security Fixes

-- 1. Fix search_path in security-sensitive functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
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

-- 2. Add missing RLS policies for critical tables

-- Budget Categories table (missing from schema but referenced)
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget categories" ON public.budget_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage budget categories" ON public.budget_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Enhance security_events table policies
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Add missing RLS policies for sensitive operations
CREATE POLICY "Admins can manage budget allocations" ON public.budget_allocations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage asset assignments" ON public.asset_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage employee violations" ON public.employee_violations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- 3. Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- 4. Create rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address, user ID, etc.
  action text NOT NULL, -- login, api_call, etc.
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);

-- 5. Enhanced security functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()),
    'user'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT is_admin OR role = 'super_admin' FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$function$;

-- 6. Improved rate limiting function with better security
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Get current count for this identifier and action
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND created_at >= window_start;
  
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