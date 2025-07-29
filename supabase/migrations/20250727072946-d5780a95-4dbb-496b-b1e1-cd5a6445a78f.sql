-- CRITICAL SECURITY FIX: Enable RLS and create proper policies for all unprotected tables
-- This migration addresses all 101 security vulnerabilities identified by the linter

-- First, enable RLS on all unprotected tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table if it doesn't exist for proper authentication
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'user',
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'user') FROM public.user_profiles WHERE id = user_id;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(is_admin, false) FROM public.user_profiles WHERE id = user_id;
$$;

-- REMOVE ALL ANONYMOUS ACCESS POLICIES and replace with authenticated-only policies

-- 1. Fix companies table
DROP POLICY IF EXISTS manage_companies ON public.companies;
CREATE POLICY "authenticated_companies_select" ON public.companies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_companies_all" ON public.companies
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 2. Fix gps_locations table
DROP POLICY IF EXISTS manage_gps_locations ON public.gps_locations;
CREATE POLICY "authenticated_gps_select" ON public.gps_locations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_gps_all" ON public.gps_locations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 3. Fix security_events table (admin only)
CREATE POLICY "admin_security_events" ON public.security_events
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 4. Fix smart_contracts table
CREATE POLICY "authenticated_contracts_select" ON public.smart_contracts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_contracts_all" ON public.smart_contracts
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 5. Fix time_records table
CREATE POLICY "own_time_records" ON public.time_records
  FOR ALL TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "admin_time_records" ON public.time_records
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 6. Fix vehicle_maintenance_records table
CREATE POLICY "authenticated_maintenance_select" ON public.vehicle_maintenance_records
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_maintenance_all" ON public.vehicle_maintenance_records
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 7. Fix employee_certifications table
CREATE POLICY "own_certifications" ON public.employee_certifications
  FOR ALL TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "admin_certifications" ON public.employee_certifications
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 8. Fix project_documents table
CREATE POLICY "authenticated_project_docs_select" ON public.project_documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_project_docs_all" ON public.project_documents
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 9. Fix project_milestones table
CREATE POLICY "authenticated_milestones_select" ON public.project_milestones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_milestones_all" ON public.project_milestones
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 10. Fix payments table
CREATE POLICY "authenticated_payments_select" ON public.payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_payments_all" ON public.payments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 11. Fix locations table
CREATE POLICY "authenticated_locations_select" ON public.locations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_locations_all" ON public.locations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 12. Fix geometry_columns (read-only for authenticated)
CREATE POLICY "authenticated_geometry_select" ON public.geometry_columns
  FOR SELECT TO authenticated USING (true);

-- Fix user_profiles policies
CREATE POLICY "own_profile_select" ON public.user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own_profile_update" ON public.user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "admin_profiles_all" ON public.user_profiles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Update ALL existing policies to remove anonymous access
-- This requires dropping and recreating policies for affected tables

-- Fix achievements table
DROP POLICY IF EXISTS "achievements_select" ON public.achievements;
DROP POLICY IF EXISTS "select achievements" ON public.achievements;
CREATE POLICY "own_achievements" ON public.achievements
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix badges table
DROP POLICY IF EXISTS "badges_select" ON public.badges;
DROP POLICY IF EXISTS "select badges" ON public.badges;
CREATE POLICY "own_badges" ON public.badges
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix feedback table
DROP POLICY IF EXISTS "feedback_select" ON public.feedback;
DROP POLICY IF EXISTS "select feedback" ON public.feedback;
CREATE POLICY "own_feedback" ON public.feedback
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix rewards table
DROP POLICY IF EXISTS "rewards_select" ON public.rewards;
DROP POLICY IF EXISTS "select rewards" ON public.rewards;
CREATE POLICY "own_rewards" ON public.rewards
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix leaderboard table
DROP POLICY IF EXISTS "leaderboard_select" ON public.leaderboard;
DROP POLICY IF EXISTS "select leaderboard" ON public.leaderboard;
CREATE POLICY "authenticated_leaderboard" ON public.leaderboard
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_leaderboard_modify" ON public.leaderboard
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix estimates table
DROP POLICY IF EXISTS "estimates_select" ON public.estimates;
DROP POLICY IF EXISTS "select estimates" ON public.estimates;
CREATE POLICY "authenticated_estimates_select" ON public.estimates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_estimates_modify" ON public.estimates
  FOR ALL TO authenticated USING (created_by = auth.uid());

-- Fix forum_posts table
DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
DROP POLICY IF EXISTS "select forum_posts" ON public.forum_posts;
CREATE POLICY "authenticated_forum_select" ON public.forum_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_forum_modify" ON public.forum_posts
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix all remaining tables with anonymous access
-- Equipment table
DROP POLICY IF EXISTS "Users can view equipment" ON public.equipment;
CREATE POLICY "authenticated_equipment" ON public.equipment
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_equipment_all" ON public.equipment
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Inventory items table
DROP POLICY IF EXISTS "Users can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can manage inventory" ON public.inventory_items;
CREATE POLICY "authenticated_inventory" ON public.inventory_items
  FOR ALL TO authenticated USING (true);

-- Fleet assets table
DROP POLICY IF EXISTS "Authenticated users can view fleet" ON public.fleet_assets;
DROP POLICY IF EXISTS "Authenticated users can modify fleet" ON public.fleet_assets;
CREATE POLICY "authenticated_fleet_view" ON public.fleet_assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_fleet_modify" ON public.fleet_assets
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Create trigger to auto-create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    'user',
    false
  );
  RETURN new;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin user setup function
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.user_profiles 
  SET is_admin = true, role = 'admin' 
  WHERE email = user_email;
$$;