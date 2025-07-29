import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  MapPin,
  Clock,
  Thermometer,
  Wind,
  CloudRain,
  Sun,
  Camera,
  Mic,
  FileText,
  Users,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Navigation,
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  visibility: number;
}

interface FieldTask {
  id: string;
  title: string;
  type: 'inspection' | 'measurement' | 'photo' | 'report';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  dueTime?: string;
}

interface MobileFieldInterfaceProps {
  className?: string;
}

export function MobileFieldInterface({ className = '' }: MobileFieldInterfaceProps) {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(0);

  useEffect(() => {
    loadFieldData();
    getCurrentLocation();
    loadWeatherData();

    // Setup online/offline detection
    const handleOnline = () => { setIsOnline(true); };
    const handleOffline = () => { setIsOnline(false); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadFieldData = () => {
    const mockTasks: FieldTask[] = [
      {
        id: '1',
        title: 'Pre-pave Inspection',
        type: 'inspection',
        status: 'pending',
        priority: 'high',
        location: 'Church Parking Lot - Section A',
        dueTime: '09:00 AM',
      },
      {
        id: '2',
        title: 'Surface Temperature Check',
        type: 'measurement',
        status: 'in_progress',
        priority: 'medium',
        location: 'Church Parking Lot - Section B',
        dueTime: '09:30 AM',
      },
      {
        id: '3',
        title: 'Progress Photos',
        type: 'photo',
        status: 'pending',
        priority: 'medium',
        location: 'Church Parking Lot - Overall',
        dueTime: '10:00 AM',
      },
      {
        id: '4',
        title: 'Quality Report',
        type: 'report',
        status: 'pending',
        priority: 'low',
        location: 'Church Parking Lot - Final',
        dueTime: '04:00 PM',
      },
    ];
    setTasks(mockTasks);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location Error',
        description: 'Geolocation is not supported by this device',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Location Error',
          description: 'Unable to get current location',
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const loadWeatherData = () => {
    // Mock weather data - in production would fetch from weather API
    setWeather({
      temperature: 72,
      humidity: 65,
      windSpeed: 8,
      conditions: 'Partly Cloudy',
      visibility: 10,
    });
  };

  const updateTaskStatus = (taskId: string, status: FieldTask['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status } : task,
    ));

    if (!isOnline) {
      setSyncPending(prev => prev + 1);
      toast({
        title: 'Offline Mode',
        description: 'Changes will sync when connection is restored',
      });
    } else {
      toast({
        title: 'Task Updated',
        description: 'Task status has been updated',
      });
    }
  };

  const capturePhoto = async (taskId: string) => {
    try {
      // In a real mobile app, this would use Capacitor Camera API
      toast({
        title: 'Camera',
        description: 'Photo capture would open camera on mobile device',
      });
      updateTaskStatus(taskId, 'completed');
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera',
        variant: 'destructive',
      });
    }
  };

  const recordMeasurement = (taskId: string) => {
    // Mock measurement recording
    toast({
      title: 'Measurement Recorded',
      description: 'Temperature: 145°F - Within acceptable range',
    });
    updateTaskStatus(taskId, 'completed');
  };

  const getTaskIcon = (type: FieldTask['type']) => {
    switch (type) {
      case 'inspection': return <CheckCircle className="h-5 w-5" />;
      case 'measurement': return <Thermometer className="h-5 w-5" />;
      case 'photo': return <Camera className="h-5 w-5" />;
      case 'report': return <FileText className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: FieldTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: FieldTask['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className={`space-y-4 p-4 max-w-md mx-auto ${className}`}>
      {/* Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Field Operations</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="default" className="bg-green-500">Online</Badge>
              ) : (
                <Badge variant="destructive">Offline</Badge>
              )}
              {syncPending > 0 && (
                <Badge variant="secondary">{syncPending} pending</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location */}
          {location && (
            <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-sm">
                <div className="font-medium">Current Location</div>
                <div className="text-muted-foreground">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </div>
              </div>
            </div>
          )}

          {/* Weather */}
          {weather && (
            <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
              <Sun className="h-4 w-4 text-primary" />
              <div className="text-sm flex-1">
                <div className="font-medium">{weather.conditions}</div>
                <div className="text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {weather.temperature}°F
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {weather.windSpeed} mph
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 border rounded-lg space-y-3 touch-friendly"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className={getPriorityColor(task.priority)}>
                    {getTaskIcon(task.type)}
                  </span>
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.location}</p>
                    {task.dueTime && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Due: {task.dueTime}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(task.status)}
              </div>

              {/* Task Actions */}
              {task.status !== 'completed' && (
                <div className="flex gap-2">
                  {task.type === 'photo' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => capturePhoto(task.id)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Camera className="h-3 w-3" />
                      Take Photo
                    </Button>
                  )}
                  {task.type === 'measurement' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { recordMeasurement(task.id); }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Thermometer className="h-3 w-3" />
                      Record
                    </Button>
                  )}
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => { updateTaskStatus(task.id, 'in_progress'); }}
                      className="text-xs"
                    >
                      Start Task
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { updateTaskStatus(task.id, 'completed'); }}
                      className="text-xs"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => toast({ title: 'Emergency', description: 'Emergency contact initiated' })}
            >
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span className="text-xs">Emergency</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={getCurrentLocation}
            >
              <Navigation className="h-6 w-6 text-blue-500" />
              <span className="text-xs">Update Location</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => toast({ title: 'Team', description: 'Team communication opened' })}
            >
              <Users className="h-6 w-6 text-green-500" />
              <span className="text-xs">Team Chat</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => toast({ title: 'Equipment', description: 'Equipment status checked' })}
            >
              <Truck className="h-6 w-6 text-orange-500" />
              <span className="text-xs">Equipment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}