-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Performance reviews policies
CREATE POLICY "Users can view own performance reviews" ON public.performance_reviews
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage performance reviews" ON public.performance_reviews
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Project tasks policies  
CREATE POLICY "Users can view project tasks" ON public.project_tasks
FOR SELECT 
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

CREATE POLICY "Project creators and admins can manage tasks" ON public.project_tasks
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'project_manager'))
  )
);

-- Employee certifications policies
CREATE POLICY "Users can view own certifications" ON public.employee_certifications
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "HR and admins can manage certifications" ON public.employee_certifications
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'hr_manager'))
  )
);

-- Sync status policies
CREATE POLICY "Users can view own sync status" ON public.sync_status
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sync status" ON public.sync_status
FOR ALL 
USING (user_id = auth.uid());

-- Enable RLS on remaining unprotected tables
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Backups policies
CREATE POLICY "Admins can manage backups" ON public.backups
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Files policies  
CREATE POLICY "Users can view own files" ON public.files
FOR SELECT 
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can manage own files" ON public.files
FOR ALL 
USING (uploaded_by = auth.uid());