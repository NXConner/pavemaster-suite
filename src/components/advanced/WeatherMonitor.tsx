import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Cloud, Sun, CloudRain, Thermometer, Wind, Droplets, Eye, RefreshCw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  conditions: string;
  asphaltTemp: number;
  recommendation: string;
  workWindow: string;
}

export default function WeatherMonitor() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    conditions: 'partly-cloudy',
    asphaltTemp: 85,
    recommendation: 'Optimal conditions for asphalt work',
    workWindow: '6 hours remaining'
  });
  const [loading, setLoading] = useState(false);

  const refreshWeather = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeather({
        ...weather,
        temperature: Math.floor(Math.random() * 30) + 60,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 15) + 5,
        asphaltTemp: Math.floor(Math.random() * 40) + 70
      });
      setLoading(false);
    }, 1000);
  };

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      default: return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Optimal')) return 'bg-green-500';
    if (recommendation.includes('Caution')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weather Monitor</h1>
          <p className="text-muted-foreground">Real-time weather conditions for asphalt operations</p>
        </div>
        <Button onClick={refreshWeather} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Current Conditions */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Current Conditions</CardTitle>
              <CardDescription>Real-time weather data</CardDescription>
            </div>
            {getWeatherIcon(weather.conditions)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{weather.temperature}°F</p>
                <p className="text-sm text-muted-foreground">Air Temperature</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{weather.humidity}%</p>
                <p className="text-sm text-muted-foreground">Humidity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Wind className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{weather.windSpeed} mph</p>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{weather.visibility} mi</p>
                <p className="text-sm text-muted-foreground">Visibility</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asphalt Conditions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asphalt Temperature</CardTitle>
            <CardDescription>Surface temperature for optimal application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{weather.asphaltTemp}°F</span>
                <Badge className={weather.asphaltTemp >= 80 && weather.asphaltTemp <= 100 ? 'bg-green-500' : 'bg-yellow-500'}>
                  {weather.asphaltTemp >= 80 && weather.asphaltTemp <= 100 ? 'Optimal' : 'Monitor'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Minimum (80°F)</span>
                  <span>Maximum (100°F)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.max(0, (weather.asphaltTemp - 60) / 60 * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Recommendations</CardTitle>
            <CardDescription>AI-powered scheduling guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getRecommendationColor(weather.recommendation)}`} />
                <span className="font-medium">{weather.recommendation}</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Optimal Work Window: {weather.workWindow}
                </p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Temperature range: Excellent for asphalt laying</p>
                <p>• Humidity levels: Within acceptable range</p>
                <p>• Wind conditions: Minimal impact on operations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Impact Analysis</CardTitle>
          <CardDescription>How current conditions affect planned work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600">Morning Window</h4>
              <p className="text-sm text-muted-foreground">6:00 AM - 10:00 AM</p>
              <Badge className="mt-2 bg-green-500">Optimal</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-yellow-600">Afternoon Window</h4>
              <p className="text-sm text-muted-foreground">10:00 AM - 4:00 PM</p>
              <Badge className="mt-2 bg-yellow-500">Caution - Hot</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-red-600">Evening Window</h4>
              <p className="text-sm text-muted-foreground">4:00 PM - 8:00 PM</p>
              <Badge className="mt-2 bg-red-500">Not Recommended</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}