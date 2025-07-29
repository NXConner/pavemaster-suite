import { z } from 'zod';

// Weather Condition Categories
export const WEATHER_CONDITIONS = [
  'clear', 
  'partly_cloudy', 
  'cloudy', 
  'rain', 
  'heavy_rain', 
  'thunderstorm', 
  'snow', 
  'sleet', 
  'fog', 
  'extreme_heat', 
  'extreme_cold'
] as const;

// Wind Condition Categories
export const WIND_CONDITIONS = [
  'calm', 
  'light_breeze', 
  'moderate_wind', 
  'strong_wind', 
  'gale', 
  'storm'
] as const;

// Pavement Impact Severity
export const PAVEMENT_IMPACT_LEVELS = [
  'minimal', 
  'moderate', 
  'significant', 
  'critical'
] as const;

// Geospatial Reference Schema
const GeospatialReferenceSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional()
});

// Weather Forecast Schema
const WeatherForecastSchema = z.object({
  // Basic Weather Information
  timestamp: z.date(),
  condition: z.enum(WEATHER_CONDITIONS),
  
  // Temperature Details
  temperature: z.object({
    current: z.number(),
    feels_like: z.number(),
    min: z.number(),
    max: z.number(),
    unit: z.enum(['celsius', 'fahrenheit']).default('fahrenheit')
  }),
  
  // Precipitation Details
  precipitation: z.object({
    probability: z.number().min(0).max(100),
    amount: z.number().min(0),
    unit: z.enum(['mm', 'inches']).default('inches')
  }),
  
  // Wind Information
  wind: z.object({
    speed: z.number().min(0),
    direction: z.number().min(0).max(360),
    condition: z.enum(WIND_CONDITIONS)
  }),
  
  // Humidity and Atmospheric Conditions
  humidity: z.number().min(0).max(100),
  pressure: z.number(), // in hPa or mbar
  
  // UV Index and Solar Radiation
  uv_index: z.number().min(0).max(15).optional(),
  solar_radiation: z.number().min(0).optional()
});

// Pavement-Specific Weather Impact Schema
export const PavementWeatherImpactSchema = z.object({
  // Project and Location Context
  projectId: z.string().uuid(),
  location: GeospatialReferenceSchema,
  
  // Weather Forecast Details
  forecast: WeatherForecastSchema,
  
  // Pavement-Specific Impact Assessment
  surface_temperature: z.number(),
  surface_moisture: z.number().min(0).max(100),
  
  // Material Application Constraints
  material_application_feasibility: z.object({
    asphalt_laying: z.boolean(),
    sealcoating: z.boolean(),
    line_striping: z.boolean()
  }),
  
  // Impact Severity Assessment
  impact_severity: z.object({
    overall: z.enum(PAVEMENT_IMPACT_LEVELS),
    material_curing: z.enum(PAVEMENT_IMPACT_LEVELS),
    equipment_operation: z.enum(PAVEMENT_IMPACT_LEVELS)
  }),
  
  // Recommended Actions
  recommended_actions: z.array(z.string()).optional(),
  
  // Risk Factors
  risk_factors: z.object({
    temperature_fluctuation: z.number().min(0).max(100),
    precipitation_risk: z.number().min(0).max(100),
    wind_interference: z.number().min(0).max(100)
  }),
  
  // Metadata
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid()
});

// Weather Alert Schema
export const WeatherAlertSchema = z.object({
  // Alert Identification
  id: z.string().uuid(),
  
  // Alert Details
  type: z.enum([
    'extreme_temperature', 
    'heavy_precipitation', 
    'high_winds', 
    'severe_weather'
  ]),
  
  // Severity and Impact
  severity: z.enum(['advisory', 'watch', 'warning']),
  impact_level: z.enum(PAVEMENT_IMPACT_LEVELS),
  
  // Temporal Context
  start_time: z.date(),
  end_time: z.date(),
  
  // Location and Scope
  location: GeospatialReferenceSchema,
  affected_radius_km: z.number().positive(),
  
  // Detailed Description
  description: z.string().max(500),
  
  // Recommended Precautions
  recommended_precautions: z.array(z.string()),
  
  // Metadata
  issued_by: z.string(),
  createdAt: z.date().default(() => new Date())
});

// Infer TypeScript Types
export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
export type PavementWeatherImpact = z.infer<typeof PavementWeatherImpactSchema>;
export type WeatherAlert = z.infer<typeof WeatherAlertSchema>;

// Validation Functions
export function validatePavementWeatherImpact(data: unknown): PavementWeatherImpact {
  return PavementWeatherImpactSchema.parse(data);
}

export function validateWeatherAlert(data: unknown): WeatherAlert {
  return WeatherAlertSchema.parse(data);
}

// Optional: Create partial schemas for updates
export const PavementWeatherImpactUpdateSchema = PavementWeatherImpactSchema.partial();
export const WeatherAlertUpdateSchema = WeatherAlertSchema.partial();