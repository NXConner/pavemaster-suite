-- Jobs/Work Orders System
-- Essential for project management and field operations

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_crew UUID[], -- Array of employee IDs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  scheduled_date DATE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  location_coordinates POINT, -- PostGIS for GPS coordinates
  address TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('asphalt_laying', 'sealcoating', 'line_striping', 'crack_sealing', 'inspection', 'maintenance', 'demolition')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
  description TEXT,
  instructions TEXT,
  materials_required JSONB DEFAULT '[]'::jsonb,
  equipment_required JSONB DEFAULT '[]'::jsonb,
  safety_requirements TEXT[],
  weather_dependent BOOLEAN DEFAULT true,
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  quality_checklist_id UUID,
  completion_notes TEXT,
  completion_photos TEXT[], -- Array of file URLs
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),
  created_by UUID REFERENCES user_profiles(id),
  assigned_by UUID REFERENCES user_profiles(id),
  completed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Time Tracking System
-- Critical for payroll and productivity analysis
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_time_minutes INTEGER DEFAULT 0,
  -- Calculated field for total hours
  total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN clock_out IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (clock_out - clock_in))/3600 - (break_time_minutes/60.0)
      ELSE NULL
    END
  ) STORED,
  location_in POINT, -- GPS location when clocking in
  location_out POINT, -- GPS location when clocking out
  notes TEXT,
  work_performed TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_review')),
  rejection_reason TEXT,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  regular_hours NUMERIC(5,2) DEFAULT 0,
  holiday_hours NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Management System
-- Essential for storing project documents, photos, and files
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'permit', 'photo', 'drawing', 'specification', 'invoice', 'receipt', 'report', 'certificate', 'safety_document', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT,
  mime_type TEXT,
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES user_profiles(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_public BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  version_number INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id), -- For versioning
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional file metadata
  access_permissions JSONB DEFAULT '{"roles": ["admin", "manager"], "users": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Equipment Maintenance Records
-- Critical for asset management and preventive maintenance
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES fleet_assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection', 'calibration', 'upgrade')),
  scheduled_date DATE,
  completed_date DATE,
  technician_id UUID REFERENCES employees(id),
  vendor_name TEXT, -- External service provider
  vendor_contact TEXT,
  description TEXT NOT NULL,
  work_performed TEXT,
  parts_used JSONB DEFAULT '[]'::jsonb, -- Array of part objects
  labor_hours NUMERIC(5,2),
  labor_cost NUMERIC(10,2),
  parts_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(labor_cost, 0) + COALESCE(parts_cost, 0)) STORED,
  next_maintenance_date DATE,
  next_maintenance_type TEXT,
  odometer_reading INTEGER, -- For vehicles
  hours_reading NUMERIC(8,1), -- For equipment with hour meters
  maintenance_notes TEXT,
  warranty_expiry DATE,
  compliance_certifications TEXT[], -- Safety/regulatory compliance
  before_photos TEXT[], -- Photos before maintenance
  after_photos TEXT[], -- Photos after maintenance
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced Audit Logging
-- Enhanced security and compliance tracking
CREATE TABLE IF NOT EXISTS audit_log_detailed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'EXPORT', 'IMPORT')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[], -- Specific fields that changed
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT, -- For tracing requests
  endpoint TEXT, -- API endpoint or page accessed
  method TEXT, -- HTTP method
  status_code INTEGER, -- Response status
  execution_time_ms INTEGER, -- Request execution time
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100), -- Security risk assessment
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_crew ON jobs USING GIN(assigned_crew);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING GIST(location_coordinates);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_entries_approval_status ON time_entries(approval_status);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance_records(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_next_date ON maintenance_records(next_maintenance_date);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log_detailed(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit_log_detailed(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log_detailed(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log_detailed(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_risk_score ON audit_log_detailed(risk_score);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_detailed ENABLE ROW LEVEL SECURITY;

-- Jobs RLS Policies
CREATE POLICY "Users can view jobs for their projects" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = jobs.project_id 
            AND (p.created_by = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
        OR 
        auth.uid() = ANY(assigned_crew)
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

CREATE POLICY "Managers can insert jobs" ON jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

CREATE POLICY "Managers can update jobs" ON jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Time entries RLS policies
CREATE POLICY "Users can view their own time entries" ON time_entries
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

CREATE POLICY "Employees can insert their own time entries" ON time_entries
    FOR INSERT WITH CHECK (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Employees can update their own pending time entries" ON time_entries
    FOR UPDATE USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
        AND approval_status = 'pending'
    );

-- Documents RLS policies
CREATE POLICY "Users can view documents for accessible projects" ON documents
    FOR SELECT USING (
        is_public = true
        OR
        EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = documents.project_id 
            AND (p.created_by = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Maintenance records RLS policies  
CREATE POLICY "Users can view maintenance records for their assets" ON maintenance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fleet_assets fa 
            WHERE fa.id = maintenance_records.asset_id 
            AND (fa.assigned_to = auth.uid() OR fa.created_by = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Audit log RLS - only admins can view
CREATE POLICY "Only admins can view audit logs" ON audit_log_detailed
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('super_admin', 'admin')
        )
    );