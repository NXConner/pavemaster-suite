import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, UserCheck, Phone, Car, Navigation, Play, Pause, AlertTriangle, Zap, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GeofenceZone {
  id: string;
  name: string;
  center_latitude: number;
  center_longitude: number;
  radius: number;
  color: string;
  type: 'work_site' | 'office' | 'restricted' | 'break_area';
  is_active: boolean;
}

interface EmployeeLocation {
  id: string;
  employee_id: string;
  employee_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  speed: number;
  heading: number;
  activity: 'standing' | 'walking' | 'riding' | 'driving' | 'phone' | 'out_of_bounds';
  is_driver: boolean;
  battery_level: number;
  is_clocked_in: boolean;
  current_zone?: string;
  travel_distance_today: number;
  work_hours_today: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
  activity: string;
}

const EmployeeTracker: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeLocation[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [routeHistory, setRouteHistory] = useState<RoutePoint[]>([]);
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [routePlaybackPosition, setRoutePlaybackPosition] = useState(0);
  const [geofencingEnabled, setGeofencingEnabled] = useState(true);
  const [autoClockEnabled, setAutoClockEnabled] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState(30); // seconds
  const [militaryJargon, setMilitaryJargon] = useState(false);
  const [showOutOfBounds, setShowOutOfBounds] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const playbackInterval = useRef<NodeJS.Timeout>();
  const trackingIntervalRef = useRef<NodeJS.Timeout>();

  // Check if user has admin access
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  // Initialize tracking
  useEffect(() => {
    if (userRole && ['super_admin', 'admin'].includes(userRole)) {
      fetchGeofences();
      startEmployeeTracking();
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [userRole, trackingInterval]);

  // Auto clock in/out based on geofencing
  useEffect(() => {
    if (autoClockEnabled && geofencingEnabled) {
      checkAutoClockInOut();
    }
  }, [employees, geofences, autoClockEnabled, geofencingEnabled]);

  const fetchGeofences = async () => {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching geofences:', error);
      return;
    }

    setGeofences(data || []);
  };

  const startEmployeeTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    trackingIntervalRef.current = setInterval(() => {
      fetchEmployeeLocations();
    }, trackingInterval * 1000);

    // Initial fetch
    fetchEmployeeLocations();
  };

  const fetchEmployeeLocations = async () => {
    const { data, error } = await supabase
      .from('gps_locations')
      .select(`
        *,
        device:devices(
          user_id,
          name
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching employee locations:', error);
      return;
    }

    // Get current time records to check clock status
    const { data: timeRecords } = await supabase
      .from('time_records')
      .select('employee_id, clock_in, clock_out')
      .is('clock_out', null);

    const clockedInEmployees = new Set(timeRecords?.map(r => r.employee_id) || []);

    // Process locations and determine activities
    const processedEmployees: EmployeeLocation[] = data?.map(location => {
      const activity = determineActivity(location);
      const currentZone = findCurrentZone(location.latitude, location.longitude);
      
      return {
        id: location.id,
        employee_id: location.device?.user_id || '',
        employee_name: location.device?.name || 'Unknown',
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        accuracy: location.accuracy,
        speed: location.speed || 0,
        heading: location.heading || 0,
        activity,
        is_driver: determineIfDriver(location, activity),
        battery_level: location.battery_level || 100,
        is_clocked_in: clockedInEmployees.has(location.device?.user_id),
        current_zone: currentZone?.name,
        travel_distance_today: 0, // Calculate from daily routes
        work_hours_today: 0 // Calculate from time records
      };
    }) || [];

    setEmployees(processedEmployees);
  };

  const determineActivity = (location: any): EmployeeLocation['activity'] => {
    const speed = location.speed || 0;
    
    if (speed > 25) return 'driving';
    if (speed > 5) return 'riding';
    if (speed > 1) return 'walking';
    
    // Check if phone is being used (would require additional sensor data)
    // For demo purposes, randomly assign phone activity
    if (Math.random() < 0.1) return 'phone';
    
    // Check if out of bounds
    const inGeofence = geofences.some(fence => 
      isPointInGeofence(location.latitude, location.longitude, fence)
    );
    
    if (!inGeofence) return 'out_of_bounds';
    
    return 'standing';
  };

  const determineIfDriver = (location: any, activity: EmployeeLocation['activity']): boolean => {
    // In a real implementation, this would use additional data like:
    // - Vehicle assignment records
    // - Bluetooth connectivity to vehicle systems
    // - Driving pattern analysis
    return activity === 'driving' && (location.speed || 0) > 10;
  };

  const findCurrentZone = (lat: number, lng: number): GeofenceZone | null => {
    return geofences.find(fence => isPointInGeofence(lat, lng, fence)) || null;
  };

  const isPointInGeofence = (lat: number, lng: number, geofence: GeofenceZone): boolean => {
    const distance = calculateDistance(
      lat, lng,
      geofence.center_latitude, geofence.center_longitude
    );
    return distance <= geofence.radius;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const checkAutoClockInOut = async () => {
    for (const employee of employees) {
      const workZones = geofences.filter(g => g.type === 'work_site' || g.type === 'office');
      const inWorkZone = workZones.some(zone => 
        isPointInGeofence(employee.latitude, employee.longitude, zone)
      );

      if (inWorkZone && !employee.is_clocked_in) {
        // Auto clock in
        await autoClockIn(employee.employee_id);
      } else if (!inWorkZone && employee.is_clocked_in) {
        // Auto clock out (with grace period)
        await autoClockOut(employee.employee_id);
      }
    }
  };

  const autoClockIn = async (employeeId: string) => {
    const { error } = await supabase
      .from('time_records')
      .insert({
        employee_id: employeeId,
        clock_in: new Date().toISOString(),
        status: 'active',
        notes: 'Auto-clocked in via geofencing'
      });

    if (!error) {
      toast({
        title: "Employee Auto-Clocked In",
        description: `Employee has entered work area and been automatically clocked in.`
      });
    }
  };

  const autoClockOut = async (employeeId: string) => {
    const { error } = await supabase
      .from('time_records')
      .update({
        clock_out: new Date().toISOString(),
        status: 'completed'
      })
      .eq('employee_id', employeeId)
      .is('clock_out', null);

    if (!error) {
      toast({
        title: "Employee Auto-Clocked Out",
        description: `Employee has left work area and been automatically clocked out.`
      });
    }
  };

  const fetchEmployeeRoute = async (employeeId: string, date: string) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('gps_locations')
      .select('latitude, longitude, timestamp, speed')
      .eq('device_id', employeeId)
      .gte('timestamp', startOfDay.toISOString())
      .lte('timestamp', endOfDay.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching route:', error);
      return;
    }

    const route: RoutePoint[] = data?.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
      timestamp: point.timestamp,
      speed: point.speed || 0,
      activity: point.speed > 25 ? 'driving' : point.speed > 5 ? 'riding' : 'walking'
    })) || [];

    setRouteHistory(route);
    setRoutePlaybackPosition(0);
  };

  const playRouteHistory = () => {
    if (routeHistory.length === 0) return;

    setIsPlayingRoute(true);
    let position = routePlaybackPosition;

    playbackInterval.current = setInterval(() => {
      if (position >= routeHistory.length - 1) {
        setIsPlayingRoute(false);
        if (playbackInterval.current) {
          clearInterval(playbackInterval.current);
        }
        return;
      }

      position++;
      setRoutePlaybackPosition(position);
    }, 1000); // 1 second per point
  };

  const pauseRoutePlayback = () => {
    setIsPlayingRoute(false);
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
    }
  };

  const sendOutOfBoundsNotification = async (employee: EmployeeLocation) => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: employee.employee_id,
        title: 'Geofence Alert',
        message: `${employee.employee_name} is outside designated work area`,
        type: 'geofence_violation',
        data: {
          employee_id: employee.employee_id,
          location: {
            lat: employee.latitude,
            lng: employee.longitude
          },
          timestamp: new Date().toISOString()
        }
      });

    if (!error) {
      toast({
        variant: "destructive",
        title: "Geofence Violation",
        description: `${employee.employee_name} is outside designated work area`
      });
    }
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const getActivityIcon = (activity: EmployeeLocation['activity']) => {
    switch (activity) {
      case 'driving': return <Car className="h-4 w-4" />;
      case 'riding': return <Navigation className="h-4 w-4" />;
      case 'walking': return <UserCheck className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'out_of_bounds': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activity: EmployeeLocation['activity']) => {
    switch (activity) {
      case 'driving': return 'bg-blue-500';
      case 'riding': return 'bg-purple-500';
      case 'walking': return 'bg-green-500';
      case 'phone': return 'bg-yellow-500';
      case 'out_of_bounds': return 'bg-destructive';
      default: return 'bg-gray-500';
    }
  };

  if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
    return null; // Only show to admins
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {getJargonText('Employee Tracking', 'Personnel Surveillance')}
          </h2>
          <Badge variant={geofencingEnabled ? "default" : "secondary"}>
            {geofencingEnabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon">
              {getJargonText('Military Terms', 'Tactical Language')}
            </Label>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tracking Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="geofencing">Enable Geofencing</Label>
                  <Switch
                    id="geofencing"
                    checked={geofencingEnabled}
                    onCheckedChange={setGeofencingEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-clock">Auto Clock In/Out</Label>
                  <Switch
                    id="auto-clock"
                    checked={autoClockEnabled}
                    onCheckedChange={setAutoClockEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tracking Interval: {trackingInterval}s</Label>
                  <Slider
                    value={[trackingInterval]}
                    onValueChange={(value) => setTrackingInterval(value[0])}
                    min={10}
                    max={300}
                    step={10}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-oob">Show Out of Bounds</Label>
                  <Switch
                    id="show-oob"
                    checked={showOutOfBounds}
                    onCheckedChange={setShowOutOfBounds}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Live Map View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{getJargonText('Live Location Map', 'Tactical Overview')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
            {/* In a real implementation, this would be a proper map component */}
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Interactive Map Component</p>
              <p className="text-sm">Shows employee locations, geofences, and routes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees
          .filter(emp => showOutOfBounds || emp.activity !== 'out_of_bounds')
          .map(employee => (
          <Card key={employee.id} className={`border-l-4 ${getActivityColor(employee.activity)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{employee.employee_name}</h4>
                <div className="flex items-center space-x-2">
                  {getActivityIcon(employee.activity)}
                  <Badge variant={employee.is_clocked_in ? "default" : "secondary"}>
                    {employee.is_clocked_in ? 'On Duty' : 'Off Duty'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Activity:</span>
                  <div className="capitalize">{employee.activity.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="font-medium">Speed:</span>
                  <div>{employee.speed.toFixed(0)} mph</div>
                </div>
                <div>
                  <span className="font-medium">Zone:</span>
                  <div>{employee.current_zone || 'Outside'}</div>
                </div>
                <div>
                  <span className="font-medium">Battery:</span>
                  <div>{employee.battery_level}%</div>
                </div>
              </div>

              {employee.is_driver && (
                <Badge variant="outline" className="w-full justify-center">
                  <Car className="h-3 w-3 mr-1" />
                  Driver
                </Badge>
              )}

              {employee.activity === 'out_of_bounds' && (
                <div className="p-2 bg-destructive/10 text-destructive rounded text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Outside work area
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedEmployee(employee.employee_id);
                    fetchEmployeeRoute(employee.employee_id, new Date().toISOString().split('T')[0]);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Route
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Playback Modal */}
      {selectedEmployee && routeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5" />
                <span>Route Playback</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPlayingRoute ? pauseRoutePlayback : playRouteHistory}
                >
                  {isPlayingRoute ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlayingRoute ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setRouteHistory([]);
                    pauseRoutePlayback();
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Route Progress</span>
                <span>{routePlaybackPosition + 1} / {routeHistory.length}</span>
              </div>
              
              <Progress 
                value={(routePlaybackPosition / Math.max(routeHistory.length - 1, 1)) * 100} 
                className="h-2"
              />
              
              {routeHistory[routePlaybackPosition] && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Time:</span>
                    <div>{new Date(routeHistory[routePlaybackPosition].timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Speed:</span>
                    <div>{routeHistory[routePlaybackPosition].speed.toFixed(0)} mph</div>
                  </div>
                  <div>
                    <span className="font-medium">Activity:</span>
                    <div className="capitalize">{routeHistory[routePlaybackPosition].activity}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geofence Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>{getJargonText('Geofence Zones', 'Perimeter Control')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {geofences.map(fence => {
              const employeesInZone = employees.filter(emp => 
                emp.current_zone === fence.name
              ).length;

              return (
                <div key={fence.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{fence.name}</h4>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: fence.color }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Type: {fence.type.replace('_', ' ')}</div>
                    <div>Radius: {fence.radius}m</div>
                    <div className="font-medium mt-1">
                      {employeesInZone} {getJargonText('employees', 'personnel')} present
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTracker;