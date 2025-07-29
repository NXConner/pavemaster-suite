import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Monitor, Grid, Settings, Plus, Maximize2, Minimize2, X, Move, Eye, 
  MapPin, Users, DollarSign, Clock, Car, AlertTriangle, TrendingUp,
  Activity, Shield, Radio, Satellite, Command, Zap, Target, Navigation,
  Crosshair, Radar, Globe, FileText, Camera, Phone, MessageSquare,
  BarChart3, PieChart, LineChart, Video, Mic, Database, Server,
  Lock, Key, Bell, Calendar, Timer, Gauge, ThermometerSun, Battery,
  Wifi, Signal, Bluetooth, Cpu, HardDrive, MemoryStick, Power
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
  isMinimized: boolean;
  isFullscreen: boolean;
  category: 'surveillance' | 'operations' | 'analytics' | 'communications' | 'security' | 'resources';
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  gridSize: { cols: number; rows: number };
  theme: 'dark' | 'light' | 'tactical';
}

interface EmployeeData {
  id: string;
  name: string;
  status: string;
  location: { lat: number; lng: number };
  activity: string;
}

interface VehicleData {
  id: string;
  type: string;
  status: string;
  location: { lat: number; lng: number };
  fuel: number;
}

interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertData {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
}

interface CostData {
  daily: number;
  weekly: number;
  monthly: number;
  budget: number;
  variance: number;
}

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  forecast: string;
}

interface CommunicationData {
  id: string;
  channel: string;
  status: string;
  participants: number;
  activity: string;
}

interface SecurityData {
  level: string;
  incidents: number;
  alerts: number;
  status: string;
}

interface SystemData {
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
  connections: number;
}

interface LiveData {
  employees: EmployeeData[];
  vehicles: VehicleData[];
  projects: ProjectData[];
  alerts: AlertData[];
  costs: CostData;
  weather: WeatherData;
  communications: CommunicationData[];
  security: SecurityData;
  system: SystemData;
}

const WIDGET_TYPES = {
  // Surveillance & Tracking
  live_map: { icon: MapPin, title: 'Live Tactical Map', category: 'surveillance' },
  employee_tracker: { icon: Users, title: 'Personnel Tracker', category: 'surveillance' },
  vehicle_tracker: { icon: Car, title: 'Vehicle Fleet Tracker', category: 'surveillance' },
  geofence_monitor: { icon: Radar, title: 'Perimeter Monitor', category: 'surveillance' },
  route_playback: { icon: Navigation, title: 'Route Playback', category: 'surveillance' },
  thermal_overlay: { icon: ThermometerSun, title: 'Thermal Overlay', category: 'surveillance' },
  
  // Operations & Analytics
  cost_counter: { icon: DollarSign, title: 'Cost Operations Center', category: 'operations' },
  time_tracker: { icon: Clock, title: 'Time Tracking Hub', category: 'operations' },
  project_overview: { icon: Target, title: 'Mission Overview', category: 'operations' },
  task_priorities: { icon: Command, title: 'Task Command', category: 'operations' },
  resource_allocation: { icon: Database, title: 'Resource Management', category: 'operations' },
  equipment_status: { icon: Server, title: 'Equipment Status', category: 'operations' },
  
  // Analytics & Intelligence
  performance_metrics: { icon: BarChart3, title: 'Performance Intel', category: 'analytics' },
  predictive_analytics: { icon: TrendingUp, title: 'Predictive Analysis', category: 'analytics' },
  cost_analytics: { icon: PieChart, title: 'Financial Intelligence', category: 'analytics' },
  efficiency_monitor: { icon: Gauge, title: 'Efficiency Monitor', category: 'analytics' },
  trend_analysis: { icon: LineChart, title: 'Trend Analysis', category: 'analytics' },
  kpi_dashboard: { icon: Activity, title: 'KPI Command Center', category: 'analytics' },
  
  // Communications
  comms_center: { icon: MessageSquare, title: 'Communications Hub', category: 'communications' },
  alert_system: { icon: Bell, title: 'Alert Command', category: 'communications' },
  notification_center: { icon: Radio, title: 'Notification Center', category: 'communications' },
  emergency_comms: { icon: Phone, title: 'Emergency Comms', category: 'communications' },
  video_feed: { icon: Video, title: 'Video Surveillance', category: 'communications' },
  audio_monitor: { icon: Mic, title: 'Audio Monitor', category: 'communications' },
  
  // Security & Compliance
  security_monitor: { icon: Shield, title: 'Security Command', category: 'security' },
  access_control: { icon: Lock, title: 'Access Control', category: 'security' },
  compliance_tracker: { icon: Key, title: 'Compliance Monitor', category: 'security' },
  threat_detection: { icon: Crosshair, title: 'Threat Detection', category: 'security' },
  audit_log: { icon: FileText, title: 'Audit Intelligence', category: 'security' },
  incident_tracker: { icon: AlertTriangle, title: 'Incident Command', category: 'security' },
  
  // System Resources
  system_monitor: { icon: Cpu, title: 'System Monitor', category: 'resources' },
  network_status: { icon: Wifi, title: 'Network Status', category: 'resources' },
  device_health: { icon: Battery, title: 'Device Health', category: 'resources' },
  signal_strength: { icon: Signal, title: 'Signal Monitor', category: 'resources' },
  bandwidth_monitor: { icon: Satellite, title: 'Bandwidth Monitor', category: 'resources' },
  power_management: { icon: Power, title: 'Power Management', category: 'resources' }
};

