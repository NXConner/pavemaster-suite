-- Calculator and Enhancement Tables Migration
-- Date: 2025-01-29
-- This migration adds missing tables for calculator features and enhanced project management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" IF NOT EXISTS;

-- Calculator Saved Calculations Table
-- For storing user's saved calculator results
CREATE TABLE IF NOT EXISTS calculator_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculator_type TEXT NOT NULL CHECK (calculator_type IN ('sealcoat', 'striping', 'material', 'cost', 'equipment')),
  calculation_name TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_template BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Rate Tables
-- For storing material costs and rates
CREATE TABLE IF NOT EXISTS material_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_type TEXT NOT NULL,
  material_name TEXT NOT NULL,
  unit_type TEXT NOT NULL, -- gallons, pounds, square_feet, etc.
  base_cost DECIMAL(10,2) NOT NULL,
  supplier_name TEXT,
  region TEXT DEFAULT 'default',
  quality_grade TEXT,
  seasonal_adjustments JSONB DEFAULT '{}'::jsonb,
  bulk_pricing JSONB DEFAULT '{}'::jsonb, -- tiered pricing
  is_active BOOLEAN DEFAULT true,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Rate Tables
-- For storing equipment hourly rates and costs
CREATE TABLE IF NOT EXISTS equipment_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_type TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  daily_rate DECIMAL(10,2),
  fuel_consumption_per_hour DECIMAL(8,3), -- gallons per hour
  operator_required BOOLEAN DEFAULT true,
  maintenance_cost_per_hour DECIMAL(8,2) DEFAULT 0,
  depreciation_per_hour DECIMAL(8,2) DEFAULT 0,
  region TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Estimates Enhanced
-- For storing detailed project estimates with calculator integration
CREATE TABLE IF NOT EXISTS project_estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  estimate_name TEXT NOT NULL,
  estimate_type TEXT CHECK (estimate_type IN ('sealcoat', 'striping', 'combined', 'custom')) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'client_sent', 'accepted', 'rejected')),
  
  -- Material estimates
  sealcoat_estimates JSONB DEFAULT '{}'::jsonb,
  striping_estimates JSONB DEFAULT '{}'::jsonb,
  material_estimates JSONB DEFAULT '{}'::jsonb,
  
  -- Cost breakdown
  material_cost DECIMAL(12,2) DEFAULT 0,
  labor_cost DECIMAL(12,2) DEFAULT 0,
  equipment_cost DECIMAL(12,2) DEFAULT 0,
  overhead_percentage DECIMAL(5,2) DEFAULT 15.0,
  profit_margin_percentage DECIMAL(5,2) DEFAULT 20.0,
  total_cost DECIMAL(12,2) NOT NULL,
  client_quote DECIMAL(12,2) NOT NULL,
  
  -- Additional details
  estimated_duration_hours DECIMAL(8,2),
  complexity_multiplier DECIMAL(3,2) DEFAULT 1.0,
  weather_contingency_days INTEGER DEFAULT 1,
  
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  sent_to_client_at TIMESTAMP WITH TIME ZONE,
  client_response_due TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculator Templates
-- For storing reusable calculator templates
CREATE TABLE IF NOT EXISTS calculator_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  calculator_type TEXT NOT NULL CHECK (calculator_type IN ('sealcoat', 'striping', 'material', 'cost', 'equipment')),
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regional Pricing Data
-- For location-based pricing adjustments
CREATE TABLE IF NOT EXISTS regional_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_name TEXT NOT NULL,
  state_code TEXT,
  city TEXT,
  zip_codes TEXT[],
  cost_adjustment_factor DECIMAL(4,3) DEFAULT 1.000, -- multiplier for base costs
  labor_rate_adjustment DECIMAL(4,3) DEFAULT 1.000,
  fuel_cost_adjustment DECIMAL(4,3) DEFAULT 1.000,
  permit_requirements JSONB DEFAULT '{}'::jsonb,
  seasonal_factors JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardian Features Enhancement Tables

