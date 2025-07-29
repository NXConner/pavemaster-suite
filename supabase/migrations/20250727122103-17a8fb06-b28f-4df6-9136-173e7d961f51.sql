-- Basic Database Schema Setup
-- Creates core tables without complex policies for Pavement Performance Suite

-- Create ENUM types for data consistency
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
    CREATE TYPE equipment_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM ('paver', 'roller', 'truck', 'trailer', 'compactor', 'seal_coating_tank', 'line_striper', 'crack_sealer', 'tools');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create core projects table
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
    start_date DATE,
    end_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    equipment_type equipment_type NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    serial_number VARCHAR(100) UNIQUE,
    status equipment_status DEFAULT 'available',
    location VARCHAR(255),
    assigned_to UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_leader_id UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('project-photos', 'project-photos', true),
    ('equipment-docs', 'equipment-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow authenticated users to view/manage
CREATE POLICY "Allow authenticated users to view projects" ON projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert projects" ON projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Allow authenticated users to view equipment" ON equipment_assets
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert equipment" ON equipment_assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view teams" ON teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert teams" ON teams
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-photos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow users to view project photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-photos');

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_assets(status);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned_to ON equipment_assets(assigned_to);

-- Enable realtime for projects
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;