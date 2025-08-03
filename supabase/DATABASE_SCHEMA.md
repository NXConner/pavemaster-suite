# Supabase Database Schema Documentation
## Guardian and Calculator Integration

This document describes the enhanced database schema for the PaveMaster Suite application, focusing on the integrated Guardian monitoring system, calculator functionality, and regulations management.

## Overview

The database schema includes:
- **Guardian Monitoring System**: Real-time quality monitoring, compliance tracking, and inspection management
- **Calculator Framework**: Sealcoat, striping, and material estimation calculators with data persistence
- **Regulations Database**: Comprehensive regulatory requirements and technical standards
- **Analytics & Reporting**: Advanced analytics views and automated scoring functions

## Database Tables

### Guardian Monitoring Tables

#### 1. quality_metrics
Stores real-time quality monitoring data from IoT devices and manual inspections.

**Key Fields:**
- `metric_name`: Type of measurement (surface_temperature, humidity_level, wind_speed, compaction_level, etc.)
- `value`: Numeric measurement value
- `status`: Quality status (optimal, good, acceptable, poor, critical)
- `threshold_min/max`: Acceptable value ranges
- `device_id`: Associated IoT device identifier
- `sensor_location`: GPS coordinates of measurement

**Usage:**
```sql
-- Insert a new quality metric
INSERT INTO quality_metrics (project_id, metric_name, value, unit, status, recorded_by)
VALUES ('project-uuid', 'surface_temperature', 72.5, '°F', 'optimal', 'user-uuid');

-- Get recent metrics for a project
SELECT * FROM quality_metrics 
WHERE project_id = 'project-uuid' 
AND recorded_at >= NOW() - INTERVAL '24 hours'
ORDER BY recorded_at DESC;
```

#### 2. compliance_checks
Tracks regulatory compliance monitoring and assessment results.

**Key Fields:**
- `compliance_type`: Category of compliance (dot_standards, environmental_regs, safety_protocols, etc.)
- `status`: Compliance status (compliant, warning, non_compliant, pending)
- `regulation_reference`: Reference to specific regulation
- `corrective_actions`: Required and completed actions (JSONB)
- `evidence_files`: Supporting documentation

**Usage:**
```sql
-- Check project compliance status
SELECT compliance_type, status, last_check_date, next_check_due
FROM compliance_checks 
WHERE project_id = 'project-uuid'
AND status != 'compliant';
```

#### 3. inspection_alerts
Manages inspection alerts, incidents, and resolution tracking.

**Key Fields:**
- `alert_type`: Category of alert (temperature_deviation, compaction_issue, safety_concern, etc.)
- `priority`: Alert priority (low, medium, high, critical)
- `status`: Current status (active, acknowledged, resolved, dismissed)
- `severity_score`: Numeric severity rating (1-10)
- `immediate_action_required`: Boolean flag for urgent alerts
- `resolution_deadline`: Target resolution date

**Usage:**
```sql
-- Get critical active alerts
SELECT * FROM inspection_alerts 
WHERE priority IN ('high', 'critical') 
AND status IN ('active', 'acknowledged')
ORDER BY priority DESC, created_at DESC;
```

#### 4. guardian_analytics
Stores daily project analytics and performance metrics.

**Key Fields:**
- `quality_score`: Overall quality score (0-100)
- `efficiency_score`: Project efficiency rating
- `compliance_rate`: Percentage of compliance checks passed
- `safety_score`: Safety performance rating
- `recommendations`: AI-generated recommendations (JSONB)
- `performance_trends`: Historical trend data (JSONB)

### Calculator Tables

#### 5. calculation_projects
Main table for all calculator project data with version control.

**Key Fields:**
- `calculation_type`: Type of calculation (sealcoat, striping, material_estimate, etc.)
- `project_data`: Input parameters (JSONB)
- `results_data`: Calculation results (JSONB)
- `cost_breakdown`: Detailed cost analysis (JSONB)
- `is_template`: Flag for reusable templates
- `shared_with`: User IDs with access
- `version_number`: Version tracking for calculations

**Usage:**
```sql
-- Create a new sealcoat calculation project
INSERT INTO calculation_projects (user_id, name, calculation_type, project_data, results_data)
VALUES (
  'user-uuid',
  'Main Street Sealcoating',
  'sealcoat',
  '{"length": 200, "width": 50, "coats": 2}',
  '{"total_cost": 5600, "gallons_needed": 280}'
);
```

