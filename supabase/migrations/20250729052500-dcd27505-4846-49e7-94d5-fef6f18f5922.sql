-- Targeted Security Fix Migration
-- Only affects application tables, not system tables

-- 1. Create a helper function to safely enable RLS only on application tables
CREATE OR REPLACE FUNCTION public.safely_enable_rls_on_app_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    app_tables text[] := ARRAY[
        'user_profiles', 'profiles', 'projects', 'proposals', 'notifications',
        'user_preferences', 'files', 'backups', 'jobs', 'rate_limits', 'vehicles'
    ];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY app_tables
    LOOP
        -- Only enable RLS if table exists and doesn't already have it
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END $$;

-- 2. Run the safe RLS enablement
SELECT public.safely_enable_rls_on_app_tables();

-- 3. Create basic RLS policies for core application tables that might be missing them

-- User profiles policies (if not exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view all profiles') THEN
    EXECUTE 'CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid())';
  END IF;
END $$;

-- Profiles policies (alternative table name)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') AND 
     NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
    EXECUTE 'CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid())';
  END IF;
END $$;

-- 4. Create improved security functions with proper search_path

-- Enhanced user role checking function
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
    SELECT COALESCE(role, 'user') 
    FROM user_profiles 
    WHERE id = auth.uid();
$$;

-- Enhanced admin checking function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
    SELECT COALESCE(is_admin, false) OR role = 'super_admin'
    FROM user_profiles 
    WHERE id = auth.uid();
$$;

-- 5. Create secure audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Log the operation
    PERFORM public.log_security_activity(
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'user_id', auth.uid(),
            'timestamp', now()
        )
    );
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- 6. Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS public.safely_enable_rls_on_app_tables();

-- 7. Ensure admin user setup is correct
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