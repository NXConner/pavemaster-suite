-- Critical Security Fixes - Phase 2: Fix remaining RLS issues

-- 1. Fix tables that have no RLS enabled but need it
-- Based on the linter, these tables need RLS enabled:

-- Enable RLS on user_profiles if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on projects if not already enabled  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'projects'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on proposals if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'proposals'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE IF EXISTS public.proposals ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on profiles if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create missing RLS policies for key tables

-- User profiles policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
        ON public.user_profiles 
        FOR SELECT 
        USING (id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.user_profiles 
        FOR UPDATE 
        USING (id = auth.uid());
    END IF;
END $$;

-- Projects policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
        AND policyname = 'Users can view their own projects'
    ) THEN
        CREATE POLICY "Users can view their own projects" 
        ON public.projects 
        FOR SELECT 
        USING (created_by = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
        AND policyname = 'Users can manage their own projects'
    ) THEN
        CREATE POLICY "Users can manage their own projects" 
        ON public.projects 
        FOR ALL 
        USING (created_by = auth.uid());
    END IF;
END $$;

-- Proposals policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'proposals' 
        AND policyname = 'Users can view their own proposals'
    ) THEN
        CREATE POLICY "Users can view their own proposals" 
        ON public.proposals 
        FOR SELECT 
        USING (created_by = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'proposals' 
        AND policyname = 'Users can manage their own proposals'
    ) THEN
        CREATE POLICY "Users can manage their own proposals" 
        ON public.proposals 
        FOR ALL 
        USING (created_by = auth.uid());
    END IF;
END $$;

-- Profiles policies (separate from user_profiles)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
        ON public.profiles 
        FOR SELECT 
        USING (id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (id = auth.uid());
    END IF;
END $$;