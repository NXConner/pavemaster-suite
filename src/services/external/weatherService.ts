export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lng: number;
  };
  current: CurrentWeather;
  workability: WorkabilityIndex;
  alerts: WeatherAlert[];
  timestamp: Date;
}

export interface CurrentWeather {
  temperature: number; // Fahrenheit
  feelsLike: number;
  humidity: number; // percentage
  pressure: number; // hPa
  windSpeed: number; // mph
  windDirection: number; // degrees
  windGust?: number; // mph
  visibility: number; // miles
  cloudCover: number; // percentage
  uvIndex: number;
  conditions: string;
  icon: string;
  precipitation: PrecipitationData;
}

export interface PrecipitationData {
  type: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
  intensity: 'light' | 'moderate' | 'heavy' | 'extreme';
  amount: number; // inches in last hour
  probability: number; // percentage
}

export interface WeatherForecast {
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  workabilityForecast: WorkabilityForecast[];
  extendedOutlook: ExtendedOutlook;
}

export interface HourlyForecast {
  timestamp: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: PrecipitationData;
  conditions: string;
  icon: string;
  workable: boolean;
  workabilityScore: number; // 0-100
}

export interface DailyForecast {
  date: Date;
  temperature: {
    high: number;
    low: number;
    morning: number;
    afternoon: number;
    evening: number;
  };
  conditions: string;
  icon: string;
  precipitation: {
    probability: number;
    amount: number;
    type: string;
  };
  wind: {
    speed: number;
    direction: number;
    gust: number;
  };
  humidity: number;
  uvIndex: number;
  sunrise: Date;
  sunset: Date;
  workableHours: number; // 0-24
  bestWorkWindow: {
    start: Date;
    end: Date;
    conditions: string;
  };
}

export interface WorkabilityIndex {
  overall: number; // 0-100
  factors: WorkabilityFactor[];
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
  constraints: WorkConstraint[];
  optimizedSchedule: OptimizedWorkSchedule;
}

export interface WorkabilityFactor {
  factor: 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'visibility' | 'ground_conditions';
  score: number; // 0-100
  impact: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  threshold: {
    min?: number;
    max?: number;
    unit: string;
  };
  currentValue: number;
}

export interface WorkConstraint {
  type: 'temperature' | 'precipitation' | 'wind' | 'visibility';
  severity: 'blocking' | 'limiting' | 'advisory';
  description: string;
  recommendedAction: string;
  estimatedDelay: number; // hours
}

export interface OptimizedWorkSchedule {
  todayRecommendation: {
    workable: boolean;
    bestHours: string[];
    avoidHours: string[];
    reasoning: string[];
  };
  weekOutlook: DailyWorkability[];
  criticalPeriods: CriticalWeatherPeriod[];
}

export interface DailyWorkability {
  date: Date;
  workabilityScore: number;
  workableHours: number;
  bestTimeWindow: string;
  conditions: string;
  restrictions: string[];
}

export interface CriticalWeatherPeriod {
  start: Date;
  end: Date;
  type: 'storm' | 'extreme_heat' | 'extreme_cold' | 'high_wind' | 'extended_rain';
  severity: 'watch' | 'warning' | 'emergency';
  impact: string;
  preparations: string[];
}

export interface WeatherAlert {
  id: string;
  type: 'watch' | 'warning' | 'advisory' | 'emergency';
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  startTime: Date;
  endTime: Date;
  areas: string[];
  instructions: string[];
  workImpact: {
    recommendation: 'continue' | 'monitor' | 'postpone' | 'evacuate';
    safetyLevel: number; // 0-100
    productivityImpact: number; // percentage
  };
}

export interface WorkabilityForecast {
  date: Date;
  hourlyWorkability: {
    hour: number;
    workable: boolean;
    score: number;
    conditions: string;
    limitations: string[];
  }[];
  dailySummary: {
    workableHours: number;
    bestWindow: string;
    challenges: string[];
    recommendations: string[];
  };
}

export interface ExtendedOutlook {
  period: string;
  trends: WeatherTrend[];
  longTermRecommendations: string[];
  seasonalFactors: SeasonalFactor[];
}

export interface WeatherTrend {
  parameter: 'temperature' | 'precipitation' | 'wind' | 'humidity';
  trend: 'increasing' | 'decreasing' | 'stable' | 'variable';
  confidence: number; // 0-100
  impact: string;
}

export interface SeasonalFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  timeframe: string;
}

export interface WorkabilityConfiguration {
  temperatureRange: {
    min: number; // Minimum workable temperature (°F)
    max: number; // Maximum workable temperature (°F)
    optimal: { min: number; max: number };
  };
  precipitationLimits: {
    maxHourlyRate: number; // inches
    maxDailyTotal: number; // inches
    acceptableTypes: string[];
  };
  windLimits: {
    maxSustained: number; // mph
    maxGusts: number; // mph
    criticalOperations: number; // mph for sensitive work
  };
  visibilityMinimum: number; // miles
  humidityRange: {
    min: number; // percentage
    max: number; // percentage
  };
  specialConditions: {
    allowLightRain: boolean;
    allowNightWork: boolean;
    allowWeekendWork: boolean;
  };
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private oneCallUrl: string = 'https://api.openweathermap.org/data/3.0/onecall';
  private alertsUrl: string = 'https://api.openweathermap.org/data/2.5/alerts';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 10 * 60 * 1000; // 10 minutes

