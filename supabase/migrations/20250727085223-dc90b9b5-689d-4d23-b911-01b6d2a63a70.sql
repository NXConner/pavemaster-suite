-- SECURITY FIXES: Enable RLS and create missing policies only

-- 1. Enable RLS on tables that don't have it
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for tables with missing policies

-- Compliance Notifications - Add missing INSERT and DELETE policies
CREATE POLICY "Users can insert their own compliance notifications" ON public.compliance_notifications
FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins can delete compliance notifications" ON public.compliance_notifications
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Employee Certifications - Add missing INSERT policy
CREATE POLICY "Admins can insert certifications" ON public.employee_certifications
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Equipment - Add missing INSERT, UPDATE, DELETE policies
CREATE POLICY "Admins can insert equipment" ON public.equipment
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can update equipment" ON public.equipment
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can delete equipment" ON public.equipment
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Security Events - Add missing UPDATE and DELETE policies
CREATE POLICY "Admins can update security events" ON public.security_events
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can delete security events" ON public.security_events
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- 3. Create policies for newly RLS-enabled tables

-- Companies
CREATE POLICY "Authenticated users can view companies" ON public.companies
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage companies" ON public.companies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- GPS Locations
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

-- Locations
CREATE POLICY "Authenticated users can view locations" ON public.locations
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage locations" ON public.locations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Maintenance Records
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

-- Project Documents
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
  uploaded_by = auth.uid()
);

-- Project Milestones
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

-- Smart Contracts
CREATE POLICY "Owners can manage smart contracts" ON public.smart_contracts
FOR ALL USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Time Records
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

-- Vehicle Maintenance Records
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

-- 4. Secure the handle_new_user function
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