-- Quality Control Checklists
CREATE TABLE IF NOT EXISTS quality_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  checklist_type TEXT NOT NULL CHECK (checklist_type IN ('pre_work', 'in_progress', 'completion', 'inspection')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_items JSONB DEFAULT '[]'::jsonb,
  inspector_id UUID REFERENCES auth.users(id),
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN,
  failed_items TEXT[],
  notes TEXT,
  photos TEXT[], -- URLs to stored photos
  signature_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Tracking
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('environmental', 'safety', 'permit', 'inspection', 'regulation')),
  requirement_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'waived')),
  due_date DATE,
  completion_date DATE,
  inspector_name TEXT,
  inspector_license TEXT,
  certificate_number TEXT,
  notes TEXT,
  documents TEXT[], -- URLs to compliance documents
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Weather Monitoring
CREATE TABLE IF NOT EXISTS weather_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  location_coordinates POINT,
  temperature_f DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  wind_speed_mph DECIMAL(5,2),
  wind_direction TEXT,
  precipitation_type TEXT CHECK (precipitation_type IN ('none', 'rain', 'snow', 'sleet', 'hail')),
  precipitation_amount_inches DECIMAL(6,3) DEFAULT 0,
  barometric_pressure DECIMAL(6,2),
  visibility_miles DECIMAL(5,2),
  uv_index INTEGER,
  conditions_summary TEXT,
  work_suitable BOOLEAN,
  delay_recommended BOOLEAN DEFAULT false,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api', 'sensor'))
);

-- Indexes for performance
CREATE INDEX idx_calculator_saves_user_id ON calculator_saves(user_id);
CREATE INDEX idx_calculator_saves_type ON calculator_saves(calculator_type);
CREATE INDEX idx_calculator_saves_project ON calculator_saves(project_id);

CREATE INDEX idx_material_rates_type ON material_rates(material_type);
CREATE INDEX idx_material_rates_active ON material_rates(is_active);
CREATE INDEX idx_material_rates_region ON material_rates(region);

CREATE INDEX idx_equipment_rates_type ON equipment_rates(equipment_type);
CREATE INDEX idx_equipment_rates_active ON equipment_rates(is_active);

CREATE INDEX idx_project_estimates_project ON project_estimates(project_id);
CREATE INDEX idx_project_estimates_status ON project_estimates(status);
CREATE INDEX idx_project_estimates_type ON project_estimates(estimate_type);

CREATE INDEX idx_quality_checklists_project ON quality_checklists(project_id);
CREATE INDEX idx_quality_checklists_job ON quality_checklists(job_id);
CREATE INDEX idx_quality_checklists_type ON quality_checklists(checklist_type);

CREATE INDEX idx_compliance_records_project ON compliance_records(project_id);
CREATE INDEX idx_compliance_records_type ON compliance_records(compliance_type);
CREATE INDEX idx_compliance_records_status ON compliance_records(status);

CREATE INDEX idx_weather_conditions_project ON weather_conditions(project_id);
CREATE INDEX idx_weather_conditions_recorded ON weather_conditions(recorded_at DESC);
CREATE INDEX idx_weather_conditions_location ON weather_conditions USING GIST(location_coordinates);

-- Row Level Security Policies
ALTER TABLE calculator_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calculator_saves
CREATE POLICY "Users can view their own calculator saves" ON calculator_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculator saves" ON calculator_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculator saves" ON calculator_saves
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for material_rates (readable by all authenticated users, updatable by admins)
CREATE POLICY "Authenticated users can view material rates" ON material_rates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage material rates" ON material_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for equipment_rates (similar to material_rates)
CREATE POLICY "Authenticated users can view equipment rates" ON equipment_rates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage equipment rates" ON equipment_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for project_estimates
CREATE POLICY "Users can view estimates for their projects" ON project_estimates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_estimates.project_id 
      AND (projects.manager_id = auth.uid() OR projects.client_id = auth.uid())
    )
  );

