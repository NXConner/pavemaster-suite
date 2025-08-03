-- Guardian and Calculator Integration Migration
-- Adds tables for AsphaltGuardian monitoring, calculators, and regulations functionality
-- Version: 1.0.0
-- Date: 2025-01-30

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================
-- GUARDIAN MONITORING TABLES
-- =======================

-- Quality Metrics Monitoring
CREATE TABLE quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  site_location TEXT,
  metric_name TEXT NOT NULL CHECK (metric_name IN (
    'surface_temperature', 'humidity_level', 'wind_speed', 'compaction_level',
    'material_temperature', 'ambient_temperature', 'surface_moisture', 'density'
  )),
  value NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('optimal', 'good', 'acceptable', 'poor', 'critical')),
  acceptable_range TEXT,
  threshold_min NUMERIC(10,3),
  threshold_max NUMERIC(10,3),
  device_id TEXT,
  sensor_location POINT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Monitoring
CREATE TABLE compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN (
    'dot_standards', 'environmental_regs', 'safety_protocols', 'quality_specs',
    'osha_requirements', 'local_regulations', 'federal_standards', 'industry_standards'
  )),
  regulation_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('compliant', 'warning', 'non_compliant', 'pending')),
  description TEXT,
  requirement_details JSONB DEFAULT '{}',
  last_check_date TIMESTAMP WITH TIME ZONE,
  next_check_due TIMESTAMP WITH TIME ZONE,
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  corrective_actions JSONB DEFAULT '[]',
  evidence_files TEXT[] DEFAULT '{}',
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Alerts and Incidents
CREATE TABLE inspection_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'temperature_deviation', 'compaction_issue', 'material_quality', 'safety_concern',
    'equipment_malfunction', 'weather_impact', 'compliance_violation', 'quality_failure'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  location_details TEXT,
  gps_coordinates POINT,
  affected_area NUMERIC(10,2), -- square feet
  severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
  immediate_action_required BOOLEAN DEFAULT false,
  resolution_deadline TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  prevention_measures JSONB DEFAULT '[]',
  related_metrics JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardian Analytics Data
CREATE TABLE guardian_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  analysis_date DATE DEFAULT CURRENT_DATE,
  quality_score NUMERIC(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  efficiency_score NUMERIC(5,2) CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  compliance_rate NUMERIC(5,2) CHECK (compliance_rate >= 0 AND compliance_rate <= 100),
  safety_score NUMERIC(5,2) CHECK (safety_score >= 0 AND safety_score <= 100),
  total_inspections INTEGER DEFAULT 0,
  passed_inspections INTEGER DEFAULT 0,
  failed_inspections INTEGER DEFAULT 0,
  pending_inspections INTEGER DEFAULT 0,
  average_temperature NUMERIC(6,2),
  average_humidity NUMERIC(5,2),
  average_compaction NUMERIC(5,2),
  weather_delays_hours NUMERIC(6,2) DEFAULT 0,
  equipment_downtime_hours NUMERIC(6,2) DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  performance_trends JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- CALCULATOR TABLES
-- =======================

-- Calculation Projects (for all calculator types)
CREATE TABLE calculation_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN (
    'sealcoat', 'striping', 'material_estimate', 'cost_analysis', 'asphalt_mix'
  )),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
  location TEXT,
  client_name TEXT,
  project_data JSONB NOT NULL DEFAULT '{}',
  results_data JSONB NOT NULL DEFAULT '{}',
  cost_breakdown JSONB DEFAULT '{}',
  material_specifications JSONB DEFAULT '{}',
  labor_calculations JSONB DEFAULT '{}',
  equipment_requirements JSONB DEFAULT '{}',
  environmental_factors JSONB DEFAULT '{}',
  version_number INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  tags TEXT[] DEFAULT '{}',
  shared_with UUID[] DEFAULT '{}',
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sealcoat Calculations
CREATE TABLE sealcoat_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculation_project_id UUID REFERENCES calculation_projects(id) ON DELETE CASCADE,
  length_feet NUMERIC(10,2) NOT NULL,
  width_feet NUMERIC(10,2) NOT NULL,
  thickness_inches NUMERIC(4,2) DEFAULT 0.25,
  number_of_coats INTEGER DEFAULT 2 CHECK (number_of_coats >= 1 AND number_of_coats <= 5),
  surface_type TEXT NOT NULL CHECK (surface_type IN ('asphalt', 'concrete')),
  surface_condition TEXT NOT NULL CHECK (surface_condition IN ('excellent', 'good', 'fair', 'poor')),
  coverage_rate NUMERIC(6,2), -- sq ft per gallon
  total_area NUMERIC(12,2),
  gallons_needed NUMERIC(10,2),
  sand_bags_needed INTEGER,
  primer_gallons NUMERIC(8,2) DEFAULT 0,
  sealcoat_cost_per_gallon NUMERIC(8,2),
  sand_cost_per_bag NUMERIC(8,2),
  primer_cost_per_gallon NUMERIC(8,2),
  labor_rate_per_hour NUMERIC(8,2),
  estimated_labor_hours NUMERIC(6,2),
  total_material_cost NUMERIC(10,2),
  total_labor_cost NUMERIC(10,2),
  total_project_cost NUMERIC(10,2),
  weather_conditions JSONB DEFAULT '{}',
  application_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Striping Calculations
