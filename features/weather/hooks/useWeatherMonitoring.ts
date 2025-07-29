import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { 
  PavementWeatherImpact, 
  WeatherAlert,
  PavementWeatherImpactSchema,
  WeatherAlertSchema,
  PAVEMENT_IMPACT_LEVELS
} from '../schemas/weather-schema';

// OpenWeatherMap API Configuration
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Weather Monitoring Hook
export function useWeatherMonitoring() {
  const [weatherImpacts, setWeatherImpacts] = useState<PavementWeatherImpact[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time weather data for a specific location
  const fetchWeatherData = useCallback(async (
    latitude: number, 
    longitude: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${OPENWEATHERMAP_BASE_URL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OPENWEATHERMAP_API_KEY,
          units: 'imperial' // Use Fahrenheit
        }
      });

      // Transform OpenWeatherMap data to our schema
      const weatherForecast = {
        timestamp: new Date(),
        condition: mapWeatherCondition(response.data.weather[0].main),
        temperature: {
          current: response.data.main.temp,
          feels_like: response.data.main.feels_like,
          min: response.data.main.temp_min,
          max: response.data.main.temp_max,
          unit: 'fahrenheit'
        },
        precipitation: {
          probability: response.data.clouds?.all || 0,
          amount: response.data.rain?.['1h'] || 0,
          unit: 'inches'
        },
        wind: {
          speed: response.data.wind.speed,
          direction: response.data.wind.deg,
          condition: mapWindCondition(response.data.wind.speed)
        },
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        uv_index: null, // OpenWeatherMap doesn't provide UV index
        solar_radiation: null
      };

      return weatherForecast;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Weather data fetch failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analyze weather impact on pavement operations
  const analyzePavementWeatherImpact = useCallback(async (
    projectId: string, 
    location: { latitude: number; longitude: number },
    createdBy: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch weather data
      const forecast = await fetchWeatherData(location.latitude, location.longitude);

      // Determine material application feasibility
      const materialApplicationFeasibility = {
        asphalt_laying: isAsphaltLayingFeasible(forecast),
        sealcoating: isSealcoatingFeasible(forecast),
        line_striping: isLineStripingFeasible(forecast)
      };

      // Calculate impact severity
      const impactSeverity = calculateImpactSeverity(forecast);

      // Prepare pavement weather impact data
      const pavementWeatherImpact: PavementWeatherImpact = {
        projectId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        forecast,
        surface_temperature: forecast.temperature.current,
        surface_moisture: forecast.precipitation.probability,
        material_application_feasibility: materialApplicationFeasibility,
        impact_severity: impactSeverity,
        recommended_actions: generateRecommendedActions(
          forecast, 
          materialApplicationFeasibility, 
          impactSeverity
        ),
        risk_factors: {
          temperature_fluctuation: calculateTemperatureRisk(forecast),
          precipitation_risk: forecast.precipitation.probability,
          wind_interference: calculateWindRisk(forecast)
        },
        createdAt: new Date(),
        createdBy
      };

      // Validate the impact data
      const validatedImpact = PavementWeatherImpactSchema.parse(pavementWeatherImpact);

      // Save to Supabase
      const { data, error } = await supabase
        .from('pavement_weather_impacts')
        .insert(validatedImpact)
        .select();

      if (error) throw error;

      // Update local state
      setWeatherImpacts(prev => [...prev, validatedImpact]);

      return validatedImpact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Weather impact analysis failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeatherData]);

  // Fetch weather alerts for a specific area
  const fetchWeatherAlerts = useCallback(async (
    location: { latitude: number; longitude: number }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real-world scenario, this would call a weather alerts API
      // For now, we'll simulate potential alerts based on current weather
      const forecast = await fetchWeatherData(location.latitude, location.longitude);

      const potentialAlerts: WeatherAlert[] = [];

      // Generate alerts based on weather conditions
      if (forecast.temperature.current > 100) {
        potentialAlerts.push({
          id: crypto.randomUUID(),
          type: 'extreme_temperature',
          severity: 'warning',
          impact_level: 'critical',
          start_time: new Date(),
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          affected_radius_km: 50,
          description: 'Extreme heat warning: High temperatures may affect pavement operations',
          recommended_precautions: [
            'Postpone outdoor work during peak heat',
            'Ensure adequate hydration for workers',
            'Monitor equipment for heat-related stress'
          ],
          issued_by: 'PaveWise Weather Service',
          createdAt: new Date()
        });
      }

      if (forecast.precipitation.probability > 70) {
        potentialAlerts.push({
          id: crypto.randomUUID(),
          type: 'heavy_precipitation',
          severity: 'watch',
          impact_level: 'significant',
          start_time: new Date(),
          end_time: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          affected_radius_km: 30,
          description: 'Heavy precipitation expected: Potential disruption to pavement work',
          recommended_precautions: [
            'Delay outdoor pavement work',
            'Protect equipment and materials',
            'Monitor drainage and surface conditions'
          ],
          issued_by: 'PaveWise Weather Service',
          createdAt: new Date()
        });
      }

      // Validate alerts
      const validatedAlerts = potentialAlerts.map(alert => 
        WeatherAlertSchema.parse(alert)
      );

      // Save to Supabase
      const { data, error } = await supabase
        .from('weather_alerts')
        .insert(validatedAlerts)
        .select();

      if (error) throw error;

      // Update local state
      setWeatherAlerts(validatedAlerts);

      return validatedAlerts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Weather alerts fetch failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeatherData]);

  return {
    weatherImpacts,
    weatherAlerts,
    isLoading,
    error,
    fetchWeatherData,
    analyzePavementWeatherImpact,
    fetchWeatherAlerts
  };
}

// Utility Functions for Weather Analysis
function mapWeatherCondition(condition: string) {
  const conditionMap: Record<string, typeof WEATHER_CONDITIONS[number]> = {
    'Clear': 'clear',
    'Clouds': 'partly_cloudy',
    'Rain': 'rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Mist': 'fog'
  };
  return conditionMap[condition] || 'cloudy';
}

function mapWindCondition(windSpeed: number): typeof WIND_CONDITIONS[number] {
  if (windSpeed < 1) return 'calm';
  if (windSpeed < 5) return 'light_breeze';
  if (windSpeed < 10) return 'moderate_wind';
  if (windSpeed < 15) return 'strong_wind';
  if (windSpeed < 20) return 'gale';
  return 'storm';
}

function isAsphaltLayingFeasible(forecast: any): boolean {
  // Typical asphalt laying requires temperatures between 50-85°F
  return forecast.temperature.current >= 50 && forecast.temperature.current <= 85 
    && forecast.precipitation.probability < 30;
}

function isSealcoatingFeasible(forecast: any): boolean {
  // Sealcoating requires dry conditions and moderate temperatures
  return forecast.temperature.current >= 55 && forecast.temperature.current <= 80 
    && forecast.precipitation.probability < 20;
}

function isLineStripingFeasible(forecast: any): boolean {
  // Line striping needs dry, moderate conditions
  return forecast.temperature.current >= 45 && forecast.temperature.current <= 90 
    && forecast.precipitation.probability < 10;
}

function calculateImpactSeverity(forecast: any) {
  const severityLevels: typeof PAVEMENT_IMPACT_LEVELS = ['minimal', 'moderate', 'significant', 'critical'];
  
  // Calculate severity based on temperature and precipitation
  let severityIndex = 0;
  
  if (forecast.temperature.current < 40 || forecast.temperature.current > 95) {
    severityIndex += 2;
  }
  
  if (forecast.precipitation.probability > 50) {
    severityIndex += 1;
  }
  
  if (forecast.wind.speed > 15) {
    severityIndex += 1;
  }
  
  return {
    overall: severityLevels[Math.min(severityIndex, 3)],
    material_curing: severityLevels[Math.min(severityIndex, 3)],
    equipment_operation: severityLevels[Math.min(severityIndex, 3)]
  };
}

function generateRecommendedActions(
  forecast: any, 
  materialFeasibility: any, 
  impactSeverity: any
): string[] {
  const actions: string[] = [];

  if (!materialFeasibility.asphalt_laying) {
    actions.push('Postpone asphalt laying operations');
  }

  if (!materialFeasibility.sealcoating) {
    actions.push('Delay sealcoating work');
  }

  if (!materialFeasibility.line_striping) {
    actions.push('Reschedule line striping');
  }

  if (impactSeverity.overall === 'critical') {
    actions.push('Consider rescheduling all outdoor work');
  }

  if (forecast.precipitation.probability > 50) {
    actions.push('Prepare drainage and surface protection');
  }

  return actions;
}

function calculateTemperatureRisk(forecast: any): number {
  const tempRange = Math.abs(forecast.temperature.max - forecast.temperature.min);
  return Math.min(100, tempRange * 10);
}

function calculateWindRisk(forecast: any): number {
  return Math.min(100, forecast.wind.speed * 10);
}

// Specific hook for weather impact tracking
export function useWeatherImpactTracking(
  projectId: string, 
  location: { latitude: number; longitude: number }
) {
  const { 
    weatherImpacts, 
    analyzePavementWeatherImpact, 
    isLoading, 
    error 
  } = useWeatherMonitoring();

  // Track weather impact on component mount and at regular intervals
  useEffect(() => {
    const trackWeatherImpact = async () => {
      try {
        await analyzePavementWeatherImpact(
          projectId, 
          location, 
          'system_weather_tracker'
        );
      } catch (err) {
        console.error('Weather impact tracking failed', err);
      }
    };

    // Initial tracking
    trackWeatherImpact();

    // Track every 2 hours
    const intervalId = setInterval(trackWeatherImpact, 2 * 60 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [projectId, location, analyzePavementWeatherImpact]);

  return { weatherImpacts, isLoading, error };
}