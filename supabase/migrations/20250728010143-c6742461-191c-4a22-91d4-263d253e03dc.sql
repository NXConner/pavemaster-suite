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