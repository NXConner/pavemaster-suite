import { z } from 'zod';

// Measurement Types
export const MEASUREMENT_TYPES = [
  'area', 
  'length', 
  'volume', 
  'perimeter', 
  'surface_condition'
] as const;

// Surface Condition Evaluation
export const SURFACE_CONDITION_LEVELS = [
  'excellent', 
  'good', 
  'moderate', 
  'poor', 
  'critical'
] as const;

// Geospatial Reference Schema
const GeospatialReferenceSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional()
});

// Image Metadata Schema
const ImageMetadataSchema = z.object({
  url: z.string().url(),
  capturedAt: z.date(),
  resolution: z.object({
    width: z.number().positive(),
    height: z.number().positive()
  }),
  geotagging: GeospatialReferenceSchema.optional()
});

// AI-Powered Analysis Metadata
const AIAnalysisMetadataSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  detectedFeatures: z.array(z.string()).optional(),
  anomalies: z.array(z.string()).optional(),
  recommendedActions: z.array(z.string()).optional()
});

// Measurement Creation Schema
export const MeasurementCreationSchema = z.object({
  // Basic Measurement Information
  projectId: z.string().uuid(),
  
  // Measurement Specifics
  type: z.enum(MEASUREMENT_TYPES),
  
  // Dimensional Measurements
  value: z.number().positive("Measurement value must be positive"),
  unit: z.enum(['sq_ft', 'linear_ft', 'cubic_ft', 'meters', 'sq_meters']),
  
  // Surface Condition (if applicable)
  surfaceCondition: z.enum(SURFACE_CONDITION_LEVELS).optional(),
  
  // Geospatial Context
  location: GeospatialReferenceSchema.optional(),
  
  // Image-Based Measurement
  imageMetadata: ImageMetadataSchema.optional(),
  
  // AI-Enhanced Analysis
  aiAnalysis: AIAnalysisMetadataSchema.optional(),
  
  // Calculation Method
  calculationMethod: z.enum([
    'manual', 
    'gps_tracking', 
    'image_analysis', 
    'laser_scanning', 
    'drone_survey'
  ]),
  
  // Measurement Precision
  precision: z.number()
    .min(0, "Precision must be a non-negative number")
    .max(100, "Precision cannot exceed 100%")
    .default(95),
  
  // Material Composition (for surface measurements)
  materialComposition: z.object({
    asphaltPercentage: z.number().min(0).max(100).optional(),
    concretePercentage: z.number().min(0).max(100).optional(),
    otherMaterials: z.record(z.number()).optional()
  }).optional(),
  
  // Degradation Analysis
  degradationMetrics: z.object({
    crackDensity: z.number().min(0).max(100).optional(),
    potholeCount: z.number().min(0).optional(),
    surfaceRoughness: z.number().min(0).max(10).optional()
  }).optional(),
  
  // Additional Context
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  
  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date().default(() => new Date())
});

// Infer the TypeScript type from the Zod schema
export type MeasurementCreation = z.infer<typeof MeasurementCreationSchema>;

// Validation function
export function validateMeasurement(data: unknown): MeasurementCreation {
  return MeasurementCreationSchema.parse(data);
}

// Optional: Create a partial schema for updates
export const MeasurementUpdateSchema = MeasurementCreationSchema.partial();

// Types for sub-schemas
export type GeospatialReference = z.infer<typeof GeospatialReferenceSchema>;
export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type AIAnalysisMetadata = z.infer<typeof AIAnalysisMetadataSchema>;