-- RLS Policies for quality_checklists
CREATE POLICY "Project team can view quality checklists" ON quality_checklists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = quality_checklists.project_id 
      AND (projects.manager_id = auth.uid() OR projects.client_id = auth.uid())
    )
  );

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_calculator_saves_updated_at 
  BEFORE UPDATE ON calculator_saves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_rates_updated_at 
  BEFORE UPDATE ON material_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_rates_updated_at 
  BEFORE UPDATE ON equipment_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_estimates_updated_at 
  BEFORE UPDATE ON project_estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculator_templates_updated_at 
  BEFORE UPDATE ON calculator_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at 
  BEFORE UPDATE ON compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for material rates
INSERT INTO material_rates (material_type, material_name, unit_type, base_cost, supplier_name, region) VALUES
('sealcoat', 'Coal Tar Emulsion', 'gallon', 2.50, 'SealMaster', 'default'),
('sealcoat', 'Asphalt Emulsion', 'gallon', 2.25, 'SealMaster', 'default'),
('sealcoat', 'Acrylic Sealer', 'gallon', 3.00, 'SealMaster', 'default'),
('sealcoat', 'Refined Tar', 'gallon', 2.75, 'SealMaster', 'default'),
('paint', 'White Striping Paint', 'gallon', 45.00, 'Sherwin Williams', 'default'),
('paint', 'Yellow Striping Paint', 'gallon', 47.00, 'Sherwin Williams', 'default'),
('paint', 'Blue Striping Paint', 'gallon', 50.00, 'Sherwin Williams', 'default'),
('aggregate', 'Sand (50lb bag)', 'bag', 4.50, 'Local Supplier', 'default'),
('additive', 'Latex Additive', 'gallon', 8.50, 'SealMaster', 'default');

-- Insert sample data for equipment rates
INSERT INTO equipment_rates (equipment_type, equipment_name, hourly_rate, daily_rate, fuel_consumption_per_hour, operator_required) VALUES
('sprayer', 'Sealcoat Sprayer 300 Gallon', 45.00, 320.00, 2.5, true),
('sprayer', 'Sealcoat Sprayer 500 Gallon', 65.00, 450.00, 3.2, true),
('striper', 'Line Striper - Walk Behind', 25.00, 180.00, 1.0, true),
('striper', 'Line Striper - Self Propelled', 40.00, 280.00, 1.8, true),
('truck', 'Material Transport Truck', 55.00, 400.00, 8.0, true),
('compactor', 'Asphalt Roller', 75.00, 550.00, 5.5, true);

-- Insert sample calculator template
INSERT INTO calculator_templates (template_name, calculator_type, template_data, description, is_public) VALUES
('Standard Parking Lot Sealcoat', 'sealcoat', 
'{"applicationRate": "0.15", "sealerType": "coal-tar", "additivesPercent": "10", "sandPounds": "50", "waterRatio": "25"}',
'Standard template for parking lot sealcoating projects', true),
('Basic Line Striping', 'striping', 
'{"paintType": "water-based", "lineWidth": "4", "doubleLines": false, "arrowsIncluded": true}',
'Basic template for parking lot line striping', true);

COMMENT ON TABLE calculator_saves IS 'Stores saved calculator results for users';
COMMENT ON TABLE material_rates IS 'Current material costs and rates for calculations';
COMMENT ON TABLE equipment_rates IS 'Equipment hourly and daily rates';
COMMENT ON TABLE project_estimates IS 'Detailed project estimates with calculator integration';
COMMENT ON TABLE calculator_templates IS 'Reusable calculator templates';
COMMENT ON TABLE regional_pricing IS 'Location-based pricing adjustments';
COMMENT ON TABLE quality_checklists IS 'Quality control checklists for projects';
COMMENT ON TABLE compliance_records IS 'Compliance and regulatory tracking';
COMMENT ON TABLE weather_conditions IS 'Enhanced weather monitoring for projects';

-- Migration completion message
SELECT 'Calculator and enhancement tables migration completed successfully!' as status;