-- Check which tables need RLS policies
-- Query existing tables and create appropriate policies

-- Enable RLS on spatial_ref_sys (PostGIS table)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy for spatial_ref_sys (read-only for authenticated users)
CREATE POLICY "Authenticated users can view spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create missing tables that may need RLS policies
-- Check what tables need policies by first checking if they exist

DO $$
BEGIN
    -- Create user_profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        CREATE TABLE public.user_profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name text,
            role text DEFAULT 'user',
            is_admin boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.user_profiles
        FOR SELECT USING (id = auth.uid());
        
        CREATE POLICY "Users can update own profile" ON public.user_profiles
        FOR UPDATE USING (id = auth.uid());
        
        CREATE POLICY "Admins can view all profiles" ON public.user_profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                WHERE up.id = auth.uid() AND (up.is_admin = true OR up.role = 'super_admin')
            )
        );
    END IF;

    -- Create rate_limits table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rate_limits') THEN
        CREATE TABLE public.rate_limits (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            identifier text NOT NULL,
            action text NOT NULL,
            count integer DEFAULT 1,
            window_start timestamp with time zone DEFAULT now(),
            created_at timestamp with time zone DEFAULT now(),
            UNIQUE(identifier, action)
        );
        
        ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "System can manage rate limits" ON public.rate_limits
        FOR ALL USING (true);
    END IF;

    -- Create profiles table if it doesn't exist (legacy compatibility)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name text,
            role text DEFAULT 'user',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (id = auth.uid());
        
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (id = auth.uid());
    END IF;

END $$;