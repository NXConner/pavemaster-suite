-- Fix critical user profiles RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Add secure profile access policies
DO $$ 
BEGIN
  -- Users can view own profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile') THEN
    EXECUTE 'CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id)';
  END IF;

  -- Admins can view all profiles  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Admins can view all profiles') THEN
    EXECUTE 'CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND (up.is_admin = true OR up.role = ''super_admin'')))';
  END IF;
END $$;

-- Fix estimates table to prevent unauthorized access
DROP POLICY IF EXISTS "estimates_select" ON public.estimates;
DROP POLICY IF EXISTS "select estimates" ON public.estimates;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimates' AND policyname = 'Users can view own estimates') THEN
    EXECUTE 'CREATE POLICY "Users can view own estimates" ON public.estimates FOR SELECT USING (created_by = auth.uid())';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimates' AND policyname = 'Admins can view all estimates') THEN
    EXECUTE 'CREATE POLICY "Admins can view all estimates" ON public.estimates FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = ''super_admin'')))';
  END IF;
END $$;