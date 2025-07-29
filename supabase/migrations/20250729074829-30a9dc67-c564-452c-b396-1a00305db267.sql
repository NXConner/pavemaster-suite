-- Phase 1: Critical Database Security Fixes (without existing trigger)

-- Add comprehensive RLS policies for tables missing them

-- Security Events - only admins can view/manage
CREATE POLICY "Admins can view security events" ON security_events 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

CREATE POLICY "System can insert security events" ON security_events 
FOR INSERT WITH CHECK (true);

-- Documents - add missing policies
CREATE POLICY "Users can delete own documents" ON documents 
FOR DELETE USING (owner_id = auth.uid());

-- Document Versions - add missing policies  
CREATE POLICY "Users can insert document versions" ON document_versions 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM documents WHERE id = document_versions.document_id AND owner_id = auth.uid())
);

-- Mobile Devices - add missing policies
CREATE POLICY "Users can delete own mobile devices" ON mobile_devices 
FOR DELETE USING (user_id = auth.uid());

-- Mobile Sessions - add missing policies  
CREATE POLICY "Users can insert own mobile sessions" ON mobile_sessions 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Asset Assignments - add missing policies
CREATE POLICY "Users can insert asset assignments" ON asset_assignments 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Employee Certifications - add missing policies
CREATE POLICY "Users can delete own certifications" ON employee_certifications 
FOR DELETE USING (employee_id = auth.uid());

-- Employee Violations - add missing policies
CREATE POLICY "Admins can insert employee violations" ON employee_violations 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Fleet Assets - add missing policies
CREATE POLICY "Admins can delete fleet assets" ON fleet_assets 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Locations - add missing policies
CREATE POLICY "Users can insert locations" ON locations 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Payments - add missing policies
CREATE POLICY "Admins can insert payments" ON payments 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Smart Contracts - add missing policies
CREATE POLICY "Users can view smart contracts" ON smart_contracts 
FOR SELECT USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);

-- Vehicle Maintenance Records - add missing policies
CREATE POLICY "Users can insert vehicle maintenance" ON vehicle_maintenance_records 
FOR INSERT WITH CHECK (
  performed_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'technician'))
);

-- Project Milestones - add missing policies
CREATE POLICY "Users can delete project milestones" ON project_milestones 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = project_milestones.project_id AND p.created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin'))
);