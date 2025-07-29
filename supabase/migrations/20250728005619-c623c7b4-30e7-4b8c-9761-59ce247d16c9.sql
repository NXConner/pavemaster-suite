-- PHASE 1: Critical Security Fixes
-- Fix 1: Enable RLS on unprotected tables and create missing policies

-- Enable RLS on critical tables that lack protection
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Fix 2: Critical privilege escalation vulnerability in user_profiles
-- Create updated policies that prevent users from updating role/is_admin fields
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- New secure policy for user profile updates (excludes role and is_admin)
CREATE POLICY "Users can update own profile safely" ON public.user_profiles
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevent updating role and is_admin fields
  OLD.role IS NOT DISTINCT FROM NEW.role AND
  OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin
);

-- Secure insert policy for user profiles
CREATE POLICY "Users can insert own profile safely" ON public.user_profiles
FOR INSERT 
WITH CHECK (
  id = auth.uid() AND
  -- Only allow basic user role on self-insert
  (role = 'user' OR role IS NULL) AND
  (is_admin = false OR is_admin IS NULL)
);

-- Fix 3: Add missing RLS policies for tables with RLS enabled but no policies

-- Performance reviews policies
CREATE POLICY "Users can view own performance reviews" ON public.performance_reviews
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage performance reviews" ON public.performance_reviews
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Project tasks policies
CREATE POLICY "Users can view project tasks" ON public.project_tasks
FOR SELECT 
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

CREATE POLICY "Project creators and admins can manage tasks" ON public.project_tasks
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

-- Employee certifications policies
CREATE POLICY "Users can view own certifications" ON public.employee_certifications
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "HR and admins can manage certifications" ON public.employee_certifications
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'hr_manager'))
  )
);

-- Sync status policies
CREATE POLICY "Users can view own sync status" ON public.sync_status
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sync status" ON public.sync_status
FOR ALL 
USING (user_id = auth.uid());

-- Fix 4: Secure database functions with proper search_path and SECURITY DEFINER
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
    NULL;
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

-- Fix 5: Add audit logging for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log role changes
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    PERFORM log_security_event(
      'role_change',
      'user_profile',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_is_admin', OLD.is_admin,
        'new_is_admin', NEW.is_admin,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_profiles;
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();