#### 6. sealcoat_calculations
Detailed sealcoat calculation parameters and results.

**Key Fields:**
- `length_feet`, `width_feet`: Project dimensions
- `number_of_coats`: Application layers
- `surface_type`: asphalt or concrete
- `surface_condition`: excellent, good, fair, poor
- `coverage_rate`: Calculated coverage per gallon
- `total_project_cost`: Final cost estimate

#### 7. striping_calculations & striping_lines
Striping project calculations with detailed line specifications.

**Key Fields (striping_calculations):**
- `total_linear_feet`: Total length of all lines
- `white_paint_gallons`, `yellow_paint_gallons`: Paint requirements
- `glass_beads_bags`: Reflective material needed
- `delivery_trips`: Logistics planning

**Key Fields (striping_lines):**
- `line_type`: solid, dashed, double
- `width_inches`: Line width (4, 6, 8, 12)
- `color`: white or yellow
- `coverage_rate`: Linear feet per gallon

#### 8. material_estimations & material_zones
Asphalt paving material calculations with zone-based breakdowns.

**Key Fields (material_estimations):**
- `total_asphalt_tons`: Required asphalt tonnage
- `total_aggregate_tons`: Aggregate requirements
- `delivery_trips`: Logistics planning
- `cost_per_square_foot`: Unit pricing

**Key Fields (material_zones):**
- `thickness_inches`: Pavement thickness (2, 3, 4, 6, 8)
- `surface_type`: new, overlay, patch
- `mix_type`: standard, premium, recycled

### Regulations Tables

#### 9. regulations
Comprehensive database of regulatory requirements and standards.

**Key Fields:**
- `regulation_type`: federal, state, local, industry_standard
- `category`: safety, environmental, quality, materials, etc.
- `issuing_authority`: FHWA, EPA, OSHA, etc.
- `requirements`: Specific requirements (JSONB)
- `compliance_checklist`: Verification items (JSONB)
- `keywords`: Searchable terms

#### 10. technical_standards
Industry technical standards and testing procedures.

**Key Fields:**
- `organization`: AASHTO, ASTM, etc.
- `standard_number`: Official standard identifier
- `test_methods`: Required testing procedures (JSONB)
- `acceptance_criteria`: Pass/fail criteria (JSONB)
- `applicable_materials`: Relevant material types

#### 11. project_compliance
Links projects to specific regulations with compliance tracking.

**Key Fields:**
- `compliance_status`: compliant, non_compliant, pending_review, etc.
- `compliance_score`: Numeric score (0-100)
- `corrective_actions_required`: Action items (JSONB)
- `evidence_files`: Supporting documentation

## Database Functions

### Guardian Functions

#### calculate_project_quality_score(project_id)
Calculates overall quality score based on recent metrics.
```sql
SELECT calculate_project_quality_score('project-uuid');
-- Returns: 87.5 (quality score out of 100)
```

#### calculate_compliance_rate(project_id)
Calculates compliance percentage for a project.
```sql
SELECT calculate_compliance_rate('project-uuid');
-- Returns: 95.0 (percentage compliant)
```

#### get_critical_alerts(project_id)
Returns active high-priority alerts.
```sql
SELECT * FROM get_critical_alerts('project-uuid');
-- Returns table of critical alerts with days open
```

### Calculator Functions

#### calculate_sealcoat_coverage(surface_type, condition, coats)
Calculates coverage rate for sealcoat applications.
```sql
SELECT calculate_sealcoat_coverage('asphalt', 'good', 2);
-- Returns: 68.0 (sq ft per gallon)
```

#### calculate_striping_coverage(line_type, width_inches)
Calculates paint coverage for striping lines.
```sql
SELECT calculate_striping_coverage('solid', 4);
-- Returns: 1600.0 (linear feet per gallon)
```

#### calculate_asphalt_tonnage(area_sqft, thickness_inches, mix_type)
Calculates asphalt tonnage requirements.
```sql
SELECT calculate_asphalt_tonnage(10000, 3, 'standard');
-- Returns: 90.6 (tons required)
```

