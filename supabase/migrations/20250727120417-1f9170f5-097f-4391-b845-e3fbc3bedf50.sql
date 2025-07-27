-- Complete Database Schema for Pavement Performance Suite (Fixed)
-- This migration creates all core business entities and relationships

-- Create ENUM types only if they don't exist
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_type AS ENUM ('asphalt_paving', 'sealcoating', 'line_striping', 'crack_sealing', 'pothole_repair', 'overlay', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'crew_leader', 'crew_member', 'driver', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM ('paver', 'roller', 'truck', 'trailer', 'compactor', 'seal_coating_tank', 'line_striper', 'crack_sealer', 'tools');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE measurement_type AS ENUM ('area', 'length', 'depth', 'temperature', 'density', 'thickness');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE financial_type AS ENUM ('income', 'expense', 'estimate', 'invoice', 'payment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE safety_incident_type AS ENUM ('injury', 'near_miss', 'property_damage', 'equipment_damage', 'violation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update user_profiles table to include comprehensive user management
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS driver_license_expiry DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type project_type NOT NULL,
    status project_status DEFAULT 'planning',
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    site_address TEXT NOT NULL,
    site_coordinates POINT,
    start_date DATE,
    end_date DATE,
    estimated_completion DATE,
    actual_completion DATE,
    total_area DECIMAL(12,2),
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    materials_needed JSONB DEFAULT '{}'::jsonb,
    special_requirements TEXT,
    weather_constraints TEXT,
    created_by UUID REFERENCES user_profiles(id),
    project_manager_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_leader_id UUID REFERENCES user_profiles(id),
    specialization equipment_type,
    max_capacity INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_members junction table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    joined_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);

-- Create comprehensive equipment table
CREATE TABLE IF NOT EXISTS equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    equipment_type equipment_type NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    serial_number VARCHAR(100) UNIQUE,
    license_plate VARCHAR(20),
    vin VARCHAR(50),
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    current_value DECIMAL(12,2),
    status equipment_status DEFAULT 'available',
    location VARCHAR(255),
    assigned_to UUID REFERENCES user_profiles(id),
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_interval_days INTEGER DEFAULT 90,
    fuel_capacity DECIMAL(8,2),
    operating_hours DECIMAL(10,1) DEFAULT 0,
    specifications JSONB DEFAULT '{}'::jsonb,
    maintenance_notes TEXT,
    insurance_expiry DATE,
    registration_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create schedules table for project scheduling
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status schedule_status DEFAULT 'scheduled',
    location TEXT,
    weather_requirements TEXT,
    equipment_needed UUID[] DEFAULT ARRAY[]::UUID[],
    materials_needed JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create photos table for project documentation
CREATE TABLE IF NOT EXISTS project_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    caption TEXT,
    photo_type VARCHAR(50), -- 'before', 'during', 'after', 'issue', 'completion'
    gps_coordinates POINT,
    taken_by UUID REFERENCES user_profiles(id),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    weather_conditions TEXT,
    temperature DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create measurements table for quality control
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    measurement_type measurement_type NOT NULL,
    value DECIMAL(12,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    location_description TEXT,
    gps_coordinates POINT,
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    measured_by UUID REFERENCES user_profiles(id),
    equipment_used VARCHAR(255),
    weather_conditions TEXT,
    temperature DECIMAL(5,2),
    notes TEXT,
    quality_status VARCHAR(50), -- 'pass', 'fail', 'marginal'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create financial_entries table for cost tracking
CREATE TABLE IF NOT EXISTS financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    entry_type financial_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- 'materials', 'labor', 'equipment', 'overhead', 'profit'
    vendor VARCHAR(255),
    receipt_number VARCHAR(100),
    receipt_file_path TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    is_billable BOOLEAN DEFAULT true,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    entered_by UUID REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approval_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create safety_logs table for incident tracking
CREATE TABLE IF NOT EXISTS safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    incident_type safety_incident_type NOT NULL,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    incident_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reported_by UUID REFERENCES user_profiles(id),
    people_involved UUID[] DEFAULT ARRAY[]::UUID[],
    equipment_involved UUID[] DEFAULT ARRAY[]::UUID[],
    injuries_sustained TEXT,
    property_damage_description TEXT,
    estimated_damage_cost DECIMAL(12,2),
    immediate_actions_taken TEXT,
    corrective_actions_planned TEXT,
    investigation_notes TEXT,
    photos TEXT[], -- Array of file paths
    witness_statements TEXT,
    regulatory_notification_required BOOLEAN DEFAULT false,
    regulatory_notification_sent BOOLEAN DEFAULT false,
    incident_closed BOOLEAN DEFAULT false,
    closed_by UUID REFERENCES user_profiles(id),
    closed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create equipment_assignments table to track equipment usage
CREATE TABLE IF NOT EXISTS equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment_assets(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES user_profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    returned_at TIMESTAMP WITH TIME ZONE,
    condition_out VARCHAR(100), -- 'excellent', 'good', 'fair', 'poor'
    condition_in VARCHAR(100),
    hours_used DECIMAL(8,2),
    fuel_used DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment_assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50), -- 'preventive', 'corrective', 'emergency'
    description TEXT NOT NULL,
    performed_by UUID REFERENCES user_profiles(id),
    performed_date DATE DEFAULT CURRENT_DATE,
    cost DECIMAL(10,2),
    parts_used TEXT,
    vendor VARCHAR(255),
    next_maintenance_due DATE,
    hours_at_maintenance DECIMAL(10,1),
    notes TEXT,
    receipt_file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create time_tracking table for payroll
CREATE TABLE IF NOT EXISTS time_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_duration_minutes INTEGER DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    work_description TEXT,
    gps_location_in POINT,
    gps_location_out POINT,
    approved_by UUID REFERENCES user_profiles(id),
    approval_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('project-photos', 'project-photos', true),
    ('equipment-docs', 'equipment-docs', true),
    ('receipts', 'receipts', false),
    ('safety-docs', 'safety-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on all new tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Projects policies
DROP POLICY IF EXISTS "Users can view projects they're involved in" ON projects;
CREATE POLICY "Users can view projects they're involved in" ON projects
    FOR SELECT USING (
        created_by = auth.uid() OR 
        project_manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
        ) OR
        EXISTS (
            SELECT 1 FROM schedules s 
            JOIN team_members tm ON s.team_id = tm.team_id 
            WHERE s.project_id = projects.id AND tm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Managers and admins can insert projects" ON projects;
CREATE POLICY "Managers and admins can insert projects" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (
                is_admin = true OR 
                role IN ('super_admin', 'admin', 'manager')
            )
        )
    );

DROP POLICY IF EXISTS "Project creators and managers can update projects" ON projects;
CREATE POLICY "Project creators and managers can update projects" ON projects
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        project_manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
        )
    );

