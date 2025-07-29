import { z } from 'zod';

// Equipment Type Enum
export const EQUIPMENT_TYPES = [
  'vehicle', 
  'machinery', 
  'tool', 
  'sensor'
] as const;

// Equipment Status Enum
export const EQUIPMENT_STATUSES = [
  'operational', 
  'maintenance', 
  'retired'
] as const;

// Maintenance Record Schema
const MaintenanceRecordSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.date(),
  description: z.string().min(5, "Maintenance description is required"),
  performedBy: z.string().min(2, "Maintenance performer name is required"),
  cost: z.number().min(0, "Maintenance cost cannot be negative").optional(),
  nextMaintenanceDue: z.date().optional()
});

// IoT Sensor Details Schema
const IoTSensorDetailsSchema = z.object({
  deviceId: z.string().optional(),
  lastCalibrationDate: z.date().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  connectionStatus: z.enum(['connected', 'disconnected']).optional()
});

// Equipment Creation Schema
export const EquipmentCreationSchema = z.object({
  // Basic Equipment Information
  name: z.string()
    .min(2, { message: "Equipment name must be at least 2 characters" })
    .max(100, { message: "Equipment name cannot exceed 100 characters" }),
  
  // Type and Classification
  type: z.enum(EQUIPMENT_TYPES, {
    errorMap: () => ({ message: "Invalid equipment type" })
  }),
  
  // Identification Details
  serialNumber: z.string()
    .min(3, { message: "Serial number is required" })
    .max(50, { message: "Serial number is too long" })
    .optional(),
  
  // Ownership and Assignment
  ownerId: z.string().uuid().optional(),
  assignedProjectId: z.string().uuid().optional(),
  
  // Status and Condition
  status: z.enum(EQUIPMENT_STATUSES, {
    errorMap: () => ({ message: "Invalid equipment status" })
  }).default('operational'),
  
  // Acquisition Details
  purchaseDate: z.date()
    .refine(date => date <= new Date(), { 
      message: "Purchase date cannot be in the future" 
    })
    .optional(),
  
  purchasePrice: z.number()
    .min(0, { message: "Purchase price cannot be negative" })
    .optional(),
  
  // Location and Tracking
  currentLocation: z.string()
    .max(200, { message: "Location description is too long" })
    .optional(),
  
  gpsTrackingEnabled: z.boolean().default(false),
  
  // Maintenance Tracking
  lastMaintenanceDate: z.date().optional(),
  
  // Optional IoT and Sensor Details
  sensorDetails: IoTSensorDetailsSchema.optional(),
  
  // Maintenance History
  maintenanceRecords: z.array(MaintenanceRecordSchema).optional(),
  
  // Additional Notes
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters" })
    .optional(),
  
  // Metadata
  createdBy: z.string().uuid()
});

// Infer the TypeScript type from the Zod schema
export type EquipmentCreation = z.infer<typeof EquipmentCreationSchema>;

// Validation function
export function validateEquipment(data: unknown): EquipmentCreation {
  return EquipmentCreationSchema.parse(data);
}

// Optional: Create a partial schema for updates
export const EquipmentUpdateSchema = EquipmentCreationSchema.partial();

// Maintenance Record Type
export type MaintenanceRecord = z.infer<typeof MaintenanceRecordSchema>;

// IoT Sensor Details Type
export type IoTSensorDetails = z.infer<typeof IoTSensorDetailsSchema>;