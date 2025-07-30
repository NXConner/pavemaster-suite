import { z } from 'zod';

// Project Type Enum
export const PROJECT_TYPES = [
  'parking_lot', 
  'road', 
  'sealcoating', 
  'line_striping'
] as const;

// Project Status Enum
export const PROJECT_STATUSES = [
  'planning', 
  'scheduled', 
  'in_progress', 
  'completed', 
  'cancelled'
] as const;

// Church-Specific Constraints
const CHURCH_SERVICE_TIMES = [
  'Sunday 9:00 AM', 
  'Sunday 11:00 AM', 
  'Wednesday 7:00 PM'
] as const;

// Project Creation Schema
export const ProjectCreationSchema = z.object({
  // Basic Project Information
  name: z.string()
    .min(3, { message: "Project name must be at least 3 characters" })
    .max(100, { message: "Project name cannot exceed 100 characters" }),
  
  // Church-Specific Client Details
  clientName: z.string()
    .min(2, { message: "Client name is required" })
    .max(100, { message: "Client name is too long" }),
  
  churchName: z.string()
    .min(2, { message: "Church name is required" })
    .max(100, { message: "Church name is too long" }),
  
  // Project Type and Status
  type: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: "Invalid project type" })
  }),
  
  status: z.enum(PROJECT_STATUSES, {
    errorMap: () => ({ message: "Invalid project status" })
  }).default('planning'),
  
  // Location Details
  locationAddress: z.string()
    .min(5, { message: "Location address is required" })
    .max(200, { message: "Location address is too long" }),
  
  locationCoordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  
  // Scheduling Considerations
  preferredServiceTimes: z.array(
    z.enum(CHURCH_SERVICE_TIMES)
  ).optional(),
  
  // Scheduling Dates
  startDate: z.date()
    .refine(date => date >= new Date(), { 
      message: "Start date must be in the future" 
    }),
  
  endDate: z.date()
    .optional(),
  
  // Cost Estimation
  estimatedCost: z.number()
    .min(0, { message: "Estimated cost cannot be negative" })
    .max(1000000, { message: "Estimated cost is unrealistically high" })
    .optional(),
  
  // Additional Project Details
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters" })
    .optional(),
  
  // Parking Lot Specific Details (Optional)
  parkingSpaceCount: z.number()
    .int()
    .min(0, { message: "Parking space count cannot be negative" })
    .optional(),
  
  // Accessibility Considerations
  accessibilityRequirements: z.boolean().default(false),
  
  // Compliance and Regulations
  permitRequired: z.boolean().default(false),
  
  // Metadata
  createdBy: z.string().uuid()
});

// Infer the TypeScript type from the Zod schema
export type ProjectCreation = z.infer<typeof ProjectCreationSchema>;

// Validation function
export function validateProject(data: unknown): ProjectCreation {
  return ProjectCreationSchema.parse(data);
}

// Optional: Create a partial schema for updates
export const ProjectUpdateSchema = ProjectCreationSchema.partial();