const OverWatchTOSS: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>({
    id: 'default',
    name: 'Default Tactical Layout',
    widgets: [],
    gridSize: { cols: 12, rows: 8 },
    theme: 'tactical'
  });
  const [savedLayouts, setSavedLayouts] = useState<DashboardLayout[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [liveData, setLiveData] = useState<LiveData>({
    employees: [],
    vehicles: [],
    projects: [],
    alerts: [],
    costs: {},
    weather: {},
    communications: [],
    security: {},
    system: {}
  });
  const [militaryJargon, setMilitaryJargon] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15); // seconds
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const gridRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Check admin access
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

  // Initialize dashboard
  useEffect(() => {
    if (userRole && ['super_admin', 'admin'].includes(userRole)) {
      loadSavedLayouts();
      loadDefaultLayout();
      startDataRefresh();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [userRole, loadSavedLayouts, loadDefaultLayout, startDataRefresh]);

  // Auto refresh data
  useEffect(() => {
    if (autoRefresh) {
      startDataRefresh();
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [autoRefresh, refreshInterval, startDataRefresh]);

  const startDataRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      fetchLiveData();
    }, refreshInterval * 1000);

    // Initial fetch
    fetchLiveData();
  }, [refreshInterval]);

  const fetchLiveData = async () => {
    try {
      const [
        employeesData,
        vehiclesData,
        projectsData,
        alertsData,
        costsData,
        communicationsData,
        securityData,
        systemData
      ] = await Promise.all([
        fetchEmployees(),
        fetchVehicles(),
        fetchProjects(),
        fetchAlerts(),
        fetchCosts(),
        fetchCommunications(),
        fetchSecurity(),
        fetchSystemData()
      ]);

      setLiveData({
        employees: employeesData || [],
        vehicles: vehiclesData || [],
        projects: projectsData || [],
        alerts: alertsData || [],
        costs: costsData || {},
        weather: await fetchWeather(),
        communications: communicationsData || [],
        security: securityData || {},
        system: systemData || {}
      });
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('time_records')
      .select(`
        *,
        employee:employees(*)
      `)
      .is('clock_out', null);
    return data;
  };

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from('fleet_vehicles')
      .select('*');
    return data;
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['active', 'in_progress']);
    return data;
  };

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(50);
    return data;
  };

  const fetchCosts = async () => {
    // Aggregate cost data
    const today = new Date().toISOString().split('T')[0];
    const { data: timeRecords } = await supabase
      .from('time_records')
      .select('*')
      .gte('clock_in', today);
    
    const { data: receipts } = await supabase
      .from('receipts')
      .select('*')
      .gte('created_at', today);

    return {
      labor: timeRecords?.reduce((sum, record) => sum + (record.total_hours * 25), 0) || 0,
      materials: receipts?.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0
    };
  };

  const fetchCommunications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    return data;
  };

  const fetchSecurity = async () => {
    const { data: violations } = await supabase
      .from('employee_violations')
      .select('*')
      .eq('resolved', false);

    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      violations: violations?.length || 0,
      events: events || []
    };
  };

  const fetchSystemData = async () => {
    // Mock system data - in production, this would come from monitoring services
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
      uptime: '72h 15m',
      connections: Math.floor(Math.random() * 100) + 50
    };
  };

  const fetchWeather = async () => {
    // Mock weather data - in production, integrate with weather API
    return {
      temperature: Math.floor(Math.random() * 30) + 60,
      condition: 'Partly Cloudy',
      humidity: Math.floor(Math.random() * 40) + 40,
      wind: Math.floor(Math.random() * 15) + 5
    };
  };

  const loadSavedLayouts = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_configs')
      .select('*')
      .eq('name', 'overwatch_layouts')
      .eq('created_by', user?.id);

    if (error) {
      console.error('Error loading layouts:', error);
      return;
    }

    if (data && data.length > 0) {
      setSavedLayouts(data[0].value as DashboardLayout[]);
    }
  }, [user?.id]);

  const loadDefaultLayout = useCallback(() => {
    const defaultWidgets: Widget[] = [
      {
        id: 'live_map_1',
        type: 'live_map',
        title: 'Tactical Overview',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
        config: { theme: 'tactical', showGeofences: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'surveillance'
      },
      {
        id: 'employee_tracker_1',
        type: 'employee_tracker',
        title: 'Personnel Status',
        position: { x: 6, y: 0 },
        size: { width: 3, height: 2 },
        config: { showTracking: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'surveillance'
      },
      {
        id: 'cost_counter_1',
        type: 'cost_counter',
        title: 'Financial Ops',
        position: { x: 9, y: 0 },
        size: { width: 3, height: 2 },
        config: { viewMode: 'daily' },
        isMinimized: false,
        isFullscreen: false,
        category: 'operations'
      },
      {
        id: 'alert_system_1',
        type: 'alert_system',
        title: 'Alert Command',
        position: { x: 6, y: 2 },
        size: { width: 6, height: 2 },
        config: { priority: 'high' },
        isMinimized: false,
        isFullscreen: false,
        category: 'communications'
      },
      {
        id: 'system_monitor_1',
        type: 'system_monitor',
        title: 'System Status',
        position: { x: 0, y: 4 },
        size: { width: 4, height: 2 },
        config: { detailed: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'resources'
      },
      {
        id: 'security_monitor_1',
        type: 'security_monitor',
        title: 'Security Command',
        position: { x: 4, y: 4 },
        size: { width: 4, height: 2 },
        config: { showThreats: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'security'
      },
      {
        id: 'performance_metrics_1',
        type: 'performance_metrics',
        title: 'Performance Intel',
        position: { x: 8, y: 4 },
        size: { width: 4, height: 2 },
        config: { timeframe: 'today' },
        isMinimized: false,
        isFullscreen: false,
        category: 'analytics'
      }
    ];

    setCurrentLayout(prev => ({
      ...prev,
      widgets: defaultWidgets
    }));
  }, []);

  const addWidget = (type: string) => {
    const widgetInfo = WIDGET_TYPES[type as keyof typeof WIDGET_TYPES];
    if (!widgetInfo) return;

    const newWidget: Widget = {
      id: `${type}_${Date.now()}`,
      type,
      title: widgetInfo.title,
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 },
      config: {},
      isMinimized: false,
      isFullscreen: false,
      category: widgetInfo.category
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));

    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const toggleWidgetMinimize = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    }));
  };

  const toggleWidgetFullscreen = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isFullscreen: !w.isFullscreen } : w
      )
    }));
  };

  const updateWidgetPosition = (widgetId: string, position: { x: number; y: number }) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, position } : w
      )
    }));
  };

  const updateWidgetSize = (widgetId: string, size: { width: number; height: number }) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, size } : w
      )
    }));
  };

  const saveLayout = async (name: string) => {
    const layoutToSave = { ...currentLayout, name, id: Date.now().toString() };
    const updatedLayouts = [...savedLayouts, layoutToSave];

    const { error } = await supabase
      .from('app_configs')
      .upsert({
        name: 'overwatch_layouts',
        value: updatedLayouts,
        created_by: user?.id,
        description: 'OverWatch TOSS dashboard layouts'
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving layout",
        description: error.message
      });
    } else {
      setSavedLayouts(updatedLayouts);
      toast({
        title: "Layout saved",
        description: `Layout "${name}" has been saved successfully`
      });
    }
  };

  const loadLayout = (layout: DashboardLayout) => {
    setCurrentLayout(layout);
    setIsCustomizing(false);
  };

  const renderWidget = (widget: Widget) => {
    const widgetInfo = WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES];
    if (!widgetInfo) return null;

    const IconComponent = widgetInfo.icon;

    if (widget.isFullscreen) {
      return (
        <div className="fixed inset-0 z-50 bg-background">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5" />
                  <span>{widget.title}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWidgetFullscreen(widget.id)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-full p-6">
              {renderWidgetContent(widget)}
            </CardContent>
          </Card>
        </div>
      );
    }

    const gridUnit = 80; // pixels per grid unit
    const style = {
      left: widget.position.x * gridUnit,
      top: widget.position.y * gridUnit,
      width: widget.size.width * gridUnit,
      height: widget.size.height * gridUnit,
    };

    return (
      <Card
        key={widget.id}
        className={`absolute border transition-all duration-200 ${
          selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
        } ${widget.isMinimized ? 'h-12' : ''}`}
        style={style}
        onClick={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
      >
        <CardHeader className="pb-2 min-h-12">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <IconComponent className="h-4 w-4" />
              <span className="truncate">{widget.title}</span>
            </CardTitle>
            {isCustomizing && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWidgetMinimize(widget.id);
                  }}
                >
                  {widget.isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWidgetFullscreen(widget.id);
                  }}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {!widget.isMinimized && (
          <CardContent className="p-2 overflow-hidden">
            {renderWidgetContent(widget)}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderWidgetContent = (widget: Widget) => {
    const data = liveData;

    switch (widget.type) {
      case 'live_map':
        return (
          <div className="h-full bg-muted rounded flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Live Tactical Map</p>
              <p className="text-xs text-muted-foreground">
                {data.employees.length} personnel tracked
              </p>
            </div>
          </div>
        );

      case 'employee_tracker':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Personnel:</span>
              <Badge>{data.employees.length}</Badge>
            </div>
            <div className="space-y-1">
              {data.employees.slice(0, 3).map((emp, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate">{emp.employee?.first_name}</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cost_counter':
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold">${(data.costs.labor + data.costs.materials).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Today's Total</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-medium">Labor</div>
                <div>${data.costs.labor?.toFixed(0) || 0}</div>
              </div>
              <div>
                <div className="font-medium">Materials</div>
                <div>${data.costs.materials?.toFixed(0) || 0}</div>
              </div>
            </div>
          </div>
        );

      case 'alert_system':
        return (
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {data.alerts.slice(0, 4).map((alert, i) => (
                <div key={i} className="p-2 bg-muted rounded text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{alert.title}</span>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="text-muted-foreground truncate">{alert.message}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        );

      case 'system_monitor':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>CPU:</span>
              <span>{data.system.cpu?.toFixed(0) || 0}%</span>
            </div>
            <Progress value={data.system.cpu || 0} className="h-1" />
            <div className="flex justify-between text-xs">
              <span>Memory:</span>
              <span>{data.system.memory?.toFixed(0) || 0}%</span>
            </div>
            <Progress value={data.system.memory || 0} className="h-1" />
            <div className="flex justify-between text-xs">
              <span>Network:</span>
              <span>{data.system.network?.toFixed(0) || 0}%</span>
            </div>
            <Progress value={data.system.network || 0} className="h-1" />
          </div>
        );

      case 'security_monitor':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-destructive">{data.security.violations || 0}</div>
                <div className="text-muted-foreground">Violations</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-500">{data.security.events?.length || 0}</div>
                <div className="text-muted-foreground">Events</div>
              </div>
            </div>
            <div className="space-y-1">
              {data.security.events?.slice(0, 2).map((event: { type: string; severity: string; time: string }, i: number) => (
                <div key={i} className="p-1 bg-muted rounded text-xs">
                  <div className="font-medium truncate">{event.type}</div>
                  <div className="text-muted-foreground truncate">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'performance_metrics':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold">94%</div>
                <div className="text-muted-foreground">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="font-bold">87%</div>
                <div className="text-muted-foreground">Quality</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Projects On Time:</span>
                <span className="text-green-500">12/14</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Budget Adherence:</span>
                <span className="text-green-500">96%</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">Widget Content</p>
            </div>
          </div>
        );
    }
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const filteredWidgetTypes = Object.entries(WIDGET_TYPES).filter(([key, widget]) => {
    const matchesCategory = filterCategory === 'all' || widget.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      widget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            {getJargonText(
              'Administrative access required for OverWatch TOSS',
              'Command authorization required for tactical operations'
            )}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentLayout.theme === 'tactical' ? 'bg-slate-900' : 'bg-background'}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Command className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">
                {getJargonText(
                  'OverWatch Tactical & Operational Strategic Systems',
                  'TOSS Command & Control Interface'
                )}
              </h1>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
              OPERATIONAL
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="military-jargon"
                checked={militaryJargon}
                onCheckedChange={setMilitaryJargon}
              />
              <Label htmlFor="military-jargon" className="text-xs">
                {getJargonText('Military', 'Tactical')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-xs">Auto-Refresh</Label>
            </div>

            <Button
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCustomizing ? 'Exit' : 'Customize'}
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowWidgetSelector(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>

              <Select value={currentLayout.theme} onValueChange={(theme: 'dark' | 'light' | 'tactical') => 
                setCurrentLayout(prev => ({ ...prev, theme }))
              }>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="tactical">Tactical</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Label className="text-xs">Refresh:</Label>
                <Slider
                  value={[refreshInterval]}
                  onValueChange={(value) => setRefreshInterval(value[0])}
                  min={5}
                  max={300}
                  step={5}
                  className="w-20"
                />
                <span className="text-xs">{refreshInterval}s</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Save Layout</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Layout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Layout name"
                      onChange={(e) => setCurrentLayout(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Button
                      onClick={() => saveLayout(currentLayout.name)}
                      className="w-full"
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Select onValueChange={(layoutId) => {
                const layout = savedLayouts.find(l => l.id === layoutId);
                if (layout) loadLayout(layout);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Load Layout" />
                </SelectTrigger>
                <SelectContent>
                  {savedLayouts.map(layout => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="relative p-4">
        <div
          ref={gridRef}
          className={`relative min-h-screen ${isCustomizing ? 'bg-grid-pattern' : ''}`}
          style={{
            backgroundImage: isCustomizing ? 
              'radial-gradient(circle, rgba(100,100,100,0.2) 1px, transparent 1px)' : 'none',
            backgroundSize: '80px 80px'
          }}
        >
          {currentLayout.widgets.map(renderWidget)}
        </div>
      </div>

      {/* Widget Selector Modal */}
      <Dialog open={showWidgetSelector} onOpenChange={setShowWidgetSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {getJargonText('Add Widget', 'Deploy Module')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="surveillance">Surveillance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWidgetTypes.map(([key, widget]) => {
                  const IconComponent = widget.icon;
                  return (
                    <Card
                      key={key}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addWidget(key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{widget.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {widget.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="flex items-center justify-between px-4 py-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Operational</span>
            </div>
            <span>CPU: {liveData.system.cpu?.toFixed(0)}%</span>
            <span>Memory: {liveData.system.memory?.toFixed(0)}%</span>
            <span>Network: {liveData.system.network?.toFixed(0)}%</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Active Personnel: {liveData.employees.length}</span>
            <span>Active Alerts: {liveData.alerts.length}</span>
            <span>Uptime: {liveData.system.uptime}</span>
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverWatchTOSS;