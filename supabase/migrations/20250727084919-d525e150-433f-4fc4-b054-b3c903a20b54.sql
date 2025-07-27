-- CRITICAL SECURITY FIXES: Enable RLS and create policies for unprotected tables

-- 1. Enable RLS on tables that don't have it
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for tables with RLS enabled but no policies

-- Asset Assignments - Users can view all, only admins can modify
CREATE POLICY "Users can view asset assignments" ON public.asset_assignments
FOR SELECT USING (true);

CREATE POLICY "Admins can manage asset assignments" ON public.asset_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Budget Allocations - Users can view, creators and admins can modify
CREATE POLICY "Users can view budget allocations" ON public.budget_allocations
FOR SELECT USING (true);

CREATE POLICY "Creators and admins can manage budget allocations" ON public.budget_allocations
FOR ALL USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Compliance Notifications - Users can only see their own
CREATE POLICY "Users can view their own compliance notifications" ON public.compliance_notifications
FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can update their own compliance notifications" ON public.compliance_notifications
FOR UPDATE USING (employee_id = auth.uid());

-- Employee Certifications - Users can view their own, admins can manage all
CREATE POLICY "Users can view their own certifications" ON public.employee_certifications
FOR SELECT USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage certifications" ON public.employee_certifications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Equipment - All authenticated users can view, admins can modify
CREATE POLICY "Authenticated users can view equipment" ON public.equipment
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage equipment" ON public.equipment
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Security Events - Only admins can view security events
CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT WITH CHECK (true);

-- 3. Create policies for newly RLS-enabled tables

-- Companies - All authenticated users can view, admins can modify
CREATE POLICY "Authenticated users can view companies" ON public.companies
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage companies" ON public.companies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- GPS Locations - Users can view locations for their assigned devices
CREATE POLICY "Users can view GPS locations for their devices" ON public.gps_locations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.devices d 
    WHERE d.id = gps_locations.device_id AND d.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'fleet_manager'))
  )
);

CREATE POLICY "System can insert GPS locations" ON public.gps_locations
FOR INSERT WITH CHECK (true);

-- Locations - All authenticated users can view, admins can modify
CREATE POLICY "Authenticated users can view locations" ON public.locations
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage locations" ON public.locations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Maintenance Records - Users can view records for their assets, technicians can modify
CREATE POLICY "Users can view maintenance records" ON public.maintenance_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'fleet_manager', 'technician')
  )
);

CREATE POLICY "Technicians can manage maintenance records" ON public.maintenance_records
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'technician')
  )
);

-- Project Documents - Users can view documents for their projects
CREATE POLICY "Users can view project documents" ON public.project_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id AND p.created_by = auth.uid()
  ) OR
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Users can upload project documents" ON public.project_documents
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id AND p.created_by = auth.uid()
  )
);

-- Project Milestones - Users can view milestones for their projects
CREATE POLICY "Users can view project milestones" ON public.project_milestones
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_milestones.project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Project creators can manage milestones" ON public.project_milestones
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_milestones.project_id AND p.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Smart Contracts - Only contract owners and admins can access
CREATE POLICY "Owners can manage smart contracts" ON public.smart_contracts
FOR ALL USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Time Records - Users can view their own records, managers can view team records
CREATE POLICY "Users can view their own time records" ON public.time_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = time_records.employee_id AND e.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
  )
);

CREATE POLICY "Users can manage their own time records" ON public.time_records
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = time_records.employee_id AND e.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
  )
);

-- Vehicle Maintenance Records - Fleet managers and admins can access
CREATE POLICY "Fleet managers can view vehicle maintenance" ON public.vehicle_maintenance_records
FOR SELECT USING (
  performed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'fleet_manager', 'technician')
  )
);

CREATE POLICY "Technicians can manage vehicle maintenance" ON public.vehicle_maintenance_records
FOR ALL USING (
  performed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'technician')
  )
);

-- 4. Secure database functions by adding search_path protection
-- Update the existing handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE 
      WHEN NEW.email = 'n8ter8@gmail.com' THEN 'super_admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email = 'n8ter8@gmail.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;