CREATE TABLE striping_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculation_project_id UUID REFERENCES calculation_projects(id) ON DELETE CASCADE,
  project_temperature NUMERIC(5,2),
  project_humidity NUMERIC(5,2),
  total_linear_feet NUMERIC(12,2),
  white_paint_gallons NUMERIC(10,2),
  yellow_paint_gallons NUMERIC(10,2),
  glass_beads_bags INTEGER,
  primer_gallons NUMERIC(8,2),
  white_paint_cost_per_gallon NUMERIC(8,2),
  yellow_paint_cost_per_gallon NUMERIC(8,2),
  glass_beads_cost_per_bag NUMERIC(8,2),
  primer_cost_per_gallon NUMERIC(8,2),
  labor_rate_per_hour NUMERIC(8,2),
  estimated_labor_hours NUMERIC(6,2),
  delivery_trips INTEGER,
  delivery_cost NUMERIC(8,2),
  total_material_cost NUMERIC(10,2),
  total_labor_cost NUMERIC(10,2),
  total_project_cost NUMERIC(10,2),
  application_specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Striping Lines (for detailed line specifications)
CREATE TABLE striping_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  striping_calculation_id UUID REFERENCES striping_calculations(id) ON DELETE CASCADE,
  line_name TEXT,
  line_type TEXT NOT NULL CHECK (line_type IN ('solid', 'dashed', 'double')),
  width_inches INTEGER NOT NULL CHECK (width_inches IN (4, 6, 8, 12)),
  length_feet NUMERIC(10,2) NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('white', 'yellow')),
  coverage_rate NUMERIC(6,2), -- linear feet per gallon
  paint_needed NUMERIC(8,2),
  line_order INTEGER DEFAULT 1,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Estimation Calculations
CREATE TABLE material_estimations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculation_project_id UUID REFERENCES calculation_projects(id) ON DELETE CASCADE,
  contractor_name TEXT,
  start_date DATE,
  total_area NUMERIC(12,2),
  total_volume NUMERIC(12,3),
  total_asphalt_tons NUMERIC(10,2),
  total_aggregate_tons NUMERIC(10,2),
  total_binding_agent_tons NUMERIC(10,2),
  standard_mix_cost_per_ton NUMERIC(8,2),
  premium_mix_cost_per_ton NUMERIC(8,2),
  recycled_mix_cost_per_ton NUMERIC(8,2),
  aggregate_cost_per_ton NUMERIC(8,2),
  binding_agent_cost_per_ton NUMERIC(8,2),
  fuel_surcharge_per_ton NUMERIC(8,2),
  delivery_rate_per_hour NUMERIC(8,2),
  labor_rate_per_hour NUMERIC(8,2),
  delivery_trips INTEGER,
  estimated_labor_hours NUMERIC(8,2),
  total_material_cost NUMERIC(12,2),
  total_delivery_cost NUMERIC(10,2),
  total_labor_cost NUMERIC(10,2),
  total_project_cost NUMERIC(12,2),
  cost_per_square_foot NUMERIC(8,4),
  logistics_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Estimation Zones (for detailed zone breakdown)