-- Teams policies
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
CREATE POLICY "Users can view teams they belong to" ON teams
    FOR SELECT USING (
        team_leader_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "Managers can manage teams" ON teams;
CREATE POLICY "Managers can manage teams" ON teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (
                is_admin = true OR 
                role IN ('super_admin', 'admin', 'manager')
            )
        )
    );

-- Equipment policies
DROP POLICY IF EXISTS "All authenticated users can view equipment" ON equipment_assets;
CREATE POLICY "All authenticated users can view equipment" ON equipment_assets
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Managers can manage equipment" ON equipment_assets;
CREATE POLICY "Managers can manage equipment" ON equipment_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (
                is_admin = true OR 
                role IN ('super_admin', 'admin', 'manager')
            )
        )
    );

-- Safety logs policies  
DROP POLICY IF EXISTS "Users can view safety logs they're involved in" ON safety_logs;
CREATE POLICY "Users can view safety logs they're involved in" ON safety_logs
    FOR SELECT USING (
        reported_by = auth.uid() OR
        auth.uid() = ANY(people_involved) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "All users can report safety incidents" ON safety_logs;
CREATE POLICY "All users can report safety incidents" ON safety_logs
    FOR INSERT WITH CHECK (reported_by = auth.uid());

-- Time tracking policies
DROP POLICY IF EXISTS "Users can view their own time tracking" ON time_tracking;
CREATE POLICY "Users can view their own time tracking" ON time_tracking
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "Users can record their own time" ON time_tracking;
CREATE POLICY "Users can record their own time" ON time_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Storage policies for file uploads
DROP POLICY IF EXISTS "Users can upload project photos" ON storage.objects;
CREATE POLICY "Users can upload project photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-photos' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can view project photos" ON storage.objects;
CREATE POLICY "Users can view project photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-photos');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_dates ON schedules(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);

CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_assets(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment_assets(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned_to ON equipment_assets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_project_id ON time_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_dates ON time_tracking(clock_in, clock_out);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment_assets;
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_updated_at ON financial_entries;
CREATE TRIGGER update_financial_updated_at BEFORE UPDATE ON financial_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_safety_updated_at ON safety_logs;
CREATE TRIGGER update_safety_updated_at BEFORE UPDATE ON safety_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for critical tables
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE schedules REPLICA IDENTITY FULL;
ALTER TABLE equipment_assets REPLICA IDENTITY FULL;
ALTER TABLE safety_logs REPLICA IDENTITY FULL;
ALTER TABLE time_tracking REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE equipment_assets;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE safety_logs;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE time_tracking;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;