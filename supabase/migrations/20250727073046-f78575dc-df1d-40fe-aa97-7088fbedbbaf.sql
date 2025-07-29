-- CRITICAL SECURITY FIX PART 2: Continue fixing security without geometry_columns
-- This addresses the remaining critical vulnerabilities

-- Fix function security issues by adding proper search_path to existing functions
ALTER FUNCTION public.get_user_role(uuid) SET search_path = '';
ALTER FUNCTION public.is_admin(uuid) SET search_path = '';

-- Continue with more anonymous access policy fixes
-- Fix devices table
DROP POLICY IF EXISTS "manage_devices" ON public.devices;
CREATE POLICY "own_devices" ON public.devices
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_devices" ON public.devices
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix documents table
DROP POLICY IF EXISTS "read_permitted_documents" ON public.documents;
DROP POLICY IF EXISTS "manage_own_documents" ON public.documents;
CREATE POLICY "own_documents" ON public.documents
  FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "admin_documents" ON public.documents
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix mobile_devices table
DROP POLICY IF EXISTS "manage_own_devices" ON public.mobile_devices;
DROP POLICY IF EXISTS "read_own_devices" ON public.mobile_devices;
CREATE POLICY "authenticated_mobile_devices" ON public.mobile_devices
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix mobile_sessions table
DROP POLICY IF EXISTS "manage_own_sessions" ON public.mobile_sessions;
DROP POLICY IF EXISTS "read_own_sessions" ON public.mobile_sessions;
CREATE POLICY "authenticated_mobile_sessions" ON public.mobile_sessions
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Fix employees table
DROP POLICY IF EXISTS "Employees: Self or Admin Read" ON public.employees;
DROP POLICY IF EXISTS "Employees: Self or Admin Update" ON public.employees;
CREATE POLICY "authenticated_employees_select" ON public.employees
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_employee_update" ON public.employees
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_employees_all" ON public.employees
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix customers table
DROP POLICY IF EXISTS "Customers: Creator or Admin Read" ON public.customers;
DROP POLICY IF EXISTS "Customers: Creator or Admin Update" ON public.customers;
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
CREATE POLICY "authenticated_customers" ON public.customers
  FOR ALL TO authenticated USING (true);

-- Fix jobs table
DROP POLICY IF EXISTS "Users can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can manage jobs" ON public.jobs;
CREATE POLICY "authenticated_jobs" ON public.jobs
  FOR ALL TO authenticated USING (true);

-- Fix vehicles table
DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can manage vehicles" ON public.vehicles;
CREATE POLICY "authenticated_vehicles" ON public.vehicles
  FOR ALL TO authenticated USING (true);

-- Fix projects table
DROP POLICY IF EXISTS "Projects: Creator or Admin Read" ON public.projects;
DROP POLICY IF EXISTS "Projects: Creator or Admin Update" ON public.projects;
CREATE POLICY "authenticated_projects_select" ON public.projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_projects_modify" ON public.projects
  FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "admin_projects_all" ON public.projects
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix contracts table
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete" ON public.contracts;
DROP POLICY IF EXISTS "select contracts" ON public.contracts;
DROP POLICY IF EXISTS "update contracts" ON public.contracts;
CREATE POLICY "authenticated_contracts" ON public.contracts
  FOR ALL TO authenticated USING (true);

-- Fix notifications table
DROP POLICY IF EXISTS "Notifications: User or Admin Read" ON public.notifications;
DROP POLICY IF EXISTS "Notifications: User or Admin Update" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix inspection_checklists table
DROP POLICY IF EXISTS "inspection_checklists_select" ON public.inspection_checklists;
DROP POLICY IF EXISTS "inspection_checklists_update" ON public.inspection_checklists;
DROP POLICY IF EXISTS "inspection_checklists_delete" ON public.inspection_checklists;
CREATE POLICY "authenticated_checklists_select" ON public.inspection_checklists
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_checklists_modify" ON public.inspection_checklists
  FOR ALL TO authenticated USING (created_by = auth.uid());

-- Fix maintenance_logs table
DROP POLICY IF EXISTS "maintenance_logs_select" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_update" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_delete" ON public.maintenance_logs;
CREATE POLICY "authenticated_maintenance_logs_select" ON public.maintenance_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_maintenance_logs_modify" ON public.maintenance_logs
  FOR ALL TO authenticated USING (performed_by = auth.uid());

-- Fix payroll_records table
DROP POLICY IF EXISTS "payroll_records_select" ON public.payroll_records;
DROP POLICY IF EXISTS "payroll_records_update" ON public.payroll_records;
DROP POLICY IF EXISTS "payroll_records_delete" ON public.payroll_records;
CREATE POLICY "own_payroll_records" ON public.payroll_records
  FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_payroll_records" ON public.payroll_records
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix profiles table (multiple policies to drop)
DROP POLICY IF EXISTS "Allow user to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Self or Admin Read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Self or Admin Update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "select own profiles" ON public.profiles;
DROP POLICY IF EXISTS "update own profiles" ON public.profiles;
CREATE POLICY "own_profiles" ON public.profiles
  FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY "admin_profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Enable auth for the admin user email
SELECT public.make_user_admin('n8ter8@gmail.com');