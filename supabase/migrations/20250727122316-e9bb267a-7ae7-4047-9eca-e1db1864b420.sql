-- Create missing ENUM types and add columns to projects table

-- Create project_type enum
DO $$ BEGIN
    CREATE TYPE project_type AS ENUM ('asphalt_paving', 'sealcoating', 'line_striping', 'crack_sealing', 'pothole_repair', 'overlay', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create equipment_type enum
DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM ('paver', 'roller', 'truck', 'trailer', 'compactor', 'seal_coating_tank', 'line_striper', 'crack_sealer', 'tools');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create equipment_status enum
DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type project_type DEFAULT 'asphalt_paving';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(12,2);

-- Update any existing records without project_type
UPDATE projects SET project_type = 'asphalt_paving' WHERE project_type IS NULL;