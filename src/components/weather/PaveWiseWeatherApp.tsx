import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  suitability: WorkSuitability;
}

interface WeatherForecast {
  date: string;
  temperature: { min: number; max: number; };
  condition: string;
  humidity: number;
  suitability: 'optimal' | 'good' | 'fair' | 'poor' | 'unsafe';
}

interface WeatherAlert {
  id: string;
  type: 'severe_weather' | 'temperature_warning' | 'extreme_temperature' | 'wind_advisory';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
}

interface WorkSuitability {
  overall: 'optimal' | 'good' | 'fair' | 'poor' | 'unsafe';
  asphaltPaving: 'optimal' | 'good' | 'fair' | 'poor' | 'unsafe';
  sealcoating: 'optimal' | 'good' | 'fair' | 'poor' | 'unsafe';
  lineStriping: 'optimal' | 'good' | 'fair' | 'poor' | 'unsafe';
  recommendations: string[];
  restrictions: string[];
}

export function PaveWiseWeatherApp() {
  const [weatherData] = useState<WeatherData>({
    temperature: 72,
    humidity: 45,
    windSpeed: 8,
    visibility: 10,
    condition: 'sunny',
    forecast: [
      { date: 'Today', temperature: { min: 58, max: 75 }, condition: 'Sunny', humidity: 45, suitability: 'optimal' },
      { date: 'Tomorrow', temperature: { min: 62, max: 78 }, condition: 'Partly Cloudy', humidity: 55, suitability: 'good' },
      { date: 'Wednesday', temperature: { min: 65, max: 80 }, condition: 'Clear', humidity: 40, suitability: 'optimal' },
      { date: 'Thursday', temperature: { min: 68, max: 82 }, condition: 'Sunny', humidity: 35, suitability: 'optimal' },
      { date: 'Friday', temperature: { min: 70, max: 85 }, condition: 'Hot', humidity: 30, suitability: 'good' },
    ],
    alerts: [
      {
        id: '1',
        type: 'temperature_warning',
        message: 'Optimal temperature conditions for asphalt paving operations',
        severity: 'low',
        active: true,
      },
    ],
    suitability: {
      overall: 'optimal',
      asphaltPaving: 'optimal',
      sealcoating: 'optimal',
      lineStriping: 'good',
      recommendations: [
        'Excellent conditions for asphalt paving - temperature range 58-75°F',
        'Perfect humidity levels (45%) for sealcoating applications',
        'Light winds ideal for line striping operations',
        'Extended working hours possible with current conditions',
      ],
      restrictions: [
        'Monitor temperature if it exceeds 85°F for crew safety',
      ],
    },
  });

  const [location] = useState({
    name: 'Richmond, VA',
    coords: { lat: 37.5407, lng: -77.4360 },
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': case 'clear': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': case 'partly cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'snowy': return <Snowflake className="h-6 w-6 text-blue-300" />;
      case 'windy': return <Wind className="h-6 w-6 text-gray-600" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'unsafe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-card border-gray-200';
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case 'optimal': case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'fair': return <Clock className="h-4 w-4" />;
      case 'poor': case 'unsafe': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {getWeatherIcon(weatherData.condition)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">PaveWise Weather</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location.name}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={getSuitabilityColor(weatherData.suitability.overall)}>
          {weatherData.suitability.overall.toUpperCase()} CONDITIONS
        </Badge>
      </div>

      {/* Current Conditions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.temperature}°F</div>
            <p className="text-xs text-muted-foreground">
              Range: {weatherData.forecast[0]?.temperature?.min || 0}°F - {weatherData.forecast[0]?.temperature?.max || 0}°F
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.humidity}%</div>
            <Progress value={weatherData.humidity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.windSpeed} mph</div>
            <p className="text-xs text-muted-foreground">Light breeze</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibility</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.visibility} mi</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Suitability */}
      <Card>
        <CardHeader>
          <CardTitle>Work Suitability Assessment</CardTitle>
          <CardDescription>Current conditions for pavement operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Asphalt Paving</span>
                <Badge variant="outline" className={getSuitabilityColor(weatherData.suitability.asphaltPaving)}>
                  <div className="flex items-center gap-1">
                    {getSuitabilityIcon(weatherData.suitability.asphaltPaving)}
                    {weatherData.suitability.asphaltPaving.toUpperCase()}
                  </div>
                </Badge>
              </div>
              <Progress
                value={weatherData.suitability.asphaltPaving === 'optimal' ? 100
                  : weatherData.suitability.asphaltPaving === 'good' ? 80
                    : weatherData.suitability.asphaltPaving === 'fair' ? 60 : 40}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sealcoating</span>
                <Badge variant="outline" className={getSuitabilityColor(weatherData.suitability.sealcoating)}>
                  <div className="flex items-center gap-1">
                    {getSuitabilityIcon(weatherData.suitability.sealcoating)}
                    {weatherData.suitability.sealcoating.toUpperCase()}
                  </div>
                </Badge>
              </div>
              <Progress
                value={weatherData.suitability.sealcoating === 'optimal' ? 100
                  : weatherData.suitability.sealcoating === 'good' ? 80
                    : weatherData.suitability.sealcoating === 'fair' ? 60 : 40}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Line Striping</span>
                <Badge variant="outline" className={getSuitabilityColor(weatherData.suitability.lineStriping)}>
                  <div className="flex items-center gap-1">
                    {getSuitabilityIcon(weatherData.suitability.lineStriping)}
                    {weatherData.suitability.lineStriping.toUpperCase()}
                  </div>
                </Badge>
              </div>
              <Progress
                value={weatherData.suitability.lineStriping === 'optimal' ? 100
                  : weatherData.suitability.lineStriping === 'good' ? 80
                    : weatherData.suitability.lineStriping === 'fair' ? 60 : 40}
                className="h-2"
              />
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Recommendations</h4>
              <div className="space-y-2">
                {weatherData.suitability.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {weatherData.suitability.restrictions.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Precautions</h4>
                <div className="space-y-2">
                  {weatherData.suitability.restrictions.map((restriction, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{restriction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>5-Day Forecast</CardTitle>
          <CardDescription>Extended weather outlook for project planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="font-medium">{day.date}</div>
                <div className="flex justify-center">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="text-sm text-muted-foreground">{day.condition}</div>
                <div className="text-xs">
                  <div className="font-medium">{day.temperature.max}°F</div>
                  <div className="text-muted-foreground">{day.temperature.min}°F</div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getSuitabilityColor(day.suitability)}`}
                >
                  {day.suitability.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weather Alerts</CardTitle>
            <CardDescription>Current weather advisories and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500'
                      : alert.severity === 'high' ? 'text-orange-500'
                        : alert.severity === 'medium' ? 'text-yellow-500'
                          : 'text-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Weather-Based Actions</CardTitle>
          <CardDescription>Recommended actions based on current conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Schedule Paving
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Plan Sealcoating
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Monitor Conditions
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Location Forecast
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}