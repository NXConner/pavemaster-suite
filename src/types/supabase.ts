// Supabase Database Types for Guardian and Calculator Integration
// Auto-generated types for the enhanced database schema

export interface Database {
  public: {
    Tables: {
      // Guardian Monitoring Tables
      quality_metrics: {
        Row: {
          id: string
          project_id: string
          site_location: string | null
          metric_name: 'surface_temperature' | 'humidity_level' | 'wind_speed' | 'compaction_level' | 'material_temperature' | 'ambient_temperature' | 'surface_moisture' | 'density'
          value: number
          unit: string
          status: 'optimal' | 'good' | 'acceptable' | 'poor' | 'critical'
          acceptable_range: string | null
          threshold_min: number | null
          threshold_max: number | null
          device_id: string | null
          sensor_location: unknown | null // PostGIS POINT type
          recorded_by: string | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          site_location?: string | null
          metric_name: 'surface_temperature' | 'humidity_level' | 'wind_speed' | 'compaction_level' | 'material_temperature' | 'ambient_temperature' | 'surface_moisture' | 'density'
          value: number
          unit: string
          status: 'optimal' | 'good' | 'acceptable' | 'poor' | 'critical'
          acceptable_range?: string | null
          threshold_min?: number | null
          threshold_max?: number | null
          device_id?: string | null
          sensor_location?: unknown | null
          recorded_by?: string | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          site_location?: string | null
          metric_name?: 'surface_temperature' | 'humidity_level' | 'wind_speed' | 'compaction_level' | 'material_temperature' | 'ambient_temperature' | 'surface_moisture' | 'density'
          value?: number
          unit?: string
          status?: 'optimal' | 'good' | 'acceptable' | 'poor' | 'critical'
          acceptable_range?: string | null
          threshold_min?: number | null
          threshold_max?: number | null
          device_id?: string | null
          sensor_location?: unknown | null
          recorded_by?: string | null
          recorded_at?: string
          created_at?: string
        }
      }
      compliance_checks: {
        Row: {
          id: string
          project_id: string
          compliance_type: 'dot_standards' | 'environmental_regs' | 'safety_protocols' | 'quality_specs' | 'osha_requirements' | 'local_regulations' | 'federal_standards' | 'industry_standards'
          regulation_reference: string | null
          status: 'compliant' | 'warning' | 'non_compliant' | 'pending'
          description: string | null
          requirement_details: Json
          last_check_date: string | null
          next_check_due: string | null
          checked_by: string | null
          corrective_actions: Json
          evidence_files: string[]
          priority_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          compliance_type: 'dot_standards' | 'environmental_regs' | 'safety_protocols' | 'quality_specs' | 'osha_requirements' | 'local_regulations' | 'federal_standards' | 'industry_standards'
          regulation_reference?: string | null
          status: 'compliant' | 'warning' | 'non_compliant' | 'pending'
          description?: string | null
          requirement_details?: Json
          last_check_date?: string | null
          next_check_due?: string | null
          checked_by?: string | null
          corrective_actions?: Json
          evidence_files?: string[]
          priority_level?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          compliance_type?: 'dot_standards' | 'environmental_regs' | 'safety_protocols' | 'quality_specs' | 'osha_requirements' | 'local_regulations' | 'federal_standards' | 'industry_standards'
          regulation_reference?: string | null
          status?: 'compliant' | 'warning' | 'non_compliant' | 'pending'
          description?: string | null
          requirement_details?: Json
          last_check_date?: string | null
          next_check_due?: string | null
          checked_by?: string | null
          corrective_actions?: Json
          evidence_files?: string[]
          priority_level?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
        }
      }
      inspection_alerts: {
        Row: {
          id: string
          project_id: string
          alert_type: 'temperature_deviation' | 'compaction_issue' | 'material_quality' | 'safety_concern' | 'equipment_malfunction' | 'weather_impact' | 'compliance_violation' | 'quality_failure'
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
          location_details: string | null
          gps_coordinates: unknown | null
          affected_area: number | null
          severity_score: number | null
          immediate_action_required: boolean
          resolution_deadline: string | null
          assigned_to: string | null
          reported_by: string | null
          resolved_by: string | null
          resolved_at: string | null
          resolution_notes: string | null
          prevention_measures: Json
          related_metrics: Json
          photos: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          alert_type: 'temperature_deviation' | 'compaction_issue' | 'material_quality' | 'safety_concern' | 'equipment_malfunction' | 'weather_impact' | 'compliance_violation' | 'quality_failure'
          title: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
          location_details?: string | null
          gps_coordinates?: unknown | null
          affected_area?: number | null
          severity_score?: number | null
          immediate_action_required?: boolean
          resolution_deadline?: string | null
          assigned_to?: string | null
          reported_by?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          prevention_measures?: Json
          related_metrics?: Json
          photos?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          alert_type?: 'temperature_deviation' | 'compaction_issue' | 'material_quality' | 'safety_concern' | 'equipment_malfunction' | 'weather_impact' | 'compliance_violation' | 'quality_failure'
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
          location_details?: string | null
          gps_coordinates?: unknown | null
          affected_area?: number | null
          severity_score?: number | null
          immediate_action_required?: boolean
          resolution_deadline?: string | null
          assigned_to?: string | null
          reported_by?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          prevention_measures?: Json
          related_metrics?: Json
          photos?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      guardian_analytics: {
        Row: {
          id: string
          project_id: string
          analysis_date: string
          quality_score: number | null
          efficiency_score: number | null
          compliance_rate: number | null
          safety_score: number | null
          total_inspections: number
          passed_inspections: number
          failed_inspections: number
          pending_inspections: number
          average_temperature: number | null
          average_humidity: number | null
          average_compaction: number | null
          weather_delays_hours: number
          equipment_downtime_hours: number
          recommendations: Json
          performance_trends: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          analysis_date?: string
          quality_score?: number | null
          efficiency_score?: number | null
          compliance_rate?: number | null
          safety_score?: number | null
          total_inspections?: number
          passed_inspections?: number
          failed_inspections?: number
          pending_inspections?: number
          average_temperature?: number | null
          average_humidity?: number | null
          average_compaction?: number | null
          weather_delays_hours?: number
          equipment_downtime_hours?: number
          recommendations?: Json
          performance_trends?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          analysis_date?: string
          quality_score?: number | null
          efficiency_score?: number | null
          compliance_rate?: number | null
          safety_score?: number | null
          total_inspections?: number
          passed_inspections?: number
          failed_inspections?: number
          pending_inspections?: number
          average_temperature?: number | null
          average_humidity?: number | null
          average_compaction?: number | null
          weather_delays_hours?: number
          equipment_downtime_hours?: number
          recommendations?: Json
          performance_trends?: Json
          created_at?: string
        }
      }
      // Calculator Tables
      calculation_projects: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          name: string
          description: string | null
          calculation_type: 'sealcoat' | 'striping' | 'material_estimate' | 'cost_analysis' | 'asphalt_mix'
          status: 'draft' | 'final' | 'archived'
          location: string | null
          client_name: string | null
          project_data: Json
          results_data: Json
          cost_breakdown: Json
          material_specifications: Json
          labor_calculations: Json
          equipment_requirements: Json
          environmental_factors: Json
          version_number: number
          is_template: boolean
          template_name: string | null
          tags: string[]
          shared_with: string[]
          last_calculated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          name: string
          description?: string | null
          calculation_type: 'sealcoat' | 'striping' | 'material_estimate' | 'cost_analysis' | 'asphalt_mix'
          status?: 'draft' | 'final' | 'archived'
          location?: string | null
          client_name?: string | null
          project_data?: Json
          results_data?: Json
          cost_breakdown?: Json
          material_specifications?: Json
          labor_calculations?: Json
          equipment_requirements?: Json
          environmental_factors?: Json
          version_number?: number
          is_template?: boolean
          template_name?: string | null
          tags?: string[]
          shared_with?: string[]
          last_calculated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          name?: string
          description?: string | null
          calculation_type?: 'sealcoat' | 'striping' | 'material_estimate' | 'cost_analysis' | 'asphalt_mix'
          status?: 'draft' | 'final' | 'archived'
          location?: string | null
          client_name?: string | null
          project_data?: Json
          results_data?: Json
          cost_breakdown?: Json
          material_specifications?: Json
          labor_calculations?: Json
          equipment_requirements?: Json
          environmental_factors?: Json
          version_number?: number
          is_template?: boolean
          template_name?: string | null
          tags?: string[]
          shared_with?: string[]
          last_calculated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sealcoat_calculations: {
        Row: {
          id: string
          calculation_project_id: string
          length_feet: number
          width_feet: number
          thickness_inches: number
          number_of_coats: number
          surface_type: 'asphalt' | 'concrete'
          surface_condition: 'excellent' | 'good' | 'fair' | 'poor'
          coverage_rate: number | null
          total_area: number | null
          gallons_needed: number | null
          sand_bags_needed: number | null
          primer_gallons: number | null
          sealcoat_cost_per_gallon: number | null
          sand_cost_per_bag: number | null
          primer_cost_per_gallon: number | null
          labor_rate_per_hour: number | null
          estimated_labor_hours: number | null
          total_material_cost: number | null
          total_labor_cost: number | null
          total_project_cost: number | null
          weather_conditions: Json
          application_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          calculation_project_id: string
          length_feet: number
          width_feet: number
          thickness_inches?: number
          number_of_coats?: number
          surface_type: 'asphalt' | 'concrete'
          surface_condition: 'excellent' | 'good' | 'fair' | 'poor'
          coverage_rate?: number | null
          total_area?: number | null
          gallons_needed?: number | null
          sand_bags_needed?: number | null
          primer_gallons?: number | null
          sealcoat_cost_per_gallon?: number | null
          sand_cost_per_bag?: number | null
          primer_cost_per_gallon?: number | null
          labor_rate_per_hour?: number | null
          estimated_labor_hours?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          weather_conditions?: Json
          application_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          calculation_project_id?: string
          length_feet?: number
          width_feet?: number
          thickness_inches?: number
          number_of_coats?: number
          surface_type?: 'asphalt' | 'concrete'
          surface_condition?: 'excellent' | 'good' | 'fair' | 'poor'
          coverage_rate?: number | null
          total_area?: number | null
          gallons_needed?: number | null
          sand_bags_needed?: number | null
          primer_gallons?: number | null
          sealcoat_cost_per_gallon?: number | null
          sand_cost_per_bag?: number | null
          primer_cost_per_gallon?: number | null
          labor_rate_per_hour?: number | null
          estimated_labor_hours?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          weather_conditions?: Json
          application_notes?: string | null
          created_at?: string
        }
      }
      striping_calculations: {
        Row: {
          id: string
          calculation_project_id: string
          project_temperature: number | null
          project_humidity: number | null
          total_linear_feet: number | null
          white_paint_gallons: number | null
          yellow_paint_gallons: number | null
          glass_beads_bags: number | null
          primer_gallons: number | null
          white_paint_cost_per_gallon: number | null
          yellow_paint_cost_per_gallon: number | null
          glass_beads_cost_per_bag: number | null
          primer_cost_per_gallon: number | null
          labor_rate_per_hour: number | null
          estimated_labor_hours: number | null
          delivery_trips: number | null
          delivery_cost: number | null
          total_material_cost: number | null
          total_labor_cost: number | null
          total_project_cost: number | null
          application_specifications: Json
          created_at: string
        }
        Insert: {
          id?: string
          calculation_project_id: string
          project_temperature?: number | null
          project_humidity?: number | null
          total_linear_feet?: number | null
          white_paint_gallons?: number | null
          yellow_paint_gallons?: number | null
          glass_beads_bags?: number | null
          primer_gallons?: number | null
          white_paint_cost_per_gallon?: number | null
          yellow_paint_cost_per_gallon?: number | null
          glass_beads_cost_per_bag?: number | null
          primer_cost_per_gallon?: number | null
          labor_rate_per_hour?: number | null
          estimated_labor_hours?: number | null
          delivery_trips?: number | null
          delivery_cost?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          application_specifications?: Json
          created_at?: string
        }
        Update: {
          id?: string
          calculation_project_id?: string
          project_temperature?: number | null
          project_humidity?: number | null
          total_linear_feet?: number | null
          white_paint_gallons?: number | null
          yellow_paint_gallons?: number | null
          glass_beads_bags?: number | null
          primer_gallons?: number | null
          white_paint_cost_per_gallon?: number | null
          yellow_paint_cost_per_gallon?: number | null
          glass_beads_cost_per_bag?: number | null
          primer_cost_per_gallon?: number | null
          labor_rate_per_hour?: number | null
          estimated_labor_hours?: number | null
          delivery_trips?: number | null
          delivery_cost?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          application_specifications?: Json
          created_at?: string
        }
      }
      striping_lines: {
        Row: {
          id: string
          striping_calculation_id: string
          line_name: string | null
          line_type: 'solid' | 'dashed' | 'double'
          width_inches: number
          length_feet: number
          color: 'white' | 'yellow'
          coverage_rate: number | null
          paint_needed: number | null
          line_order: number
          special_requirements: string | null
          created_at: string
        }
        Insert: {
          id?: string
          striping_calculation_id: string
          line_name?: string | null
          line_type: 'solid' | 'dashed' | 'double'
          width_inches: number
          length_feet: number
          color: 'white' | 'yellow'
          coverage_rate?: number | null
          paint_needed?: number | null
          line_order?: number
          special_requirements?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          striping_calculation_id?: string
          line_name?: string | null
          line_type?: 'solid' | 'dashed' | 'double'
          width_inches?: number
          length_feet?: number
          color?: 'white' | 'yellow'
          coverage_rate?: number | null
          paint_needed?: number | null
          line_order?: number
          special_requirements?: string | null
          created_at?: string
        }
      }
      material_estimations: {
        Row: {
          id: string
          calculation_project_id: string
          contractor_name: string | null
          start_date: string | null
          total_area: number | null
          total_volume: number | null
          total_asphalt_tons: number | null
          total_aggregate_tons: number | null
          total_binding_agent_tons: number | null
          standard_mix_cost_per_ton: number | null
          premium_mix_cost_per_ton: number | null
          recycled_mix_cost_per_ton: number | null
          aggregate_cost_per_ton: number | null
          binding_agent_cost_per_ton: number | null
          fuel_surcharge_per_ton: number | null
          delivery_rate_per_hour: number | null
          labor_rate_per_hour: number | null
          delivery_trips: number | null
          estimated_labor_hours: number | null
          total_material_cost: number | null
          total_delivery_cost: number | null
          total_labor_cost: number | null
          total_project_cost: number | null
          cost_per_square_foot: number | null
          logistics_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          calculation_project_id: string
          contractor_name?: string | null
          start_date?: string | null
          total_area?: number | null
          total_volume?: number | null
          total_asphalt_tons?: number | null
          total_aggregate_tons?: number | null
          total_binding_agent_tons?: number | null
          standard_mix_cost_per_ton?: number | null
          premium_mix_cost_per_ton?: number | null
          recycled_mix_cost_per_ton?: number | null
          aggregate_cost_per_ton?: number | null
          binding_agent_cost_per_ton?: number | null
          fuel_surcharge_per_ton?: number | null
          delivery_rate_per_hour?: number | null
          labor_rate_per_hour?: number | null
          delivery_trips?: number | null
          estimated_labor_hours?: number | null
          total_material_cost?: number | null
          total_delivery_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          cost_per_square_foot?: number | null
          logistics_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          calculation_project_id?: string
          contractor_name?: string | null
          start_date?: string | null
          total_area?: number | null
          total_volume?: number | null
          total_asphalt_tons?: number | null
          total_aggregate_tons?: number | null
          total_binding_agent_tons?: number | null
          standard_mix_cost_per_ton?: number | null
          premium_mix_cost_per_ton?: number | null
          recycled_mix_cost_per_ton?: number | null
          aggregate_cost_per_ton?: number | null
          binding_agent_cost_per_ton?: number | null
          fuel_surcharge_per_ton?: number | null
          delivery_rate_per_hour?: number | null
          labor_rate_per_hour?: number | null
          delivery_trips?: number | null
          estimated_labor_hours?: number | null
          total_material_cost?: number | null
          total_delivery_cost?: number | null
          total_labor_cost?: number | null
          total_project_cost?: number | null
          cost_per_square_foot?: number | null
          logistics_notes?: string | null
          created_at?: string
        }
      }
      material_zones: {
        Row: {
          id: string
          material_estimation_id: string
          zone_name: string
          length_feet: number
          width_feet: number
          thickness_inches: number
          surface_type: 'new' | 'overlay' | 'patch'
          mix_type: 'standard' | 'premium' | 'recycled'
          zone_area: number | null
          zone_volume: number | null
          estimated_tons: number | null
          zone_cost: number | null
          special_requirements: string | null
          zone_order: number
          created_at: string
        }
        Insert: {
          id?: string
          material_estimation_id: string
          zone_name: string
          length_feet: number
          width_feet: number
          thickness_inches: number
          surface_type: 'new' | 'overlay' | 'patch'
          mix_type: 'standard' | 'premium' | 'recycled'
          zone_area?: number | null
          zone_volume?: number | null
          estimated_tons?: number | null
          zone_cost?: number | null
          special_requirements?: string | null
          zone_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          material_estimation_id?: string
          zone_name?: string
          length_feet?: number
          width_feet?: number
          thickness_inches?: number
          surface_type?: 'new' | 'overlay' | 'patch'
          mix_type?: 'standard' | 'premium' | 'recycled'
          zone_area?: number | null
          zone_volume?: number | null
          estimated_tons?: number | null
          zone_cost?: number | null
          special_requirements?: string | null
          zone_order?: number
          created_at?: string
        }
      }
      // Regulations Tables
      regulations: {
        Row: {
          id: string
          title: string
          regulation_type: 'federal' | 'state' | 'local' | 'industry_standard' | 'technical_specification'
          category: 'safety' | 'environmental' | 'quality' | 'materials' | 'construction' | 'testing' | 'inspection' | 'documentation' | 'certification' | 'compliance'
          issuing_authority: string
          regulation_number: string | null
          effective_date: string | null
          expiration_date: string | null
          version: string | null
          description: string
          full_text: string | null
          summary: string | null
          applicability: Json
          requirements: Json
          penalties: Json
          related_regulations: string[]
          reference_documents: string[]
          compliance_checklist: Json
          tags: string[]
          keywords: string[]
          priority_level: 'low' | 'medium' | 'high' | 'critical'
          is_active: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          regulation_type: 'federal' | 'state' | 'local' | 'industry_standard' | 'technical_specification'
          category: 'safety' | 'environmental' | 'quality' | 'materials' | 'construction' | 'testing' | 'inspection' | 'documentation' | 'certification' | 'compliance'
          issuing_authority: string
          regulation_number?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          version?: string | null
          description: string
          full_text?: string | null
          summary?: string | null
          applicability?: Json
          requirements?: Json
          penalties?: Json
          related_regulations?: string[]
          reference_documents?: string[]
          compliance_checklist?: Json
          tags?: string[]
          keywords?: string[]
          priority_level?: 'low' | 'medium' | 'high' | 'critical'
          is_active?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          regulation_type?: 'federal' | 'state' | 'local' | 'industry_standard' | 'technical_specification'
          category?: 'safety' | 'environmental' | 'quality' | 'materials' | 'construction' | 'testing' | 'inspection' | 'documentation' | 'certification' | 'compliance'
          issuing_authority?: string
          regulation_number?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          version?: string | null
          description?: string
          full_text?: string | null
          summary?: string | null
          applicability?: Json
          requirements?: Json
          penalties?: Json
          related_regulations?: string[]
          reference_documents?: string[]
          compliance_checklist?: Json
          tags?: string[]
          keywords?: string[]
          priority_level?: 'low' | 'medium' | 'high' | 'critical'
          is_active?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      technical_standards: {
        Row: {
          id: string
          organization: string
          standard_number: string
          title: string
          description: string
          category: 'material_testing' | 'construction_methods' | 'quality_control' | 'design_standards' | 'safety_standards' | 'equipment_standards' | 'measurement_standards'
          applicable_materials: string[]
          test_methods: Json
          acceptance_criteria: Json
          sampling_requirements: Json
          equipment_required: string[]
          revision_date: string | null
          superseded_standards: string[]
          related_standards: string[]
          cost_per_test: number | null
          typical_test_duration: string | null
          certification_required: boolean
          is_mandatory: boolean
          geographic_scope: string[]
          project_types: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization: string
          standard_number: string
          title: string
          description: string
          category: 'material_testing' | 'construction_methods' | 'quality_control' | 'design_standards' | 'safety_standards' | 'equipment_standards' | 'measurement_standards'
          applicable_materials?: string[]
          test_methods?: Json
          acceptance_criteria?: Json
          sampling_requirements?: Json
          equipment_required?: string[]
          revision_date?: string | null
          superseded_standards?: string[]
          related_standards?: string[]
          cost_per_test?: number | null
          typical_test_duration?: string | null
          certification_required?: boolean
          is_mandatory?: boolean
          geographic_scope?: string[]
          project_types?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization?: string
          standard_number?: string
          title?: string
          description?: string
          category?: 'material_testing' | 'construction_methods' | 'quality_control' | 'design_standards' | 'safety_standards' | 'equipment_standards' | 'measurement_standards'
          applicable_materials?: string[]
          test_methods?: Json
          acceptance_criteria?: Json
          sampling_requirements?: Json
          equipment_required?: string[]
          revision_date?: string | null
          superseded_standards?: string[]
          related_standards?: string[]
          cost_per_test?: number | null
          typical_test_duration?: string | null
          certification_required?: boolean
          is_mandatory?: boolean
          geographic_scope?: string[]
          project_types?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      project_compliance: {
        Row: {
          id: string
          project_id: string
          regulation_id: string
          compliance_status: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress' | 'not_applicable'
          last_assessment_date: string | null
          next_assessment_due: string | null
          assessed_by: string | null
          compliance_notes: string | null
          evidence_files: string[]
          corrective_actions_required: Json
          corrective_actions_completed: Json
          compliance_score: number | null
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          regulation_id: string
          compliance_status: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress' | 'not_applicable'
          last_assessment_date?: string | null
          next_assessment_due?: string | null
          assessed_by?: string | null
          compliance_notes?: string | null
          evidence_files?: string[]
          corrective_actions_required?: Json
          corrective_actions_completed?: Json
          compliance_score?: number | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          regulation_id?: string
          compliance_status?: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress' | 'not_applicable'
          last_assessment_date?: string | null
          next_assessment_due?: string | null
          assessed_by?: string | null
          compliance_notes?: string | null
          evidence_files?: string[]
          corrective_actions_required?: Json
          corrective_actions_completed?: Json
          compliance_score?: number | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      project_dashboard_analytics: {
        Row: {
          project_id: string
          project_name: string
          project_status: string
          quality_score: number | null
          compliance_rate: number | null
          total_quality_metrics: number | null
          total_compliance_checks: number | null
          total_alerts: number | null
          critical_alerts: number | null
          last_metric_recorded: string | null
          last_compliance_check: string | null
        }
      }
      recent_quality_metrics: {
        Row: {
          project_id: string
          project_name: string
          metric_name: string
          value: number
          unit: string
          status: string
          recorded_at: string
          metric_rank: number
        }
      }
      compliance_summary: {
        Row: {
          project_id: string
          project_name: string
          compliance_type: string
          status: string
          priority_level: string
          last_check_date: string | null
          next_check_due: string | null
          check_status: string
        }
      }
      calculator_project_summary: {
        Row: {
          id: string
          user_id: string
          user_name: string
          name: string
          calculation_type: string
          status: string
          created_at: string
          last_calculated_at: string | null
          estimated_cost: number | null
          tags: string[]
        }
      }
    }
    Functions: {
      calculate_project_quality_score: {
        Args: {
          p_project_id: string
        }
        Returns: number
      }
      calculate_compliance_rate: {
        Args: {
          p_project_id: string
        }
        Returns: number
      }
      get_critical_alerts: {
        Args: {
          p_project_id?: string
        }
        Returns: {
          alert_id: string
          project_id: string
          title: string
          priority: string
          created_at: string
          days_open: number
        }[]
      }
      calculate_sealcoat_coverage: {
        Args: {
          p_surface_type: string
          p_surface_condition: string
          p_number_of_coats: number
        }
        Returns: number
      }
      calculate_striping_coverage: {
        Args: {
          p_line_type: string
          p_width_inches: number
        }
        Returns: number
      }
      calculate_asphalt_tonnage: {
        Args: {
          p_area_sqft: number
          p_thickness_inches: number
          p_mix_type: string
        }
        Returns: number
      }
      get_regulations_by_category: {
        Args: {
          p_category: string
        }
        Returns: {
          regulation_id: string
          title: string
          regulation_type: string
          issuing_authority: string
          effective_date: string | null
          summary: string | null
        }[]
      }
      search_technical_standards: {
        Args: {
          p_search_term: string
        }
        Returns: {
          standard_id: string
          organization: string
          standard_number: string
          title: string
          category: string
          description: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Guardian specific types
export type QualityMetric = Database['public']['Tables']['quality_metrics']['Row']
export type QualityMetricInsert = Database['public']['Tables']['quality_metrics']['Insert']
export type ComplianceCheck = Database['public']['Tables']['compliance_checks']['Row']
export type ComplianceCheckInsert = Database['public']['Tables']['compliance_checks']['Insert']
export type InspectionAlert = Database['public']['Tables']['inspection_alerts']['Row']
export type InspectionAlertInsert = Database['public']['Tables']['inspection_alerts']['Insert']
export type GuardianAnalytics = Database['public']['Tables']['guardian_analytics']['Row']

// Calculator specific types
export type CalculationProject = Database['public']['Tables']['calculation_projects']['Row']
export type CalculationProjectInsert = Database['public']['Tables']['calculation_projects']['Insert']
export type SealcoatCalculation = Database['public']['Tables']['sealcoat_calculations']['Row']
export type SealcoatCalculationInsert = Database['public']['Tables']['sealcoat_calculations']['Insert']
export type StripingCalculation = Database['public']['Tables']['striping_calculations']['Row']
export type StripingCalculationInsert = Database['public']['Tables']['striping_calculations']['Insert']
export type StripingLine = Database['public']['Tables']['striping_lines']['Row']
export type StripingLineInsert = Database['public']['Tables']['striping_lines']['Insert']
export type MaterialEstimation = Database['public']['Tables']['material_estimations']['Row']
export type MaterialEstimationInsert = Database['public']['Tables']['material_estimations']['Insert']
export type MaterialZone = Database['public']['Tables']['material_zones']['Row']
export type MaterialZoneInsert = Database['public']['Tables']['material_zones']['Insert']

// Regulations specific types
export type Regulation = Database['public']['Tables']['regulations']['Row']
export type RegulationInsert = Database['public']['Tables']['regulations']['Insert']
export type TechnicalStandard = Database['public']['Tables']['technical_standards']['Row']
export type TechnicalStandardInsert = Database['public']['Tables']['technical_standards']['Insert']
export type ProjectCompliance = Database['public']['Tables']['project_compliance']['Row']
export type ProjectComplianceInsert = Database['public']['Tables']['project_compliance']['Insert']

// View types
export type ProjectDashboardAnalytics = Database['public']['Views']['project_dashboard_analytics']['Row']
export type RecentQualityMetrics = Database['public']['Views']['recent_quality_metrics']['Row']
export type ComplianceSummary = Database['public']['Views']['compliance_summary']['Row']
export type CalculatorProjectSummary = Database['public']['Views']['calculator_project_summary']['Row']