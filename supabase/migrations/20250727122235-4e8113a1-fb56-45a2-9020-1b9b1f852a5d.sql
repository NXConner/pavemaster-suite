-- Add missing columns to existing tables

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type project_type;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(12,2);

-- Update projects status enum to match our values
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'planning';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'active';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'on_hold';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Set default project_type for existing records without it
UPDATE projects SET project_type = 'asphalt_paving' WHERE project_type IS NULL;