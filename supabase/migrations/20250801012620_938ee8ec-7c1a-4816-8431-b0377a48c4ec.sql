-- Fix remaining function search path issues
-- Add secure search_path to all remaining functions

CREATE OR REPLACE FUNCTION public.find_srid(character varying, character varying, character varying)
RETURNS integer
LANGUAGE plpgsql
STABLE PARALLEL SAFE STRICT
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    schem varchar =  $1;
    tabl varchar = $2;
    sr int4;
BEGIN
-- if the table contains a . and the schema is empty
-- split the table into a schema and a table
-- otherwise drop through to default behavior
    IF ( schem = '' and strpos(tabl,'.') > 0 ) THEN
     schem = substr(tabl,1,strpos(tabl,'.')-1);
     tabl = substr(tabl,length(schem)+2);
    END IF;

    select SRID into sr from public.geometry_columns where f_table_schema = schem and f_table_name = tabl and f_geometry_column = $3;
    IF NOT FOUND THEN
       SELECT SRID INTO sr FROM public.geography_columns WHERE f_table_schema = schem AND f_table_name = tabl AND f_geography_column = $3;
       IF NOT FOUND THEN
          RAISE EXCEPTION 'find_srid() - could not find the corresponding SRID - is the geometry registered in the GEOMETRY_COLUMNS table?  Is there an uppercase/lowercase missmatch?';
       END IF;
    END IF;
   RETURN sr;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_proj4_from_srid(integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE PARALLEL SAFE STRICT
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN proj4text::text FROM public.spatial_ref_sys WHERE srid= $1;
END;
$$;

CREATE OR REPLACE FUNCTION public.geometry_columns_pk()
RETURNS trigger
LANGUAGE c
SECURITY DEFINER
SET search_path = ''
AS '$libdir/postgis-3', 'geometry_columns_pk';

CREATE OR REPLACE FUNCTION public.postgis_constraint_dims(geomschema text, geomtable text, geomcolumn text)
RETURNS integer
LANGUAGE sql
STABLE STRICT
SECURITY DEFINER
SET search_path = ''
AS $$
SELECT  replace(replace(split_part(s.consrc, ' = ', 2), ')', ''), '(', '')::integer
         FROM pg_class c, pg_namespace n, pg_attribute a, pg_constraint s
         WHERE n.nspname = $1
         AND c.relname = $2
         AND a.attname = $3
         AND a.attrelid = c.oid
         AND s.connamespace = n.oid
         AND s.conrelid = c.oid
         AND a.attnum = ANY (s.conkey)
         AND s.consrc LIKE '%ndims(% = %';
$$;

-- Create missing essential tables with proper RLS policies

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    role text DEFAULT 'user',
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' AND t.tablename = 'user_profiles' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create user_profiles policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.user_profiles
        FOR SELECT USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.user_profiles
        FOR UPDATE USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.user_profiles
        FOR INSERT WITH CHECK (id = auth.uid());
    END IF;
END $$;

-- Create rate_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier text NOT NULL,
    action text NOT NULL,
    count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(identifier, action)
);

-- Enable RLS on rate_limits
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' AND t.tablename = 'rate_limits' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create rate_limits policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'rate_limits' AND policyname = 'System can manage rate limits'
    ) THEN
        CREATE POLICY "System can manage rate limits" ON public.rate_limits
        FOR ALL USING (true);
    END IF;
END $$;