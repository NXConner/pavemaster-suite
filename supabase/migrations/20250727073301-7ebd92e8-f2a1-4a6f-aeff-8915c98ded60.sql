-- CRITICAL SECURITY FIX PART 4: Complete remaining security fixes

-- Fix remaining tables and set up admin user correctly
-- Fix analytics table
DROP POLICY IF EXISTS "analytics_select" ON public.analytics;
DROP POLICY IF EXISTS "select analytics" ON public.analytics;
CREATE POLICY "authenticated_analytics" ON public.analytics
  FOR ALL TO authenticated USING (true);

-- Fix app_usage_metrics table
DROP POLICY IF EXISTS "read_own_metrics" ON public.app_usage_metrics;
CREATE POLICY "own_app_metrics" ON public.app_usage_metrics
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_app_metrics" ON public.app_usage_metrics
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix mobile_app_errors table
DROP POLICY IF EXISTS "read_own_errors" ON public.mobile_app_errors;
CREATE POLICY "own_app_errors" ON public.mobile_app_errors
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_app_errors" ON public.mobile_app_errors
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix mobile_notifications table
DROP POLICY IF EXISTS "read_own_notifications" ON public.mobile_notifications;
DROP POLICY IF EXISTS "update_own_notifications" ON public.mobile_notifications;
CREATE POLICY "own_mobile_notifications" ON public.mobile_notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix document_permissions table
DROP POLICY IF EXISTS "manage_document_permissions" ON public.document_permissions;
CREATE POLICY "own_document_permissions" ON public.document_permissions
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_document_permissions" ON public.document_permissions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix document_versions table
DROP POLICY IF EXISTS "read_permitted_versions" ON public.document_versions;
CREATE POLICY "authenticated_document_versions" ON public.document_versions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_document_versions" ON public.document_versions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix inspection_results table
DROP POLICY IF EXISTS "inspection_results_select" ON public.inspection_results;
CREATE POLICY "own_inspection_results" ON public.inspection_results
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_inspection_results" ON public.inspection_results
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix samples table
DROP POLICY IF EXISTS "Samples: Project Creator, Collector, or Admin Read" ON public.samples;
DROP POLICY IF EXISTS "Samples: Project Creator, Collector, or Admin Update" ON public.samples;
CREATE POLICY "authenticated_samples_select" ON public.samples
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_samples_modify" ON public.samples
  FOR ALL TO authenticated USING (collected_by = auth.uid());
CREATE POLICY "admin_samples" ON public.samples
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix tests table
DROP POLICY IF EXISTS "Tests: Tester, Sample/Project Creator, or Admin Read" ON public.tests;
DROP POLICY IF EXISTS "Tests: Tester, Sample/Project Creator, or Admin Update" ON public.tests;
CREATE POLICY "authenticated_tests_select" ON public.tests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_tests_modify" ON public.tests
  FOR ALL TO authenticated USING (tested_by = auth.uid());
CREATE POLICY "admin_tests" ON public.tests
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix user_roles table
DROP POLICY IF EXISTS "Super Administrators can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "own_user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_user_roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix budget_allocations table
DROP POLICY IF EXISTS "Users can view budget allocations" ON public.budget_allocations;
CREATE POLICY "authenticated_budget_allocations" ON public.budget_allocations
  FOR ALL TO authenticated USING (true);

-- Fix asset_assignments table
DROP POLICY IF EXISTS "Users can view asset assignments" ON public.asset_assignments;
CREATE POLICY "authenticated_asset_assignments" ON public.asset_assignments
  FOR ALL TO authenticated USING (true);

-- Fix compliance_notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.compliance_notifications;
CREATE POLICY "own_compliance_notifications" ON public.compliance_notifications
  FOR ALL TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "admin_compliance_notifications" ON public.compliance_notifications
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix employee_violations table
DROP POLICY IF EXISTS "Users can view their own violations" ON public.employee_violations;
CREATE POLICY "own_employee_violations" ON public.employee_violations
  FOR SELECT TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "admin_employee_violations" ON public.employee_violations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix compliance_rules table (keep public read access for operational needs)
DROP POLICY IF EXISTS "All users can view compliance rules" ON public.compliance_rules;
CREATE POLICY "authenticated_compliance_rules_select" ON public.compliance_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_compliance_rules_modify" ON public.compliance_rules
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix maintenance_records table
DROP POLICY IF EXISTS "Authenticated users can view maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Authenticated users can modify maintenance" ON public.maintenance_records;
CREATE POLICY "authenticated_maintenance_records" ON public.maintenance_records
  FOR ALL TO authenticated USING (true);

-- Set up admin user correctly with existing column names
UPDATE public.user_profiles 
SET is_admin = true, role = 'admin'
WHERE email = 'n8ter8@gmail.com';

-- If admin user doesn't exist, create placeholder that will be updated by trigger
INSERT INTO public.user_profiles (id, email, first_name, last_name, role, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'n8ter8@gmail.com',
  'Admin',
  'User',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  email = 'n8ter8@gmail.com';