### Regulation Functions

#### get_regulations_by_category(category)
Retrieves regulations by category.
```sql
SELECT * FROM get_regulations_by_category('safety');
-- Returns table of safety regulations
```

#### search_technical_standards(search_term)
Searches technical standards by keyword.
```sql
SELECT * FROM search_technical_standards('compaction');
-- Returns relevant standards
```

## Analytics Views

### project_dashboard_analytics
Comprehensive project metrics for dashboard display.
```sql
SELECT * FROM project_dashboard_analytics WHERE project_id = 'project-uuid';
```

### recent_quality_metrics
Latest quality metrics with ranking.
```sql
SELECT * FROM recent_quality_metrics WHERE metric_rank = 1;
-- Returns most recent metric for each type
```

### compliance_summary
Compliance status overview with check schedules.
```sql
SELECT * FROM compliance_summary WHERE check_status = 'overdue';
```

### calculator_project_summary
Calculator project overview with cost estimates.
```sql
SELECT * FROM calculator_project_summary 
WHERE calculation_type = 'sealcoat' 
ORDER BY created_at DESC;
```

## Row Level Security (RLS)

All tables implement Row Level Security with the following patterns:

### Guardian Tables
- Users can only access data for projects they manage or are assigned to
- Quality metrics and alerts are project-scoped
- Analytics data follows project permissions

### Calculator Tables
- Users can manage their own calculation projects
- Shared calculations use the `shared_with` array
- Templates can be marked as public

### Regulation Tables
- Regulations and standards are publicly readable
- Project compliance follows project permissions
- Only authorized users can modify regulation data

## Indexes and Performance

Key indexes for optimal performance:

```sql
-- Guardian monitoring indexes
CREATE INDEX idx_quality_metrics_project_recorded ON quality_metrics(project_id, recorded_at DESC);
CREATE INDEX idx_compliance_checks_status_priority ON compliance_checks(status, priority_level);
CREATE INDEX idx_inspection_alerts_active_priority ON inspection_alerts(status, priority) WHERE status IN ('active', 'acknowledged');

-- Calculator indexes
CREATE INDEX idx_calculation_projects_user_type ON calculation_projects(user_id, calculation_type);
CREATE INDEX idx_calculation_projects_shared ON calculation_projects USING GIN(shared_with);

-- Regulation indexes
CREATE INDEX idx_regulations_category_active ON regulations(category, is_active);
CREATE INDEX idx_regulations_keywords ON regulations USING GIN(keywords);
```

## Data Migration

To apply the new schema:

1. Run the main migration:
```bash
supabase db reset
supabase migration up 20250130000000_guardian_calculator_integration
```

2. Apply functions and views:
```bash
supabase migration up 20250130000001_guardian_calculator_functions
```

3. Verify with sample queries:
```sql
-- Test Guardian functions
SELECT calculate_project_quality_score('00000000-0000-0000-0000-000000000000');

-- Test Calculator functions
SELECT calculate_sealcoat_coverage('asphalt', 'good', 2);

-- Test views
SELECT COUNT(*) FROM project_dashboard_analytics;
```

## Best Practices

### Data Entry
- Always validate input data before insertion
- Use transactions for related data operations
- Implement proper error handling

### Performance
- Use appropriate indexes for query patterns
- Consider partitioning for high-volume tables
- Monitor query performance regularly

### Security
- Follow principle of least privilege
- Regularly audit RLS policies
- Validate all user inputs

### Maintenance
- Regular database maintenance and optimization
- Monitor storage usage and growth
- Keep statistics updated for query planning

## Integration Examples

### Frontend Integration
```typescript
import { Database } from '@/types/supabase'

// Type-safe database operations
const supabase = createClient<Database>()

// Insert quality metric
const { data, error } = await supabase
  .from('quality_metrics')
  .insert({
    project_id: projectId,
    metric_name: 'surface_temperature',
    value: 72.5,
    unit: '°F',
    status: 'optimal'
  })

// Get project analytics
const { data: analytics } = await supabase
  .from('project_dashboard_analytics')
  .select('*')
  .eq('project_id', projectId)
  .single()
```

This schema provides a robust foundation for the Guardian monitoring system, calculator functionality, and regulations management, with comprehensive analytics and reporting capabilities.