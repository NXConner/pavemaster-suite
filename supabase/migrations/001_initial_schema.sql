-- Initial Schema for Pavement Performance Suite
-- Version: 1.0.0
-- Date: 2024-01-15

-- Enable Row Level Security
ALTER DATABASE CURRENT_DATABASE SET row_security = on;

-- Users Table with Enhanced Metadata
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'manager', 'field_crew', 'client')) DEFAULT 'field_crew',
    company_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    account_status TEXT CHECK (account_status IN ('active', 'suspended', 'pending_verification')) DEFAULT 'pending_verification',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES users(id),
    manager_id UUID REFERENCES users(id),
    status TEXT CHECK (status IN ('planning', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planning',
    type TEXT CHECK (type IN ('parking_lot', 'road', 'sealcoating', 'line_striping')) NOT NULL,
    location_address TEXT,
    location_coordinates POINT,
    start_date DATE,
    end_date DATE,
    estimated_cost NUMERIC(10,2),
    actual_cost NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('vehicle', 'machinery', 'tool', 'sensor')) NOT NULL,
    serial_number TEXT UNIQUE,
    purchase_date DATE,
    last_maintenance_date DATE,
    current_location TEXT,
    status TEXT CHECK (status IN ('operational', 'maintenance', 'retired')) DEFAULT 'operational',
    owner_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials Inventory
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('asphalt', 'sealcoat', 'paint', 'aggregate')) NOT NULL,
    current_quantity NUMERIC(10,2),
    unit_of_measure TEXT,
    unit_cost NUMERIC(10,2),
    supplier_name TEXT,
    reorder_point NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Materials Tracking
CREATE TABLE project_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    material_id UUID REFERENCES materials(id),
    quantity_used NUMERIC(10,2),
    estimated_quantity NUMERIC(10,2),
    cost NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Tracking
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'invoiced')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Measurements and Estimates
CREATE TABLE project_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    type TEXT CHECK (type IN ('area', 'length', 'volume')) NOT NULL,
    value NUMERIC(10,2),
    unit TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IoT Device Tracking
CREATE TABLE iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_type TEXT CHECK (device_type IN ('gps', 'temperature', 'humidity', 'pressure')) NOT NULL,
    serial_number TEXT UNIQUE,
    current_status TEXT CHECK (current_status IN ('online', 'offline', 'maintenance')) DEFAULT 'online',
    last_data_received TIMESTAMPTZ,
    battery_level NUMERIC(5,2),
    location POINT,
    associated_equipment_id UUID REFERENCES equipment(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather Monitoring
CREATE TABLE weather_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    temperature NUMERIC(5,2),
    humidity NUMERIC(5,2),
    wind_speed NUMERIC(5,2),
    precipitation BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
-- Users can only see and modify their own data or data they're associated with

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see all projects" ON projects 
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );
CREATE POLICY "Users can see projects they're involved in" ON projects
    FOR SELECT USING (
        client_id = auth.uid() OR manager_id = auth.uid()
    );

-- Similar RLS policies would be created for other tables

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);