CREATE TABLE material_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_estimation_id UUID REFERENCES material_estimations(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  length_feet NUMERIC(10,2) NOT NULL,
  width_feet NUMERIC(10,2) NOT NULL,
  thickness_inches INTEGER NOT NULL CHECK (thickness_inches IN (2, 3, 4, 6, 8)),
  surface_type TEXT NOT NULL CHECK (surface_type IN ('new', 'overlay', 'patch')),
  mix_type TEXT NOT NULL CHECK (mix_type IN ('standard', 'premium', 'recycled')),
  zone_area NUMERIC(12,2),
  zone_volume NUMERIC(12,3),
  estimated_tons NUMERIC(10,2),
  zone_cost NUMERIC(10,2),
  special_requirements TEXT,
  zone_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- REGULATIONS AND STANDARDS
-- =======================

-- Regulations Database
CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  regulation_type TEXT NOT NULL CHECK (regulation_type IN (
    'federal', 'state', 'local', 'industry_standard', 'technical_specification'
  )),
  category TEXT NOT NULL CHECK (category IN (
    'safety', 'environmental', 'quality', 'materials', 'construction', 'testing',
    'inspection', 'documentation', 'certification', 'compliance'
  )),
  issuing_authority TEXT NOT NULL,
  regulation_number TEXT,
  effective_date DATE,
  expiration_date DATE,
  version TEXT,
  description TEXT NOT NULL,
  full_text TEXT,
  summary TEXT,
  applicability JSONB DEFAULT '{}', -- When/where this applies
  requirements JSONB DEFAULT '[]', -- Specific requirements
  penalties JSONB DEFAULT '{}', -- Non-compliance penalties
  related_regulations UUID[] DEFAULT '{}',
  reference_documents TEXT[] DEFAULT '{}',
  compliance_checklist JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technical Standards
CREATE TABLE technical_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization TEXT NOT NULL, -- AASHTO, ASTM, etc.
  standard_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'material_testing', 'construction_methods', 'quality_control', 'design_standards',
    'safety_standards', 'equipment_standards', 'measurement_standards'
  )),
  applicable_materials TEXT[] DEFAULT '{}',
  test_methods JSONB DEFAULT '[]',
  acceptance_criteria JSONB DEFAULT '{}',
  sampling_requirements JSONB DEFAULT '{}',
  equipment_required TEXT[] DEFAULT '{}',
  revision_date DATE,
  superseded_standards TEXT[] DEFAULT '{}',
  related_standards TEXT[] DEFAULT '{}',
  cost_per_test NUMERIC(8,2),
  typical_test_duration TEXT,
  certification_required BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  geographic_scope TEXT[] DEFAULT '{}', -- States, regions where applicable
  project_types TEXT[] DEFAULT '{}', -- Types of projects this applies to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Compliance Tracking
CREATE TABLE project_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES regulations(id) ON DELETE CASCADE,
  compliance_status TEXT NOT NULL CHECK (compliance_status IN (
    'compliant', 'non_compliant', 'pending_review', 'in_progress', 'not_applicable'
  )),
  last_assessment_date TIMESTAMP WITH TIME ZONE,
  next_assessment_due TIMESTAMP WITH TIME ZONE,
  assessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  compliance_notes TEXT,
  evidence_files TEXT[] DEFAULT '{}',
  corrective_actions_required JSONB DEFAULT '[]',
  corrective_actions_completed JSONB DEFAULT '[]',
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================

