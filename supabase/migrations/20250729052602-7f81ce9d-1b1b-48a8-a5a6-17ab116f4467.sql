-- Final Security Fixes - Role Constraint and Admin Setup
-- Fix role constraint and complete security hardening

-- 1. First, update the role constraint to include 'super_admin'
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role::text = ANY (ARRAY[
    'admin'::text, 
    'user'::text, 
    'super_admin'::text,
    'fleet_manager'::text, 
    'operations_manager'::text, 
    'driver'::text, 
    'dispatcher'::text, 
    'maintenance'::text
]));

-- 2. Now safely update or create the admin user profile
DO $$
BEGIN
    -- Update or create admin user profile if n8ter8@gmail.com exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'n8ter8@gmail.com') THEN
        INSERT INTO public.user_profiles (id, email, role, is_admin)
        SELECT id, email, 'super_admin', true
        FROM auth.users 
        WHERE email = 'n8ter8@gmail.com'
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            is_admin = true;
    END IF;
END $$;

-- 3. Create policies for user_profiles table if they don't exist
DO $$ 
BEGIN
  -- Allow users to view all profiles (for team collaboration)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view all profiles') THEN
    EXECUTE 'CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true)';
  END IF;
  
  -- Allow users to update their own profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid())';
  END IF;
  
  -- Allow admins to insert new profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Admins can insert profiles') THEN
    EXECUTE 'CREATE POLICY "Admins can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = ''super_admin'')))';
  END IF;
END $$;

-- 4. Create a secure function to get current user's role with better error handling
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
    SELECT COALESCE(
        (SELECT role FROM user_profiles WHERE id = auth.uid()),
        'user'
    );
$$;

-- 5. Create a secure function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
    SELECT COALESCE(
        (SELECT is_admin OR role = 'super_admin' FROM user_profiles WHERE id = auth.uid()),
        false
    );
$$;

-- 6. Update any policies that might reference non-existent roles
-- Fix the prevent_role_escalation function to use the new constraint
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- 7. Create a comprehensive security status function for monitoring
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;