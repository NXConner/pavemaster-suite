-- CRITICAL SECURITY FIX PART 3: Fix remaining security issues properly
-- Create the security functions properly first

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'user') FROM public.user_profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(is_admin, false) FROM public.user_profiles WHERE id = user_id;
$$;

-- Fix remaining critical anonymous access policies
-- Fix storage policies to require authentication
DROP POLICY IF EXISTS "Allow authenticated read from estimates-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read from contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read from signatures" ON storage.objects;

CREATE POLICY "authenticated_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_storage_update" ON storage.objects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (true);

-- Fix remaining tables with anonymous access
-- Fix receipts table
DROP POLICY IF EXISTS "receipts_select" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete" ON public.receipts;
CREATE POLICY "authenticated_receipts" ON public.receipts
  FOR ALL TO authenticated USING (true);

-- Fix resource_allocations table
DROP POLICY IF EXISTS "resource_allocations_select" ON public.resource_allocations;
DROP POLICY IF EXISTS "resource_allocations_update" ON public.resource_allocations;
DROP POLICY IF EXISTS "resource_allocations_delete" ON public.resource_allocations;
CREATE POLICY "authenticated_resource_allocations" ON public.resource_allocations
  FOR ALL TO authenticated USING (true);

-- Fix scheduling_entries table
DROP POLICY IF EXISTS "scheduling_entries_select" ON public.scheduling_entries;
DROP POLICY IF EXISTS "scheduling_entries_update" ON public.scheduling_entries;
DROP POLICY IF EXISTS "scheduling_entries_delete" ON public.scheduling_entries;
CREATE POLICY "authenticated_scheduling" ON public.scheduling_entries
  FOR ALL TO authenticated USING (true);

-- Fix vendors table
DROP POLICY IF EXISTS "vendors_select" ON public.vendors;
DROP POLICY IF EXISTS "vendors_update" ON public.vendors;
DROP POLICY IF EXISTS "vendors_delete" ON public.vendors;
CREATE POLICY "authenticated_vendors" ON public.vendors
  FOR ALL TO authenticated USING (true);

-- Fix work_schedules table
DROP POLICY IF EXISTS "Users can view work schedules" ON public.work_schedules;
CREATE POLICY "authenticated_work_schedules" ON public.work_schedules
  FOR ALL TO authenticated USING (true);

-- Fix compliance_zones table
DROP POLICY IF EXISTS "compliance_zones_select" ON public.compliance_zones;
DROP POLICY IF EXISTS "compliance_zones_update" ON public.compliance_zones;
DROP POLICY IF EXISTS "compliance_zones_delete" ON public.compliance_zones;
CREATE POLICY "authenticated_compliance_zones" ON public.compliance_zones
  FOR ALL TO authenticated USING (true);

-- Fix debriefs table
DROP POLICY IF EXISTS "Users can view their own debriefs" ON public.debriefs;
DROP POLICY IF EXISTS "Users can update their own debriefs" ON public.debriefs;
DROP POLICY IF EXISTS "Users can delete their own debriefs" ON public.debriefs;
CREATE POLICY "own_debriefs" ON public.debriefs
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix email_logs table
DROP POLICY IF EXISTS "Authenticated users can view email logs" ON public.email_logs;
CREATE POLICY "admin_email_logs" ON public.email_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix email_templates table
DROP POLICY IF EXISTS "Authenticated users can view email templates" ON public.email_templates;
CREATE POLICY "authenticated_email_templates" ON public.email_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_email_templates_modify" ON public.email_templates
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix employee_scores table
DROP POLICY IF EXISTS "Users can view their own scores" ON public.employee_scores;
CREATE POLICY "own_employee_scores" ON public.employee_scores
  FOR ALL TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "admin_employee_scores" ON public.employee_scores
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix expense_categories table
DROP POLICY IF EXISTS "Users can view expense categories" ON public.expense_categories;
CREATE POLICY "authenticated_expense_categories" ON public.expense_categories
  FOR ALL TO authenticated USING (true);

-- Fix fleet_vehicles table
DROP POLICY IF EXISTS "manage_fleet_vehicles" ON public.fleet_vehicles;
CREATE POLICY "authenticated_fleet_vehicles" ON public.fleet_vehicles
  FOR ALL TO authenticated USING (true);

-- Create admin user setup (this will work once the user signs up)
INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- placeholder, will be updated by trigger
  'n8ter8@gmail.com',
  'Admin User',
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;