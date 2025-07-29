import { z } from 'zod';

// Predictive Maintenance Risk Levels
export const MAINTENANCE_RISK_LEVELS = [
  'low', 
  'moderate', 
  'high', 
  'critical'
] as const;

// Quality Control Evaluation Levels
export const QUALITY_CONTROL_LEVELS = [
  'excellent', 
  'good', 
  'acceptable', 
  'needs_improvement', 
  'critical_failure'
] as const;

// Equipment Health Metrics
const EquipmentHealthMetricSchema = z.object({
  // Sensor-based metrics
  vibration: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  noise_level: z.number().min(0).max(100).optional(),
  
  // Performance metrics
  usage_hours: z.number().min(0).optional(),
  cycles_completed: z.number().min(0).optional(),
  
  // Wear and tear indicators
  wear_percentage: z.number().min(0).max(100),
  
  // Anomaly detection
  anomaly_score: z.number().min(0).max(100).optional()
});

// Predictive Maintenance Recommendation Schema
export const PredictiveMaintenanceSchema = z.object({
  // Equipment Identification
  equipmentId: z.string().uuid(),
  
  // Health Assessment
  health_metrics: EquipmentHealthMetricSchema,
  
  // Risk and Prediction
  maintenance_risk_level: z.enum(MAINTENANCE_RISK_LEVELS),
  
  // Predicted Failure Probability
  failure_probability: z.number().min(0).max(100),
  
  // Recommended Actions
  recommended_actions: z.array(z.string()),
  
  // Estimated Maintenance Window
  recommended_maintenance_window: z.object({
    earliest_date: z.date(),
    latest_date: z.date()
  }),
  
  // Cost Estimation
  estimated_maintenance_cost: z.number().min(0).optional(),
  
  // Potential Downtime
  estimated_downtime_hours: z.number().min(0).optional(),
  
  // Metadata
  analysis_timestamp: z.date().default(() => new Date()),
  analyzed_by: z.string().default('AI_MAINTENANCE_ENGINE')
});

// Quality Control Assessment Schema
export const QualityControlSchema = z.object({
  // Project Context
  projectId: z.string().uuid(),
  
  // Measurement Details
  measurement_type: z.enum([
    'surface_smoothness', 
    'material_composition', 
    'line_striping', 
    'surface_integrity'
  ]),
  
  // AI-Powered Quality Metrics
  quality_metrics: z.object({
    // Surface-specific metrics
    surface_roughness: z.number().min(0).max(100).optional(),
    surface_evenness: z.number().min(0).max(100).optional(),
    
    // Material composition
    asphalt_density: z.number().min(0).max(100).optional(),
    material_consistency: z.number().min(0).max(100).optional(),
    
    // Line striping
    line_width_accuracy: z.number().min(0).max(100).optional(),
    line_color_uniformity: z.number().min(0).max(100).optional(),
    
    // Structural integrity
    crack_density: z.number().min(0).max(100).optional(),
    pothole_count: z.number().min(0).optional()
  }),
  
  // Overall Quality Assessment
  quality_level: z.enum(QUALITY_CONTROL_LEVELS),
  
  // Confidence Scores
  confidence_score: z.number().min(0).max(100),
  
  // Detailed Recommendations
  improvement_recommendations: z.array(z.string()),
  
  // Potential Rework or Remediation
  rework_required: z.boolean(),
  estimated_rework_cost: z.number().min(0).optional(),
  
  // Image and Visual Analysis (Optional)
  analysis_images: z.array(z.object({
    url: z.string().url(),
    analysis_notes: z.string().optional()
  })).optional(),
  
  // Metadata
  analysis_timestamp: z.date().default(() => new Date()),
  analyzed_by: z.string().default('AI_QUALITY_CONTROL_ENGINE')
});

// AI-Powered Predictive Insights Schema
export const PredictiveInsightsSchema = z.object({
  // Project-Level Insights
  projectId: z.string().uuid(),
  
  // Performance Predictions
  performance_forecast: z.object({
    expected_lifespan: z.number(), // in years
    predicted_maintenance_frequency: z.number(), // times per year
    estimated_total_lifecycle_cost: z.number()
  }),
  
  // Risk Assessment
  risk_factors: z.object({
    environmental_risk: z.number().min(0).max(100),
    usage_intensity_risk: z.number().min(0).max(100),
    material_degradation_risk: z.number().min(0).max(100)
  }),
  
  // Optimization Recommendations
  optimization_suggestions: z.array(z.string()),
  
  // Cost-Saving Potential
  potential_cost_savings: z.number().min(0).optional(),
  
  // Metadata
  analysis_timestamp: z.date().default(() => new Date()),
  analyzed_by: z.string().default('AI_PREDICTIVE_INSIGHTS_ENGINE')
});

// Infer TypeScript Types
export type PredictiveMaintenanceAnalysis = z.infer<typeof PredictiveMaintenanceSchema>;
export type QualityControlAssessment = z.infer<typeof QualityControlSchema>;
export type PredictiveInsights = z.infer<typeof PredictiveInsightsSchema>;

// Validation Functions
export function validatePredictiveMaintenance(data: unknown): PredictiveMaintenanceAnalysis {
  return PredictiveMaintenanceSchema.parse(data);
}

export function validateQualityControl(data: unknown): QualityControlAssessment {
  return QualityControlSchema.parse(data);
}

export function validatePredictiveInsights(data: unknown): PredictiveInsights {
  return PredictiveInsightsSchema.parse(data);
}

// Partial Update Schemas
export const PredictiveMaintenanceUpdateSchema = PredictiveMaintenanceSchema.partial();
export const QualityControlUpdateSchema = QualityControlSchema.partial();
export const PredictiveInsightsUpdateSchema = PredictiveInsightsSchema.partial();