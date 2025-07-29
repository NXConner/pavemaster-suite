-- PHASE 1: Critical Security Fixes (Fixed Syntax)

-- Enable RLS on critical tables that lack protection
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Fix privilege escalation vulnerability in user_profiles
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create secure policies that prevent role/admin escalation
CREATE POLICY "Users can update own profile safely" ON public.user_profiles
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile safely" ON public.user_profiles
FOR INSERT 
WITH CHECK (
  id = auth.uid() AND
  (role = 'user' OR role IS NULL) AND
  (is_admin = false OR is_admin IS NULL)
);

-- Add missing RLS policies for tables with RLS enabled but no policies

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

-- Secure database functions with proper search_path and SECURITY DEFINER
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

-- Add role change prevention trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can change roles
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
    ) THEN
      RAISE EXCEPTION 'Insufficient privileges to change role or admin status';
    END IF;
    
    -- Log the role change
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      'role_change',
      'user_profile', 
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_is_admin', OLD.is_admin,
        'new_is_admin', NEW.is_admin
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role change prevention
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();