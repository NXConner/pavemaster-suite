import { z } from 'zod';

// Material Types for Estimation
export const MATERIAL_TYPES = [
  'asphalt', 
  'concrete', 
  'sealcoat', 
  'line_paint'
] as const;

// Surface Condition Enum
export const SURFACE_CONDITIONS = [
  'new', 
  'moderate_wear', 
  'severe_damage', 
  'requires_complete_replacement'
] as const;

// Parking Lot Layout Schema
const ParkingLotLayoutSchema = z.object({
  totalSpaces: z.number().int().min(1, "At least one parking space is required"),
  handicapSpaces: z.number().int().min(0, "Handicap spaces cannot be negative"),
  compactSpaces: z.number().int().min(0, "Compact spaces cannot be negative"),
  layoutType: z.enum([
    'parallel', 
    'perpendicular', 
    'angled', 
    'mixed'
  ]),
  specialRequirements: z.string().optional()
});

// Material Calculation Schema
const MaterialCalculationSchema = z.object({
  type: z.enum(MATERIAL_TYPES),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  totalCost: z.number().positive("Total cost must be positive"),
  supplier: z.string().optional()
});

// Labor Calculation Schema
const LaborCalculationSchema = z.object({
  role: z.enum([
    'project_manager', 
    'senior_technician', 
    'technician', 
    'laborer'
  ]),
  hourlyRate: z.number().positive("Hourly rate must be positive"),
  estimatedHours: z.number().positive("Estimated hours must be positive"),
  totalCost: z.number().positive("Total labor cost must be positive")
});

// Estimation Creation Schema
export const EstimationCreationSchema = z.object({
  // Project Identification
  projectId: z.string().uuid(),
  churchName: z.string().min(2, "Church name is required"),
  
  // Surface Details
  surfaceArea: z.number()
    .positive("Surface area must be positive")
    .max(100000, "Surface area is unrealistically large"),
  
  surfaceCondition: z.enum(SURFACE_CONDITIONS),
  
  // Parking Lot Layout
  parkingLotLayout: ParkingLotLayoutSchema,
  
  // Material Calculations
  materialEstimates: z.array(MaterialCalculationSchema)
    .min(1, "At least one material estimate is required"),
  
  // Labor Calculations
  laborEstimates: z.array(LaborCalculationSchema)
    .min(1, "At least one labor estimate is required"),
  
  // Cost Breakdown
  totalMaterialCost: z.number()
    .positive("Total material cost must be positive"),
  
  totalLaborCost: z.number()
    .positive("Total labor cost must be positive"),
  
  totalEstimatedCost: z.number()
    .positive("Total estimated cost must be positive"),
  
  // Markup and Profit
  profitMargin: z.number()
    .min(0, "Profit margin cannot be negative")
    .max(100, "Profit margin cannot exceed 100%")
    .default(20),
  
  // Additional Considerations
  additionalNotes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  
  // Compliance and Regulations
  accessibilityComplianceRequired: z.boolean().default(false),
  
  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  
  // Optional Attachments
  layoutImageUrl: z.string().url().optional(),
  
  // Pricing Strategy
  pricingStrategy: z.enum([
    'fixed_price', 
    'time_and_materials', 
    'cost_plus'
  ]).default('fixed_price')
});

// Infer the TypeScript type from the Zod schema
export type EstimationCreation = z.infer<typeof EstimationCreationSchema>;

// Validation function
export function validateEstimation(data: unknown): EstimationCreation {
  return EstimationCreationSchema.parse(data);
}

// Optional: Create a partial schema for updates
export const EstimationUpdateSchema = EstimationCreationSchema.partial();

// Types for sub-schemas
export type ParkingLotLayout = z.infer<typeof ParkingLotLayoutSchema>;
export type MaterialCalculation = z.infer<typeof MaterialCalculationSchema>;
export type LaborCalculation = z.infer<typeof LaborCalculationSchema>;