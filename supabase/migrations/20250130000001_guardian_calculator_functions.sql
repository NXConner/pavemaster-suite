-- Guardian and Calculator Database Functions and Views
-- Provides utility functions and analytics views for the integrated functionality
-- Version: 1.0.0
-- Date: 2025-01-30

-- =======================
-- GUARDIAN MONITORING FUNCTIONS
-- =======================

-- Function to calculate quality score for a project
CREATE OR REPLACE FUNCTION calculate_project_quality_score(p_project_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  quality_score NUMERIC := 0;
  metric_count INTEGER := 0;
  avg_status_score NUMERIC;
BEGIN
  -- Calculate average status score based on recent metrics
  SELECT 
    AVG(
      CASE 
        WHEN status = 'optimal' THEN 100
        WHEN status = 'good' THEN 85
        WHEN status = 'acceptable' THEN 70
        WHEN status = 'poor' THEN 40
        WHEN status = 'critical' THEN 10
        ELSE 0
      END
    ),
    COUNT(*)
  INTO avg_status_score, metric_count
  FROM quality_metrics 
  WHERE project_id = p_project_id 
    AND recorded_at >= NOW() - INTERVAL '24 hours';

  -- Return score or 0 if no data
  RETURN COALESCE(avg_status_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance rate for a project
CREATE OR REPLACE FUNCTION calculate_compliance_rate(p_project_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_checks INTEGER := 0;
  compliant_checks INTEGER := 0;
  compliance_rate NUMERIC := 0;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'compliant' THEN 1 END)
  INTO total_checks, compliant_checks
  FROM compliance_checks 
  WHERE project_id = p_project_id;

  IF total_checks > 0 THEN
    compliance_rate := (compliant_checks::NUMERIC / total_checks::NUMERIC) * 100;
  END IF;

  RETURN compliance_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to identify critical alerts
CREATE OR REPLACE FUNCTION get_critical_alerts(p_project_id UUID DEFAULT NULL)
RETURNS TABLE (
  alert_id UUID,
  project_id UUID,
  title TEXT,
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  days_open INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ia.id,
    ia.project_id,
    ia.title,
    ia.priority,
    ia.created_at,
    EXTRACT(days FROM NOW() - ia.created_at)::INTEGER
  FROM inspection_alerts ia
  WHERE 
    ia.status IN ('active', 'acknowledged')
    AND ia.priority IN ('high', 'critical')
    AND (p_project_id IS NULL OR ia.project_id = p_project_id)
  ORDER BY 
    CASE ia.priority 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      ELSE 3 
    END,
    ia.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update guardian analytics
CREATE OR REPLACE FUNCTION update_guardian_analytics(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  analysis_record guardian_analytics%ROWTYPE;
BEGIN
  -- Calculate current metrics
  SELECT 
    p_project_id,
    CURRENT_DATE,
    calculate_project_quality_score(p_project_id),
    85.0, -- efficiency_score placeholder
    calculate_compliance_rate(p_project_id),
    90.0, -- safety_score placeholder
    COUNT(CASE WHEN ia.status = 'resolved' THEN 1 END),
    COUNT(CASE WHEN ia.status = 'resolved' THEN 1 END),
    COUNT(CASE WHEN ia.status IN ('active', 'acknowledged') THEN 1 END),
    COUNT(CASE WHEN ia.status = 'active' THEN 1 END),
    AVG(CASE WHEN qm.metric_name = 'surface_temperature' THEN qm.value END),
    AVG(CASE WHEN qm.metric_name = 'humidity_level' THEN qm.value END),
    AVG(CASE WHEN qm.metric_name = 'compaction_level' THEN qm.value END),
    0.0, -- weather_delays_hours placeholder
    0.0, -- equipment_downtime_hours placeholder
    '[]'::JSONB, -- recommendations placeholder
    '{}'::JSONB, -- performance_trends placeholder
    NOW()
  INTO analysis_record.project_id, analysis_record.analysis_date, 
       analysis_record.quality_score, analysis_record.efficiency_score,
       analysis_record.compliance_rate, analysis_record.safety_score,
       analysis_record.total_inspections, analysis_record.passed_inspections,
       analysis_record.failed_inspections, analysis_record.pending_inspections,
       analysis_record.average_temperature, analysis_record.average_humidity,
       analysis_record.average_compaction, analysis_record.weather_delays_hours,
       analysis_record.equipment_downtime_hours, analysis_record.recommendations,
       analysis_record.performance_trends, analysis_record.created_at
  FROM inspection_alerts ia
  LEFT JOIN quality_metrics qm ON qm.project_id = p_project_id 
    AND qm.recorded_at >= CURRENT_DATE
  WHERE ia.project_id = p_project_id;

  -- Insert or update analytics record
  INSERT INTO guardian_analytics (
    project_id, analysis_date, quality_score, efficiency_score, compliance_rate,
    safety_score, total_inspections, passed_inspections, failed_inspections,
    pending_inspections, average_temperature, average_humidity, average_compaction,
    weather_delays_hours, equipment_downtime_hours, recommendations, performance_trends
  ) VALUES (
    analysis_record.project_id, analysis_record.analysis_date, analysis_record.quality_score,
    analysis_record.efficiency_score, analysis_record.compliance_rate, analysis_record.safety_score,
    analysis_record.total_inspections, analysis_record.passed_inspections, 
    analysis_record.failed_inspections, analysis_record.pending_inspections,
    analysis_record.average_temperature, analysis_record.average_humidity,
    analysis_record.average_compaction, analysis_record.weather_delays_hours,
    analysis_record.equipment_downtime_hours, analysis_record.recommendations,
    analysis_record.performance_trends
  )
  ON CONFLICT (project_id, analysis_date) 
  DO UPDATE SET
    quality_score = EXCLUDED.quality_score,
    efficiency_score = EXCLUDED.efficiency_score,
    compliance_rate = EXCLUDED.compliance_rate,
    safety_score = EXCLUDED.safety_score,
    total_inspections = EXCLUDED.total_inspections,
    passed_inspections = EXCLUDED.passed_inspections,
    failed_inspections = EXCLUDED.failed_inspections,
    pending_inspections = EXCLUDED.pending_inspections,
    average_temperature = EXCLUDED.average_temperature,
    average_humidity = EXCLUDED.average_humidity,
    average_compaction = EXCLUDED.average_compaction,
    weather_delays_hours = EXCLUDED.weather_delays_hours,
    equipment_downtime_hours = EXCLUDED.equipment_downtime_hours,
    recommendations = EXCLUDED.recommendations,
    performance_trends = EXCLUDED.performance_trends;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- CALCULATOR FUNCTIONS
-- =======================

-- Function to calculate sealcoat coverage
CREATE OR REPLACE FUNCTION calculate_sealcoat_coverage(
  p_surface_type TEXT,
  p_surface_condition TEXT,
  p_number_of_coats INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  base_coverage NUMERIC;
  condition_multiplier NUMERIC;
  coat_multiplier NUMERIC;
BEGIN
  -- Base coverage rates (sq ft per gallon)
  base_coverage := CASE 
    WHEN p_surface_type = 'asphalt' THEN 80
    WHEN p_surface_type = 'concrete' THEN 70
    ELSE 75
  END;

  -- Condition adjustment
  condition_multiplier := CASE 
    WHEN p_surface_condition = 'excellent' THEN 1.1
    WHEN p_surface_condition = 'good' THEN 1.0
    WHEN p_surface_condition = 'fair' THEN 0.9
    WHEN p_surface_condition = 'poor' THEN 0.75
    ELSE 1.0
  END;

  -- Coat adjustment
  coat_multiplier := CASE 
    WHEN p_number_of_coats = 1 THEN 1.0
    WHEN p_number_of_coats = 2 THEN 0.85
    WHEN p_number_of_coats >= 3 THEN 0.75
    ELSE 1.0
  END;

  RETURN base_coverage * condition_multiplier * coat_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate striping paint coverage
CREATE OR REPLACE FUNCTION calculate_striping_coverage(
  p_line_type TEXT,
  p_width_inches INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  base_coverage NUMERIC;
  type_multiplier NUMERIC;
  width_multiplier NUMERIC;
BEGIN
  -- Base coverage (linear feet per gallon for 4" solid line)
  base_coverage := 1600;

  -- Line type adjustment
  type_multiplier := CASE 
    WHEN p_line_type = 'solid' THEN 1.0
    WHEN p_line_type = 'dashed' THEN 0.6
    WHEN p_line_type = 'double' THEN 2.0
    ELSE 1.0
  END;

  -- Width adjustment
  width_multiplier := 4.0 / p_width_inches;

  RETURN base_coverage * type_multiplier * width_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate asphalt tonnage
CREATE OR REPLACE FUNCTION calculate_asphalt_tonnage(
  p_area_sqft NUMERIC,
  p_thickness_inches INTEGER,
  p_mix_type TEXT
) RETURNS NUMERIC AS $$
DECLARE
  volume_cubic_feet NUMERIC;
  density_pcf NUMERIC; -- pounds per cubic foot
  tons NUMERIC;
BEGIN
  -- Calculate volume in cubic feet
  volume_cubic_feet := p_area_sqft * (p_thickness_inches / 12.0);

  -- Density based on mix type
  density_pcf := CASE 
    WHEN p_mix_type = 'standard' THEN 145
    WHEN p_mix_type = 'premium' THEN 150
    WHEN p_mix_type = 'recycled' THEN 140
    ELSE 145
  END;

  -- Calculate tons (2000 lbs = 1 ton)
  tons := (volume_cubic_feet * density_pcf) / 2000.0;

  RETURN tons;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- ANALYTICS VIEWS
-- =======================

-- View for project dashboard analytics
CREATE OR REPLACE VIEW project_dashboard_analytics AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.status AS project_status,
  calculate_project_quality_score(p.id) AS quality_score,
  calculate_compliance_rate(p.id) AS compliance_rate,
  COUNT(DISTINCT qm.id) AS total_quality_metrics,
  COUNT(DISTINCT cc.id) AS total_compliance_checks,
  COUNT(DISTINCT ia.id) AS total_alerts,
  COUNT(DISTINCT CASE WHEN ia.priority IN ('high', 'critical') THEN ia.id END) AS critical_alerts,
  MAX(qm.recorded_at) AS last_metric_recorded,
  MAX(cc.last_check_date) AS last_compliance_check
FROM projects p
LEFT JOIN quality_metrics qm ON qm.project_id = p.id
LEFT JOIN compliance_checks cc ON cc.project_id = p.id
LEFT JOIN inspection_alerts ia ON ia.project_id = p.id AND ia.status IN ('active', 'acknowledged')
GROUP BY p.id, p.name, p.status;

-- View for recent quality metrics summary
CREATE OR REPLACE VIEW recent_quality_metrics AS
SELECT 
  qm.project_id,
  p.name AS project_name,
  qm.metric_name,
  qm.value,
  qm.unit,
  qm.status,
  qm.recorded_at,
  ROW_NUMBER() OVER (PARTITION BY qm.project_id, qm.metric_name ORDER BY qm.recorded_at DESC) AS metric_rank
FROM quality_metrics qm
JOIN projects p ON p.id = qm.project_id
WHERE qm.recorded_at >= NOW() - INTERVAL '24 hours';

-- View for compliance summary
CREATE OR REPLACE VIEW compliance_summary AS
SELECT 
  cc.project_id,
  p.name AS project_name,
  cc.compliance_type,
  cc.status,
  cc.priority_level,
  cc.last_check_date,
  cc.next_check_due,
  CASE 
    WHEN cc.next_check_due < NOW() THEN 'overdue'
    WHEN cc.next_check_due < NOW() + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'current'
  END AS check_status
FROM compliance_checks cc
JOIN projects p ON p.id = cc.project_id
WHERE cc.status != 'compliant' OR cc.next_check_due IS NOT NULL;

-- View for calculator project summary
CREATE OR REPLACE VIEW calculator_project_summary AS
SELECT 
  cp.id,
  cp.user_id,
  u.first_name || ' ' || u.last_name AS user_name,
  cp.name,
  cp.calculation_type,
  cp.status,
  cp.created_at,
  cp.last_calculated_at,
  CASE cp.calculation_type
    WHEN 'sealcoat' THEN (cp.results_data->>'total_project_cost')::NUMERIC
    WHEN 'striping' THEN (cp.results_data->>'total_project_cost')::NUMERIC
    WHEN 'material_estimate' THEN (cp.results_data->>'total_project_cost')::NUMERIC
    ELSE 0
  END AS estimated_cost,
  cp.tags
FROM calculation_projects cp
JOIN users u ON u.id = cp.user_id
ORDER BY cp.created_at DESC;

-- =======================
-- AUTOMATIC TRIGGERS
-- =======================

-- Trigger to automatically update analytics when metrics are inserted
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guardian analytics for the affected project
  PERFORM update_guardian_analytics(NEW.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic analytics updates
DROP TRIGGER IF EXISTS quality_metrics_analytics_trigger ON quality_metrics;
CREATE TRIGGER quality_metrics_analytics_trigger
  AFTER INSERT OR UPDATE ON quality_metrics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();

DROP TRIGGER IF EXISTS compliance_checks_analytics_trigger ON compliance_checks;
CREATE TRIGGER compliance_checks_analytics_trigger
  AFTER INSERT OR UPDATE ON compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();

DROP TRIGGER IF EXISTS inspection_alerts_analytics_trigger ON inspection_alerts;
CREATE TRIGGER inspection_alerts_analytics_trigger
  AFTER INSERT OR UPDATE ON inspection_alerts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();

-- =======================
-- UTILITY FUNCTIONS
-- =======================

-- Function to get regulations by category
CREATE OR REPLACE FUNCTION get_regulations_by_category(p_category TEXT)
RETURNS TABLE (
  regulation_id UUID,
  title TEXT,
  regulation_type TEXT,
  issuing_authority TEXT,
  effective_date DATE,
  summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.regulation_type,
    r.issuing_authority,
    r.effective_date,
    r.summary
  FROM regulations r
  WHERE r.category = p_category 
    AND r.is_active = true
  ORDER BY r.priority_level DESC, r.effective_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search technical standards
CREATE OR REPLACE FUNCTION search_technical_standards(p_search_term TEXT)
RETURNS TABLE (
  standard_id UUID,
  organization TEXT,
  standard_number TEXT,
  title TEXT,
  category TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.organization,
    ts.standard_number,
    ts.title,
    ts.category,
    ts.description
  FROM technical_standards ts
  WHERE 
    ts.title ILIKE '%' || p_search_term || '%'
    OR ts.description ILIKE '%' || p_search_term || '%'
    OR ts.standard_number ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(ts.applicable_materials)
  ORDER BY 
    CASE WHEN ts.title ILIKE '%' || p_search_term || '%' THEN 1 ELSE 2 END,
    ts.organization, ts.standard_number;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for guardian analytics
ALTER TABLE guardian_analytics 
ADD CONSTRAINT unique_project_analysis_date 
UNIQUE (project_id, analysis_date);

-- Function complete message
SELECT 'Guardian and Calculator functions and views created successfully!' as status;