-- Quality Metrics Indexes
CREATE INDEX idx_quality_metrics_project_id ON quality_metrics(project_id);
CREATE INDEX idx_quality_metrics_recorded_at ON quality_metrics(recorded_at DESC);
CREATE INDEX idx_quality_metrics_metric_name ON quality_metrics(metric_name);
CREATE INDEX idx_quality_metrics_status ON quality_metrics(status);

-- Compliance Checks Indexes
CREATE INDEX idx_compliance_checks_project_id ON compliance_checks(project_id);
CREATE INDEX idx_compliance_checks_type ON compliance_checks(compliance_type);
CREATE INDEX idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX idx_compliance_checks_priority ON compliance_checks(priority_level);

-- Inspection Alerts Indexes
CREATE INDEX idx_inspection_alerts_project_id ON inspection_alerts(project_id);
CREATE INDEX idx_inspection_alerts_priority ON inspection_alerts(priority);
CREATE INDEX idx_inspection_alerts_status ON inspection_alerts(status);
CREATE INDEX idx_inspection_alerts_created_at ON inspection_alerts(created_at DESC);

-- Calculator Indexes
CREATE INDEX idx_calculation_projects_user_id ON calculation_projects(user_id);
CREATE INDEX idx_calculation_projects_type ON calculation_projects(calculation_type);
CREATE INDEX idx_calculation_projects_status ON calculation_projects(status);
CREATE INDEX idx_calculation_projects_created_at ON calculation_projects(created_at DESC);

-- Regulations Indexes
CREATE INDEX idx_regulations_type ON regulations(regulation_type);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_regulations_active ON regulations(is_active);
CREATE INDEX idx_regulations_authority ON regulations(issuing_authority);
CREATE INDEX idx_regulations_keywords ON regulations USING GIN(keywords);
CREATE INDEX idx_regulations_tags ON regulations USING GIN(tags);

-- Technical Standards Indexes
CREATE INDEX idx_technical_standards_organization ON technical_standards(organization);
CREATE INDEX idx_technical_standards_category ON technical_standards(category);
CREATE INDEX idx_technical_standards_materials ON technical_standards USING GIN(applicable_materials);

-- Project Compliance Indexes
CREATE INDEX idx_project_compliance_project_id ON project_compliance(project_id);
CREATE INDEX idx_project_compliance_regulation_id ON project_compliance(regulation_id);
CREATE INDEX idx_project_compliance_status ON project_compliance(compliance_status);

-- =======================
-- ROW LEVEL SECURITY
-- =======================

-- Enable RLS on all tables
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sealcoat_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE striping_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE striping_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_compliance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Guardian tables
CREATE POLICY "Users can view metrics for their projects" ON quality_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = quality_metrics.project_id 
      AND (p.client_id = auth.uid() OR p.manager_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert metrics for their projects" ON quality_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = quality_metrics.project_id 
      AND (p.client_id = auth.uid() OR p.manager_id = auth.uid())
    )
  );

-- Similar policies for other Guardian tables
CREATE POLICY "Users can view compliance for their projects" ON compliance_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = compliance_checks.project_id 
      AND (p.client_id = auth.uid() OR p.manager_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage alerts for their projects" ON inspection_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = inspection_alerts.project_id 
      AND (p.client_id = auth.uid() OR p.manager_id = auth.uid())
    )
  );

-- RLS Policies for Calculator tables
CREATE POLICY "Users can manage their own calculations" ON calculation_projects
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view calculations shared with them" ON calculation_projects
  FOR SELECT USING (auth.uid() = ANY(shared_with));

-- RLS Policies for Regulations (public read access)
CREATE POLICY "Everyone can view active regulations" ON regulations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can view technical standards" ON technical_standards
  FOR SELECT USING (true);

-- =======================
-- TRIGGERS FOR TIMESTAMPS
-- =======================

CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inspection_alerts_updated_at BEFORE UPDATE ON inspection_alerts
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_calculation_projects_updated_at BEFORE UPDATE ON calculation_projects
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_regulations_updated_at BEFORE UPDATE ON regulations
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_technical_standards_updated_at BEFORE UPDATE ON technical_standards
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_project_compliance_updated_at BEFORE UPDATE ON project_compliance
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =======================
-- SAMPLE DATA
-- =======================

-- Insert sample regulations
INSERT INTO regulations (
  title, regulation_type, category, issuing_authority, regulation_number,
  effective_date, description, summary, requirements, is_active
) VALUES 
(
  'FHWA Highway Construction Standards',
  'federal',
  'construction',
  'Federal Highway Administration',
  'FHWA-HIF-23-001',
  '2023-01-01',
  'Federal standards for highway construction and maintenance including material specifications and quality standards.',
  'Comprehensive guidelines for highway construction projects.',
  '[{"requirement": "Material testing compliance", "mandatory": true}, {"requirement": "Quality control procedures", "mandatory": true}]',
  true
),
(
  'EPA Environmental Construction Standards',
  'federal',
  'environmental',
  'Environmental Protection Agency',
  'EPA-402-K-23-001',
  '2023-03-15',
  'Environmental regulations for construction activities, waste management, and air quality.',
  'Environmental protection requirements for construction projects.',
  '[{"requirement": "Air quality monitoring", "mandatory": true}, {"requirement": "Waste disposal protocols", "mandatory": true}]',
  true
),
(
  'OSHA Construction Safety Standards',
  'federal',
  'safety',
  'Occupational Safety and Health Administration',
  'OSHA-1926',
  '2024-01-01',
  'Workplace safety standards for construction and road work operations.',
  'Safety requirements for construction workers and operations.',
  '[{"requirement": "Personal protective equipment", "mandatory": true}, {"requirement": "Safety training", "mandatory": true}]',
  true
);

-- Insert sample technical standards
INSERT INTO technical_standards (
  organization, standard_number, title, description, category,
  applicable_materials, test_methods, acceptance_criteria
) VALUES 
(
  'AASHTO',
  'M 323',
  'Superpave Volumetric Mix Design',
  'Standard method for asphalt mix design using Superpave criteria.',
  'material_testing',
  '["hot_mix_asphalt", "asphalt_binder", "aggregate"]',
  '[{"method": "Superpave Gyratory Compactor", "standard": "AASHTO T 312"}]',
  '{"air_voids": "4.0 ± 0.5%", "vma": "≥ 13%", "vfa": "65-78%"}'
),
(
  'ASTM',
  'D6926',
  'Standard Practice for Preparation of Bituminous Specimens',
  'Laboratory compaction procedures for asphalt specimens.',
  'material_testing',
  '["hot_mix_asphalt", "bituminous_mixtures"]',
  '[{"method": "Gyratory compaction", "standard": "ASTM D6925"}]',
  '{"target_air_voids": "7.0 ± 0.5%", "specimen_height": "95 ± 5 mm"}'
),
(
  'ASTM',
  'D6927',
  'Marshall Stability and Flow Test',
  'Test method for determining stability and flow of asphalt mixtures.',
  'material_testing',
  '["hot_mix_asphalt"]',
  '[{"method": "Marshall stability test", "temperature": "60°C"}]',
  '{"min_stability": "8 kN", "flow_range": "2-4 mm"}'
);

-- Add comments for documentation
COMMENT ON TABLE quality_metrics IS 'Real-time quality monitoring data from Guardian system';
COMMENT ON TABLE compliance_checks IS 'Regulatory compliance tracking and monitoring';
COMMENT ON TABLE inspection_alerts IS 'Inspection alerts and incident management';
COMMENT ON TABLE calculation_projects IS 'Calculator project data for all calculation types';
COMMENT ON TABLE regulations IS 'Regulatory requirements and standards database';
COMMENT ON TABLE technical_standards IS 'Industry technical standards and specifications';

-- Migration complete
SELECT 'Guardian and Calculator integration migration completed successfully!' as status;