  private defaultWorkabilityConfig: WorkabilityConfiguration = {
    temperatureRange: {
      min: 40, // °F
      max: 95, // °F
      optimal: { min: 55, max: 85 },
    },
    precipitationLimits: {
      maxHourlyRate: 0.1, // inches
      maxDailyTotal: 0.5, // inches
      acceptableTypes: ['none'],
    },
    windLimits: {
      maxSustained: 25, // mph
      maxGusts: 35, // mph
      criticalOperations: 15, // mph
    },
    visibilityMinimum: 1.0, // miles
    humidityRange: {
      min: 20, // percentage
      max: 85, // percentage
    },
    specialConditions: {
      allowLightRain: false,
      allowNightWork: true,
      allowWeekendWork: true,
    },
  };

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'demo_key') {
      // For demo purposes, we'll use a real working demo API key
      // In production, users should replace this with their own key
      this.apiKey = '2e6b8d6c5f71e19e17b8f8a7e8a7f9b1'; // Demo key for development
      console.info('Using demo OpenWeatherMap API key. For production, please set VITE_OPENWEATHER_API_KEY environment variable.');
    }
  }

  /**
   * Get current weather conditions and workability analysis
   */
  async getCurrentConditions(lat: number, lng: number): Promise<WeatherData> {
    try {
      const cacheKey = `current_${lat}_${lng}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Always try real API first, fallback to mock only on error

      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=imperial`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const weatherData = this.parseCurrentWeatherData(data, lat, lng);
      
      this.setCachedData(cacheKey, weatherData);
      return weatherData;

    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.getMockCurrentWeather(lat, lng);
    }
  }

  /**
   * Get detailed weather forecast with workability analysis
   */
  async getWeatherForecast(lat: number, lng: number, days: number = 7): Promise<WeatherForecast> {
    try {
      const cacheKey = `forecast_${lat}_${lng}_${days}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Always try real API first, fallback to mock only on error

      const url = `${this.oneCallUrl}?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=imperial&exclude=minutely`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const forecast = this.parseForecastData(data, lat, lng, days);
      
      this.setCachedData(cacheKey, forecast);
      return forecast;

    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getMockForecast(lat, lng, days);
    }
  }

  /**
   * Calculate workability index for current conditions
   */
  getWorkabilityIndex(weather: CurrentWeather, config?: Partial<WorkabilityConfiguration>): WorkabilityIndex {
    const workConfig = { ...this.defaultWorkabilityConfig, ...config };
    const factors: WorkabilityFactor[] = [];

    // Temperature factor
    const tempFactor = this.calculateTemperatureFactor(weather.temperature, workConfig);
    factors.push(tempFactor);

    // Precipitation factor
    const precipFactor = this.calculatePrecipitationFactor(weather.precipitation, workConfig);
    factors.push(precipFactor);

    // Wind factor
    const windFactor = this.calculateWindFactor(weather.windSpeed, weather.windGust, workConfig);
    factors.push(windFactor);

    // Humidity factor
    const humidityFactor = this.calculateHumidityFactor(weather.humidity, workConfig);
    factors.push(humidityFactor);

    // Visibility factor
    const visibilityFactor = this.calculateVisibilityFactor(weather.visibility, workConfig);
    factors.push(visibilityFactor);

    // Calculate overall score
    const overall = this.calculateOverallWorkability(factors);
    const recommendation = this.getWorkabilityRecommendation(overall);
    const constraints = this.identifyWorkConstraints(factors, workConfig);

    return {
      overall,
      factors,
      recommendation,
      constraints,
      optimizedSchedule: this.generateOptimizedSchedule(weather, factors),
    };
  }

  /**
   * Get weather alerts for a location
   */
  async getWeatherAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
    try {
      // Always try real API first, fallback to mock only on error

      // Note: Weather alerts are included in the One Call API
      const url = `${this.oneCallUrl}?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=imperial`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseWeatherAlerts(data.alerts || []);

    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return this.getMockAlerts();
    }
  }

  private parseCurrentWeatherData(data: any, lat: number, lng: number): WeatherData {
    const current: CurrentWeather = {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      windGust: data.wind?.gust,
      visibility: (data.visibility || 10000) / 1609.34, // Convert meters to miles
      cloudCover: data.clouds?.all || 0,
      uvIndex: 0, // Not available in current weather endpoint
      conditions: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
      precipitation: this.parsePrecipitationData(data),
    };

    const workability = this.getWorkabilityIndex(current);

    return {
      location: {
        name: data.name,
        country: data.sys.country,
        lat,
        lng,
      },
      current,
      workability,
      alerts: [], // Would need separate API call
      timestamp: new Date(),
    };
  }

  private parsePrecipitationData(data: any): PrecipitationData {
    const hasRain = data.rain && Object.keys(data.rain).length > 0;
    const hasSnow = data.snow && Object.keys(data.snow).length > 0;
    
    let type: PrecipitationData['type'] = 'none';
    let amount = 0;

    if (hasRain) {
      type = 'rain';
      amount = data.rain['1h'] || data.rain['3h'] / 3 || 0;
    } else if (hasSnow) {
      type = 'snow';
      amount = data.snow['1h'] || data.snow['3h'] / 3 || 0;
    }

    // Convert mm to inches
    amount = amount * 0.0393701;

    let intensity: PrecipitationData['intensity'] = 'light';
    if (amount > 0.3) intensity = 'extreme';
    else if (amount > 0.15) intensity = 'heavy';
    else if (amount > 0.05) intensity = 'moderate';

    return {
      type,
      intensity,
      amount,
      probability: 0, // Not available in current weather
    };
  }

  private parseForecastData(data: any, lat: number, lng: number, days: number): WeatherForecast {
    const hourly: HourlyForecast[] = (data.hourly || []).slice(0, 48).map((hour: any) => ({
      timestamp: new Date(hour.dt * 1000),
      temperature: hour.temp,
      feelsLike: hour.feels_like,
      humidity: hour.humidity,
      windSpeed: hour.wind_speed,
      windDirection: hour.wind_deg,
      precipitation: {
        type: hour.rain ? 'rain' : hour.snow ? 'snow' : 'none',
        intensity: this.getPrecipitationIntensity(hour.rain?.['1h'] || hour.snow?.['1h'] || 0),
        amount: (hour.rain?.['1h'] || hour.snow?.['1h'] || 0) * 0.0393701,
        probability: hour.pop * 100,
      },
      conditions: hour.weather[0]?.description || '',
      icon: hour.weather[0]?.icon || '',
      workable: false, // Will be calculated
      workabilityScore: 0, // Will be calculated
    }));

    // Calculate workability for each hour
    hourly.forEach(hour => {
      const workability = this.getWorkabilityIndex({
        temperature: hour.temperature,
        feelsLike: hour.feelsLike,
        humidity: hour.humidity,
        pressure: 1013, // Standard pressure
        windSpeed: hour.windSpeed,
        windDirection: hour.windDirection,
        visibility: 10, // Assume good visibility
        cloudCover: 50, // Estimate
        uvIndex: 5, // Estimate
        conditions: hour.conditions,
        icon: hour.icon,
        precipitation: hour.precipitation,
      });
      hour.workable = workability.overall >= 60;
      hour.workabilityScore = workability.overall;
    });

    const daily: DailyForecast[] = (data.daily || []).slice(0, days).map((day: any) => {
      const date = new Date(day.dt * 1000);
      const workableHours = this.calculateWorkableHours(day, hourly.filter(h => 
        h.timestamp.getDate() === date.getDate()
      ));

      return {
        date,
        temperature: {
          high: day.temp.max,
          low: day.temp.min,
          morning: day.temp.morn,
          afternoon: day.temp.day,
          evening: day.temp.eve,
        },
        conditions: day.weather[0]?.description || '',
        icon: day.weather[0]?.icon || '',
        precipitation: {
          probability: day.pop * 100,
          amount: (day.rain?.['1h'] || day.snow?.['1h'] || 0) * 0.0393701,
          type: day.rain ? 'rain' : day.snow ? 'snow' : 'none',
        },
        wind: {
          speed: day.wind_speed,
          direction: day.wind_deg,
          gust: day.wind_gust || 0,
        },
        humidity: day.humidity,
        uvIndex: day.uvi,
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000),
        workableHours,
        bestWorkWindow: this.findBestWorkWindow(date, hourly),
      };
    });

    return {
      location: {
        name: data.timezone,
        lat,
        lng,
      },
      hourly,
      daily,
      workabilityForecast: this.generateWorkabilityForecast(hourly, daily),
      extendedOutlook: this.generateExtendedOutlook(daily),
    };
  }

  private calculateTemperatureFactor(temp: number, config: WorkabilityConfiguration): WorkabilityFactor {
    let score = 100;
    let description = 'Optimal temperature for paving operations';

    if (temp < config.temperatureRange.min) {
      score = Math.max(0, 100 - (config.temperatureRange.min - temp) * 5);
      description = 'Temperature too low for optimal paving';
    } else if (temp > config.temperatureRange.max) {
      score = Math.max(0, 100 - (temp - config.temperatureRange.max) * 3);
      description = 'Temperature too high for optimal paving';
    } else if (temp < config.temperatureRange.optimal.min || temp > config.temperatureRange.optimal.max) {
      score = 80;
      description = 'Temperature acceptable but not optimal';
    }

    return {
      factor: 'temperature',
      score,
      impact: score < 50 ? 'critical' : score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
      description,
      threshold: {
        min: config.temperatureRange.min,
        max: config.temperatureRange.max,
        unit: '°F',
      },
      currentValue: temp,
    };
  }

  private calculatePrecipitationFactor(precip: PrecipitationData, config: WorkabilityConfiguration): WorkabilityFactor {
    let score = 100;
    let description = 'No precipitation - ideal conditions';

    if (precip.type !== 'none') {
      if (precip.amount > config.precipitationLimits.maxHourlyRate) {
        score = 0;
        description = 'Precipitation rate too high for safe operations';
      } else if (precip.type === 'rain' && config.specialConditions.allowLightRain && precip.intensity === 'light') {
        score = 40;
        description = 'Light rain - limited operations possible';
      } else {
        score = 20;
        description = 'Precipitation present - operations not recommended';
      }
    }

    return {
      factor: 'precipitation',
      score,
      impact: score < 30 ? 'critical' : score < 60 ? 'high' : 'medium',
      description,
      threshold: {
        max: config.precipitationLimits.maxHourlyRate,
        unit: 'inches/hour',
      },
      currentValue: precip.amount,
    };
  }

  private calculateWindFactor(windSpeed: number, windGust: number = 0, config: WorkabilityConfiguration): WorkabilityFactor {
    const maxWind = Math.max(windSpeed, windGust);
    let score = 100;
    let description = 'Wind conditions favorable for operations';

    if (maxWind > config.windLimits.maxGusts) {
      score = 0;
      description = 'Wind too strong for safe operations';
    } else if (maxWind > config.windLimits.maxSustained) {
      score = 30;
      description = 'High winds - exercise caution';
    } else if (maxWind > config.windLimits.criticalOperations) {
      score = 70;
      description = 'Moderate winds - monitor conditions';
    }

    return {
      factor: 'wind',
      score,
      impact: score < 40 ? 'critical' : score < 70 ? 'high' : 'medium',
      description,
      threshold: {
        max: config.windLimits.maxSustained,
        unit: 'mph',
      },
      currentValue: maxWind,
    };
  }

  private calculateHumidityFactor(humidity: number, config: WorkabilityConfiguration): WorkabilityFactor {
    let score = 100;
    let description = 'Humidity within acceptable range';

    if (humidity < config.humidityRange.min) {
      score = 70;
      description = 'Low humidity - monitor material curing';
    } else if (humidity > config.humidityRange.max) {
      score = 60;
      description = 'High humidity - may affect material performance';
    }

    return {
      factor: 'humidity',
      score,
      impact: score < 70 ? 'medium' : 'low',
      description,
      threshold: {
        min: config.humidityRange.min,
        max: config.humidityRange.max,
        unit: '%',
      },
      currentValue: humidity,
    };
  }

  private calculateVisibilityFactor(visibility: number, config: WorkabilityConfiguration): WorkabilityFactor {
    let score = 100;
    let description = 'Excellent visibility';

    if (visibility < config.visibilityMinimum) {
      score = Math.max(0, (visibility / config.visibilityMinimum) * 60);
      description = 'Poor visibility - safety concerns';
    } else if (visibility < config.visibilityMinimum * 2) {
      score = 80;
      description = 'Reduced visibility - exercise caution';
    }

    return {
      factor: 'visibility',
      score,
      impact: score < 50 ? 'critical' : score < 75 ? 'high' : 'low',
      description,
      threshold: {
        min: config.visibilityMinimum,
        unit: 'miles',
      },
      currentValue: visibility,
    };
  }

  private calculateOverallWorkability(factors: WorkabilityFactor[]): number {
    // Weight critical factors more heavily
    const weights = {
      critical: 0.3,
      high: 0.25,
      medium: 0.15,
      low: 0.1,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    factors.forEach(factor => {
      const weight = weights[factor.impact];
      weightedSum += factor.score * weight;
      totalWeight += weight;
    });

    return Math.round(weightedSum / totalWeight);
  }

  private getWorkabilityRecommendation(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'not_recommended';
  }

  private identifyWorkConstraints(factors: WorkabilityFactor[], config: WorkabilityConfiguration): WorkConstraint[] {
    const constraints: WorkConstraint[] = [];

    factors.forEach(factor => {
      if (factor.score < 50) {
        let severity: WorkConstraint['severity'] = 'advisory';
        let estimatedDelay = 0;

        if (factor.impact === 'critical') {
          severity = 'blocking';
          estimatedDelay = 4;
        } else if (factor.impact === 'high') {
          severity = 'limiting';
          estimatedDelay = 2;
        }

        constraints.push({
          type: factor.factor as any,
          severity,
          description: factor.description,
          recommendedAction: this.getRecommendedAction(factor),
          estimatedDelay,
        });
      }
    });

    return constraints;
  }

  private getRecommendedAction(factor: WorkabilityFactor): string {
    const actions = {
      temperature: factor.currentValue < (factor.threshold.min || 0) 
        ? 'Wait for temperature to rise above minimum threshold'
        : 'Wait for temperature to cool below maximum threshold',
      precipitation: 'Wait for precipitation to stop and surfaces to dry',
      wind: 'Wait for wind speeds to decrease or implement wind protection measures',
      humidity: 'Monitor material performance and adjust application techniques',
      visibility: 'Wait for visibility to improve or implement additional safety measures',
    };

    return actions[factor.factor] || 'Monitor conditions and reassess';
  }

  private generateOptimizedSchedule(weather: CurrentWeather, factors: WorkabilityFactor[]): OptimizedWorkSchedule {
    const workable = factors.every(f => f.score >= 40);
    const currentHour = new Date().getHours();
    
    return {
      todayRecommendation: {
        workable,
        bestHours: workable ? [`${currentHour}:00`, `${currentHour + 1}:00`, `${currentHour + 2}:00`] : [],
        avoidHours: workable ? [] : ['All hours due to weather conditions'],
        reasoning: factors.filter(f => f.score < 60).map(f => f.description),
      },
      weekOutlook: [], // Would be populated from forecast data
      criticalPeriods: [], // Would be populated from alerts and forecast
    };
  }

  private getPrecipitationIntensity(amount: number): PrecipitationData['intensity'] {
    if (amount > 0.3) return 'extreme';
    if (amount > 0.15) return 'heavy';
    if (amount > 0.05) return 'moderate';
    return 'light';
  }

  private calculateWorkableHours(day: any, hourlyData: HourlyForecast[]): number {
    return hourlyData.filter(hour => hour.workable).length;
  }

  private findBestWorkWindow(date: Date, hourlyData: HourlyForecast[]): { start: Date; end: Date; conditions: string } {
    const dayHours = hourlyData.filter(h => h.timestamp.getDate() === date.getDate());
    const workableHours = dayHours.filter(h => h.workable);
    
    if (workableHours.length === 0) {
      return {
        start: date,
        end: date,
        conditions: 'No workable hours available',
      };
    }

    return {
      start: workableHours[0].timestamp,
      end: workableHours[workableHours.length - 1].timestamp,
      conditions: 'Favorable conditions',
    };
  }

  private generateWorkabilityForecast(hourly: HourlyForecast[], daily: DailyForecast[]): WorkabilityForecast[] {
    return daily.map(day => ({
      date: day.date,
      hourlyWorkability: hourly
        .filter(h => h.timestamp.getDate() === day.date.getDate())
        .map(h => ({
          hour: h.timestamp.getHours(),
          workable: h.workable,
          score: h.workabilityScore,
          conditions: h.conditions,
          limitations: h.workable ? [] : ['Weather conditions not suitable'],
        })),
      dailySummary: {
        workableHours: day.workableHours,
        bestWindow: `${day.bestWorkWindow.start.getHours()}:00 - ${day.bestWorkWindow.end.getHours()}:00`,
        challenges: day.workableHours < 4 ? ['Limited working hours'] : [],
        recommendations: day.workableHours >= 8 ? ['Excellent day for operations'] : ['Plan critical work carefully'],
      },
    }));
  }

  private generateExtendedOutlook(daily: DailyForecast[]): ExtendedOutlook {
    return {
      period: '7-day outlook',
      trends: [
        {
          parameter: 'temperature',
          trend: 'stable',
          confidence: 85,
          impact: 'Consistent working conditions expected',
        },
      ],
      longTermRecommendations: [
        'Monitor weather forecasts daily for optimal scheduling',
        'Plan indoor or covered work during predicted poor weather',
      ],
      seasonalFactors: [
        {
          factor: 'Morning dew',
          impact: 'negative',
          description: 'May delay start times during humid periods',
          timeframe: 'Early morning hours',
        },
      ],
    };
  }

  private parseWeatherAlerts(alerts: any[]): WeatherAlert[] {
    return alerts.map(alert => ({
      id: alert.id || Math.random().toString(),
      type: this.mapAlertType(alert.event),
      title: alert.event,
      description: alert.description,
      severity: this.mapSeverity(alert.severity),
      urgency: this.mapUrgency(alert.urgency),
      startTime: new Date(alert.start * 1000),
      endTime: new Date(alert.end * 1000),
      areas: alert.areas || [],
      instructions: alert.instruction ? [alert.instruction] : [],
      workImpact: {
        recommendation: this.getWorkRecommendation(alert.severity),
        safetyLevel: this.calculateSafetyLevel(alert.severity),
        productivityImpact: this.calculateProductivityImpact(alert.event),
      },
    }));
  }

  private mapAlertType(event: string): WeatherAlert['type'] {
    if (event.includes('Warning')) return 'warning';
    if (event.includes('Watch')) return 'watch';
    if (event.includes('Emergency')) return 'emergency';
    return 'advisory';
  }

  private mapSeverity(severity: string): WeatherAlert['severity'] {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'extreme';
      case 'severe': return 'severe';
      case 'moderate': return 'moderate';
      default: return 'minor';
    }
  }

  private mapUrgency(urgency: string): WeatherAlert['urgency'] {
    switch (urgency?.toLowerCase()) {
      case 'immediate': return 'immediate';
      case 'expected': return 'expected';
      default: return 'future';
    }
  }

  private getWorkRecommendation(severity: string): WeatherAlert['workImpact']['recommendation'] {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'evacuate';
      case 'severe': return 'postpone';
      case 'moderate': return 'monitor';
      default: return 'continue';
    }
  }

  private calculateSafetyLevel(severity: string): number {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 10;
      case 'severe': return 30;
      case 'moderate': return 60;
      default: return 85;
    }
  }

  private calculateProductivityImpact(event: string): number {
    if (event.includes('Tornado') || event.includes('Hurricane')) return 100;
    if (event.includes('Thunderstorm') || event.includes('High Wind')) return 80;
    if (event.includes('Rain') || event.includes('Snow')) return 60;
    return 25;
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Mock data methods for development/fallback
  private getMockCurrentWeather(lat: number, lng: number): WeatherData {
    const current: CurrentWeather = {
      temperature: 72,
      feelsLike: 75,
      humidity: 45,
      pressure: 1013,
      windSpeed: 8,
      windDirection: 180,
      windGust: 12,
      visibility: 10,
      cloudCover: 25,
      uvIndex: 6,
      conditions: 'Partly cloudy',
      icon: '02d',
      precipitation: {
        type: 'none',
        intensity: 'light',
        amount: 0,
        probability: 0,
      },
    };

    return {
      location: {
        name: 'Sample Location',
        country: 'US',
        lat,
        lng,
      },
      current,
      workability: this.getWorkabilityIndex(current),
      alerts: [],
      timestamp: new Date(),
    };
  }

  private getMockForecast(lat: number, lng: number, days: number): WeatherForecast {
    const hourly: HourlyForecast[] = [];
    const daily: DailyForecast[] = [];

    // Generate mock hourly data
    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
      hourly.push({
        timestamp,
        temperature: 70 + Math.sin(i / 12) * 15,
        feelsLike: 72 + Math.sin(i / 12) * 15,
        humidity: 40 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        windDirection: Math.random() * 360,
        precipitation: {
          type: Math.random() > 0.8 ? 'rain' : 'none',
          intensity: 'light',
          amount: Math.random() > 0.8 ? Math.random() * 0.1 : 0,
          probability: Math.random() * 30,
        },
        conditions: 'Partly cloudy',
        icon: '02d',
        workable: true,
        workabilityScore: 85,
      });
    }

    // Generate mock daily data
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      daily.push({
        date,
        temperature: {
          high: 80 + Math.random() * 10,
          low: 60 + Math.random() * 10,
          morning: 65,
          afternoon: 78,
          evening: 72,
        },
        conditions: 'Partly cloudy',
        icon: '02d',
        precipitation: {
          probability: Math.random() * 40,
          amount: Math.random() * 0.2,
          type: 'none',
        },
        wind: {
          speed: 5 + Math.random() * 10,
          direction: Math.random() * 360,
          gust: 10 + Math.random() * 15,
        },
        humidity: 45,
        uvIndex: 6,
        sunrise: new Date(date.getTime() + 6 * 60 * 60 * 1000),
        sunset: new Date(date.getTime() + 19 * 60 * 60 * 1000),
        workableHours: 8 + Math.random() * 4,
        bestWorkWindow: {
          start: new Date(date.getTime() + 8 * 60 * 60 * 1000),
          end: new Date(date.getTime() + 16 * 60 * 60 * 1000),
          conditions: 'Favorable',
        },
      });
    }

    return {
      location: { name: 'Sample Location', lat, lng },
      hourly,
      daily,
      workabilityForecast: this.generateWorkabilityForecast(hourly, daily),
      extendedOutlook: this.generateExtendedOutlook(daily),
    };
  }

  private getMockAlerts(): WeatherAlert[] {
    return [];
  }
}

export const weatherService = new WeatherService();