-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Rate limits table policies
CREATE POLICY "Users can manage their own rate limits" ON public.rate_limits
FOR ALL USING (auth.uid()::text = identifier);

-- Audit logs table policies  
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Security audit log policies
CREATE POLICY "System can insert security audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view security audit logs" ON public.security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Missing table policies - App configs
CREATE POLICY "Admins can manage app configs" ON public.app_configs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Missing table policies - Project tasks
CREATE POLICY "Project creators can manage project tasks" ON public.project_tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_tasks.project_id 
    AND p.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Missing table policies - User sessions
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
FOR ALL USING (user_id = auth.uid());

-- Missing table policies - Activity logs
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (true);

-- Missing table policies - Material suppliers  
CREATE POLICY "All users can view material suppliers" ON public.material_suppliers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage material suppliers" ON public.material_suppliers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Missing table policies - Equipment maintenance
CREATE POLICY "Technicians can manage equipment maintenance" ON public.equipment_maintenance
FOR ALL USING (
  assigned_to = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'technician', 'maintenance_manager'))
  )
);

-- Missing table policies - Safety incidents
CREATE POLICY "All users can report safety incidents" ON public.safety_incidents
FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can view their own safety incidents" ON public.safety_incidents
FOR SELECT USING (
  reported_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'safety_manager'))
  )
);

-- Missing table policies - Training records
CREATE POLICY "Users can view their own training records" ON public.training_records
FOR SELECT USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'hr_manager'))
  )
);

CREATE POLICY "HR can manage training records" ON public.training_records
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'hr_manager'))
  )
);

-- Missing table policies - File attachments
CREATE POLICY "Users can manage their own file attachments" ON public.file_attachments
FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view public file attachments" ON public.file_attachments
FOR SELECT USING (is_public = true OR uploaded_by = auth.uid());

-- Missing table policies - Notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
FOR ALL USING (user_id = auth.uid());

-- Missing table policies - System settings
CREATE POLICY "Admins can manage system settings" ON public.system_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Missing table policies - User preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL USING (user_id = auth.uid());

-- Missing table policies - Weather data
CREATE POLICY "All authenticated users can view weather data" ON public.weather_data
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert weather data" ON public.weather_data
FOR INSERT WITH CHECK (true);

-- Missing table policies - Job sites
CREATE POLICY "All users can view job sites" ON public.job_sites
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Project managers can manage job sites" ON public.job_sites
FOR ALL USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

-- Missing table policies - Time entries  
CREATE POLICY "Users can manage their own time entries" ON public.time_entries
FOR ALL USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

-- Missing table policies - Expense reports
CREATE POLICY "Users can manage their own expense reports" ON public.expense_reports
FOR ALL USING (
  submitted_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'finance_manager'))
  )
);

-- Missing table policies - Invoice line items
CREATE POLICY "Finance can manage invoice line items" ON public.invoice_line_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'finance_manager'))
  )
);

-- Missing table policies - Customer communications
CREATE POLICY "All users can view customer communications" ON public.customer_communications
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage customer communications" ON public.customer_communications
FOR ALL USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'sales_manager'))
  )
);

-- Missing table policies - Quality control reports
CREATE POLICY "Quality inspectors can manage QC reports" ON public.quality_control_reports
FOR ALL USING (
  inspector_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'quality_manager'))
  )
);

-- Missing table policies - Vendor contracts
CREATE POLICY "All users can view vendor contracts" ON public.vendor_contracts
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage vendor contracts" ON public.vendor_contracts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role IN ('super_admin', 'procurement_manager'))
  )
);

-- Create any missing tables if they don't exist and add basic policies
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Add security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;