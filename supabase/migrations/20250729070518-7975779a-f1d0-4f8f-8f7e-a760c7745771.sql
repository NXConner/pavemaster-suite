-- Phase 1: Critical Database Security Fixes (Fixed version)

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

DROP POLICY IF EXISTS "Users can view budget categories" ON public.budget_categories;
CREATE POLICY "Users can view budget categories" ON public.budget_categories
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage budget categories" ON public.budget_categories;
CREATE POLICY "Admins can manage budget categories" ON public.budget_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Add missing RLS policies for sensitive operations
DROP POLICY IF EXISTS "Admins can manage budget allocations" ON public.budget_allocations;
CREATE POLICY "Admins can manage budget allocations" ON public.budget_allocations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

DROP POLICY IF EXISTS "Admins can manage asset assignments" ON public.asset_assignments;
CREATE POLICY "Admins can manage asset assignments" ON public.asset_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

DROP POLICY IF EXISTS "Admins can manage employee violations" ON public.employee_violations;
CREATE POLICY "Admins can manage employee violations" ON public.employee_violations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- 3. Enhanced security functions
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