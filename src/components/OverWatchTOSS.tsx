import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Monitor, Grid, Settings, Plus, Maximize2, Minimize2, X, Move, Eye, 
  MapPin, Users, DollarSign, Clock, Car, AlertTriangle, TrendingUp,
  Activity, Shield, Radio, Satellite, Command, Zap, Target, Navigation,
  Crosshair, Radar, Globe, FileText, Camera, Phone, MessageSquare,
  BarChart3, PieChart, LineChart, Video, Mic, Database, Server,
  Lock, Key, Bell, Calendar, Timer, Gauge, ThermometerSun, Battery,
  Wifi, Signal, Bluetooth, Cpu, HardDrive, MemoryStick, Power,
  Brain, Atom, CloudLightning, Layers, Search, Filter, Sparkles,
  ShieldCheck, Fingerprint, Eye as EyeIcon, Scan, TrendingDown
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

// Advanced Services Integration
import { advancedAIService } from '@/services/advancedAIService';
import { quantumComputingService } from '@/services/quantumComputingService';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';
import { zeroTrustSecurityService } from '@/services/zeroTrustSecurityService';
import { iotEdgeComputingService } from '@/services/iotEdgeComputingService';
import { blockchainIntegrityService } from '@/services/blockchainIntegrityService';
import { intelligentAutomationService } from '@/services/intelligentAutomationService';
import { arVrVisualizationService } from '@/services/arVrVisualizationService';
import { environmentalMonitoringService } from '@/services/environmentalMonitoringService';
import { globalInfrastructureService } from '@/services/globalInfrastructureService';
import { biometricAuthService } from '@/services/biometricAuthService';
import { visualDefectMappingService } from '@/services/visualDefectMappingService';
import { aiDefectDetectionService } from '@/services/aiDefectDetectionService';
import { optimizedAIModelService } from '@/services/optimizedAIModelService';

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
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  zeroTrustScore: number;
  biometricEvents: number;
  vulnerabilities: number;
  blockchainIntegrity: number;
}

interface SystemData {
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
  connections: number;
  aiModelPerformance: AIModelMetrics;
  quantumCoherence: number;
  networkLatency: number;
  throughput: number;
}

interface AIModelMetrics {
  accuracy: number;
  inferenceTime: number;
  modelsActive: number;
  predictionConfidence: number;
  anomalyScore: number;
  trainingStatus: 'training' | 'ready' | 'updating' | 'error';
}

interface QuantumMetrics {
  qubits: number;
  coherenceTime: number;
  gateErrorRate: number;
  entanglementDepth: number;
  quantumVolume: number;
  optimizationJobs: number;
  quantumAdvantage: boolean;
  processingPower: number;
}

interface EnvironmentalData {
  carbonFootprint: number;
  energyEfficiency: number;
  sustainabilityScore: number;
  wasteReduction: number;
  renewableEnergy: number;
  environmentalCompliance: number;
}

interface AdvancedAnalytics {
  predictiveAccuracy: number;
  anomalyDetection: number;
  sentimentScore: number;
  patternRecognition: number;
  defectDetectionRate: number;
  optimizationGains: number;
}

interface IoTDeviceData {
  deviceId: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  batteryLevel: number;
  signalStrength: number;
  lastUpdate: string;
  sensorReadings: Record<string, number>;
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
  quantumMetrics: QuantumMetrics;
  environmental: EnvironmentalData;
  analytics: AdvancedAnalytics;
  iotDevices: IoTDeviceData[];
  biometricAuth: BiometricAuthData;
  blockchainAudit: BlockchainAuditData;
}

interface BiometricAuthData {
  authenticationsToday: number;
  failedAttempts: number;
  averageAuthTime: number;
  securityLevel: 'low' | 'medium' | 'high' | 'maximum';
  biometricTypes: string[];
}

interface BlockchainAuditData {
  transactionsToday: number;
  blockHeight: number;
  integrityScore: number;
  lastAudit: string;
  consensusHealth: number;
}

const WIDGET_TYPES = {
  // Surveillance & Tracking (Enhanced with AI)
  live_map: { icon: MapPin, title: 'AI-Enhanced Tactical Map', category: 'surveillance' },
  employee_tracker: { icon: Users, title: 'AI Personnel Tracker', category: 'surveillance' },
  vehicle_tracker: { icon: Car, title: 'Smart Fleet Tracker', category: 'surveillance' },
  geofence_monitor: { icon: Radar, title: 'AI Perimeter Monitor', category: 'surveillance' },
  route_playback: { icon: Navigation, title: 'ML Route Analysis', category: 'surveillance' },
  thermal_overlay: { icon: ThermometerSun, title: 'Thermal AI Analysis', category: 'surveillance' },
  facial_recognition: { icon: EyeIcon, title: 'Biometric Recognition', category: 'surveillance' },
  behavior_analysis: { icon: Brain, title: 'AI Behavior Analysis', category: 'surveillance' },
  predictive_tracking: { icon: TrendingUp, title: 'Predictive Movement', category: 'surveillance' },
  
  // Operations & Analytics (Quantum-Enhanced)
  cost_counter: { icon: DollarSign, title: 'Quantum Cost Analysis', category: 'operations' },
  time_tracker: { icon: Clock, title: 'AI Time Optimization', category: 'operations' },
  project_overview: { icon: Target, title: 'Mission Intelligence', category: 'operations' },
  task_priorities: { icon: Command, title: 'AI Task Command', category: 'operations' },
  resource_allocation: { icon: Database, title: 'Quantum Resource Mgmt', category: 'operations' },
  equipment_status: { icon: Server, title: 'IoT Equipment Monitor', category: 'operations' },
  workflow_automation: { icon: Sparkles, title: 'Intelligent Automation', category: 'operations' },
  optimization_engine: { icon: Atom, title: 'Quantum Optimization', category: 'operations' },
  
  // Analytics & Intelligence (ML-Powered)
  performance_metrics: { icon: BarChart3, title: 'AI Performance Intel', category: 'analytics' },
  predictive_analytics: { icon: TrendingUp, title: 'ML Predictive Engine', category: 'analytics' },
  cost_analytics: { icon: PieChart, title: 'Financial AI Analysis', category: 'analytics' },
  efficiency_monitor: { icon: Gauge, title: 'Efficiency AI Monitor', category: 'analytics' },
  trend_analysis: { icon: LineChart, title: 'ML Trend Analysis', category: 'analytics' },
  kpi_dashboard: { icon: Activity, title: 'KPI Command Center', category: 'analytics' },
  anomaly_detection: { icon: Search, title: 'AI Anomaly Detection', category: 'analytics' },
  sentiment_analysis: { icon: Brain, title: 'NLP Sentiment Engine', category: 'analytics' },
  defect_detection: { icon: Scan, title: 'AI Defect Detection', category: 'analytics' },
  
  // Communications (AI-Enhanced)
  comms_center: { icon: MessageSquare, title: 'AI Communications Hub', category: 'communications' },
  alert_system: { icon: Bell, title: 'Intelligent Alert System', category: 'communications' },
  notification_center: { icon: Radio, title: 'Smart Notifications', category: 'communications' },
  emergency_comms: { icon: Phone, title: 'Emergency AI Comms', category: 'communications' },
  video_feed: { icon: Video, title: 'AI Video Surveillance', category: 'communications' },
  audio_monitor: { icon: Mic, title: 'Audio Intelligence', category: 'communications' },
  translation_engine: { icon: Globe, title: 'AI Translation Hub', category: 'communications' },
  voice_assistant: { icon: Mic, title: 'AI Voice Assistant', category: 'communications' },
  
  // Security & Compliance (Zero-Trust Enhanced)
  security_monitor: { icon: Shield, title: 'Zero-Trust Security', category: 'security' },
  access_control: { icon: Lock, title: 'Biometric Access Control', category: 'security' },
  compliance_tracker: { icon: Key, title: 'AI Compliance Monitor', category: 'security' },
  threat_detection: { icon: Crosshair, title: 'AI Threat Detection', category: 'security' },
  audit_log: { icon: FileText, title: 'Blockchain Audit Trail', category: 'security' },
  incident_tracker: { icon: AlertTriangle, title: 'AI Incident Command', category: 'security' },
  vulnerability_scanner: { icon: ShieldCheck, title: 'AI Vulnerability Scan', category: 'security' },
  penetration_testing: { icon: Fingerprint, title: 'Auto Pen Testing', category: 'security' },
  fraud_detection: { icon: Filter, title: 'AI Fraud Detection', category: 'security' },
  
  // System Resources (Enhanced Monitoring)
  system_monitor: { icon: Cpu, title: 'AI System Monitor', category: 'resources' },
  network_status: { icon: Wifi, title: 'Network Intelligence', category: 'resources' },
  device_health: { icon: Battery, title: 'IoT Device Health', category: 'resources' },
  signal_strength: { icon: Signal, title: 'Signal Intelligence', category: 'resources' },
  bandwidth_monitor: { icon: Satellite, title: 'Bandwidth Optimizer', category: 'resources' },
  power_management: { icon: Power, title: 'Smart Power Mgmt', category: 'resources' },
  
  // Quantum Computing
  quantum_processor: { icon: Atom, title: 'Quantum Processor', category: 'quantum' },
  quantum_algorithms: { icon: CloudLightning, title: 'Quantum Algorithms', category: 'quantum' },
  quantum_optimization: { icon: TrendingUp, title: 'Quantum Optimization', category: 'quantum' },
  quantum_entanglement: { icon: Layers, title: 'Quantum Entanglement', category: 'quantum' },
  
  // Environmental & Sustainability
  environmental_monitor: { icon: Globe, title: 'Environmental AI', category: 'environmental' },
  carbon_tracker: { icon: Layers, title: 'Carbon Intelligence', category: 'environmental' },
  sustainability_metrics: { icon: TrendingDown, title: 'Sustainability AI', category: 'environmental' },
  
  // AR/VR & 3D
  ar_visualization: { icon: Camera, title: 'AR Visualization', category: 'visualization' },
  vr_training: { icon: Video, title: 'VR Training Center', category: 'visualization' },
  scanning_3d: { icon: Scan, title: '3D Scanning Interface', category: 'visualization' }
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
    system: {},
    quantumMetrics: {},
    environmental: {},
    analytics: {},
    iotDevices: [],
    biometricAuth: {},
    blockchainAudit: {}
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
        systemData,
        quantumMetricsData,
        environmentalData,
        analyticsData,
        iotDevicesData,
        biometricAuthData,
        blockchainAuditData
      ] = await Promise.all([
        fetchEmployees(),
        fetchVehicles(),
        fetchProjects(),
        fetchAlerts(),
        fetchCosts(),
        fetchCommunications(),
        fetchSecurity(),
        fetchSystemData(),
        fetchQuantumMetrics(),
        fetchEnvironmentalData(),
        fetchAnalytics(),
        fetchIoTDevices(),
        fetchBiometricAuth(),
        fetchBlockchainAudit()
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
        system: systemData || {},
        quantumMetrics: quantumMetricsData || {},
        environmental: environmentalData || {},
        analytics: analyticsData || {},
        iotDevices: iotDevicesData || [],
        biometricAuth: biometricAuthData || {},
        blockchainAudit: blockchainAuditData || {}
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

    const threatLevels = ['low', 'medium', 'high', 'critical'];
    const randomThreatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];

    return {
      violations: violations?.length || 0,
      events: events || [],
      incidents: Math.floor(Math.random() * 5) + 1,
      alerts: Math.floor(Math.random() * 10) + 5,
      status: 'operational',
      threatLevel: randomThreatLevel,
      zeroTrustScore: 85 + Math.random() * 15, // 85-100
      biometricEvents: Math.floor(Math.random() * 200) + 100, // 100-300 events
      vulnerabilities: Math.floor(Math.random() * 5) + 1, // 1-6 vulnerabilities
      blockchainIntegrity: 95 + Math.random() * 5 // 95-100%
    };
  };

  const fetchSystemData = async () => {
    // Mock system data - in production, this would come from monitoring services
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      storage: Math.random() * 100,
      uptime: '72h 15m',
      connections: Math.floor(Math.random() * 100) + 50,
      aiModelPerformance: {
        accuracy: 0.85 + Math.random() * 0.15, // 85-100%
        inferenceTime: Math.floor(Math.random() * 50) + 50, // 50-100ms
        modelsActive: Math.floor(Math.random() * 5) + 5, // 5-10 models
        predictionConfidence: 0.8 + Math.random() * 0.2, // 80-100%
        anomalyScore: Math.random() * 0.1, // 0-10%
        trainingStatus: ['training', 'ready', 'updating'][Math.floor(Math.random() * 3)]
      },
      quantumCoherence: Math.random() * 100,
      networkLatency: Math.floor(Math.random() * 20) + 5, // 5-25ms
      throughput: Math.floor(Math.random() * 1000) + 500 // 500-1500 Mbps
    };
  };

  const fetchQuantumMetrics = async () => {
    // Mock quantum metrics - in production, integrate with quantum computing service
    return {
      qubits: Math.floor(Math.random() * 100) + 50,
      coherenceTime: Math.floor(Math.random() * 1000) + 100,
      gateErrorRate: Math.random() * 0.01,
      entanglementDepth: Math.floor(Math.random() * 10) + 5,
      quantumVolume: Math.floor(Math.random() * 1000) + 500,
      optimizationJobs: Math.floor(Math.random() * 100) + 20,
      quantumAdvantage: Math.random() > 0.5,
      processingPower: Math.floor(Math.random() * 1000) + 500
    };
  };

  const fetchEnvironmentalData = async () => {
    // Mock environmental data - in production, integrate with environmental monitoring service
    return {
      carbonFootprint: Math.floor(Math.random() * 1000) + 500,
      energyEfficiency: Math.random() * 0.1,
      sustainabilityScore: Math.random() * 100,
      wasteReduction: Math.random() * 0.5,
      renewableEnergy: Math.random() * 0.8,
      environmentalCompliance: Math.random() * 100
    };
  };

  const fetchAnalytics = async () => {
    // Mock analytics data - in production, integrate with advanced AI service
    return {
      predictiveAccuracy: Math.random() * 0.95,
      anomalyDetection: Math.random() * 0.90,
      sentimentScore: Math.random() * 0.85,
      patternRecognition: Math.random() * 0.92,
      defectDetectionRate: Math.random() * 0.98,
      optimizationGains: Math.random() * 0.90
    };
  };

  const fetchIoTDevices = async () => {
    const { data } = await supabase
      .from('iot_devices')
      .select('*');
    return data;
  };

  const fetchBiometricAuth = async () => {
    // Mock biometric auth data - in production, integrate with biometric auth service
    const securityLevels: ('low' | 'medium' | 'high' | 'maximum')[] = ['low', 'medium', 'high', 'maximum'];
    const biometricTypes = ['fingerprint', 'face', 'iris', 'voice'];
    
    return {
      authenticationsToday: Math.floor(Math.random() * 200) + 100,
      failedAttempts: Math.floor(Math.random() * 10) + 2,
      averageAuthTime: Math.floor(Math.random() * 500) + 300, // 300-800ms
      securityLevel: securityLevels[Math.floor(Math.random() * securityLevels.length)],
      biometricTypes: [biometricTypes[Math.floor(Math.random() * biometricTypes.length)]]
    };
  };

  const fetchBlockchainAudit = async () => {
    // Mock blockchain audit data - in production, integrate with blockchain integrity service
    return {
      transactionsToday: Math.floor(Math.random() * 100) + 50,
      blockHeight: Math.floor(Math.random() * 1000) + 500,
      integrityScore: Math.random() * 100,
      lastAudit: '2h ago',
      consensusHealth: Math.random() * 100
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
      // Primary Tactical Overview
      {
        id: 'live_map_1',
        type: 'live_map',
        title: 'AI-Enhanced Tactical Overview',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
        config: { theme: 'tactical', showGeofences: true, aiEnhanced: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'surveillance'
      },
      // Quantum Computing Core
      {
        id: 'quantum_processor_1',
        type: 'quantum_processor',
        title: 'Quantum Processing Core',
        position: { x: 6, y: 0 },
        size: { width: 3, height: 2 },
        config: { showQuantumState: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'quantum'
      },
      // AI Operations Center
      {
        id: 'performance_metrics_1',
        type: 'performance_metrics',
        title: 'AI Performance Intel',
        position: { x: 9, y: 0 },
        size: { width: 3, height: 2 },
        config: { aiEnhanced: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'analytics'
      },
      // Personnel Tracking with AI
      {
        id: 'employee_tracker_1',
        type: 'employee_tracker',
        title: 'AI Personnel Intelligence',
        position: { x: 6, y: 2 },
        size: { width: 3, height: 2 },
        config: { showBehaviorAnalysis: true, predictiveTracking: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'surveillance'
      },
      // Zero-Trust Security
      {
        id: 'security_monitor_1',
        type: 'security_monitor',
        title: 'Zero-Trust Security Command',
        position: { x: 9, y: 2 },
        size: { width: 3, height: 2 },
        config: { zeroTrust: true, threatDetection: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'security'
      },
      // Advanced Analytics Engine
      {
        id: 'predictive_analytics_1',
        type: 'predictive_analytics',
        title: 'ML Predictive Engine',
        position: { x: 0, y: 4 },
        size: { width: 4, height: 2 },
        config: { mlModels: true, realTimeAnalysis: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'analytics'
      },
      // Environmental Monitoring
      {
        id: 'environmental_monitor_1',
        type: 'environmental_monitor',
        title: 'Environmental AI',
        position: { x: 4, y: 4 },
        size: { width: 4, height: 2 },
        config: { sustainabilityTracking: true, carbonIntelligence: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'environmental'
      },
      // IoT Device Management
      {
        id: 'device_health_1',
        type: 'device_health',
        title: 'IoT Device Intelligence',
        position: { x: 8, y: 4 },
        size: { width: 4, height: 2 },
        config: { iotIntegration: true, edgeComputing: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'resources'
      },
      // Anomaly Detection
      {
        id: 'anomaly_detection_1',
        type: 'anomaly_detection',
        title: 'AI Anomaly Detection',
        position: { x: 0, y: 6 },
        size: { width: 3, height: 2 },
        config: { realTimeDetection: true, mlModels: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'analytics'
      },
      // Biometric Access Control
      {
        id: 'access_control_1',
        type: 'access_control',
        title: 'Biometric Access Control',
        position: { x: 3, y: 6 },
        size: { width: 3, height: 2 },
        config: { biometricAuth: true, zeroTrust: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'security'
      },
      // Blockchain Audit Trail
      {
        id: 'audit_log_1',
        type: 'audit_log',
        title: 'Blockchain Audit Intelligence',
        position: { x: 6, y: 6 },
        size: { width: 3, height: 2 },
        config: { blockchainEnabled: true, immutableAudit: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'security'
      },
      // Intelligent Automation
      {
        id: 'workflow_automation_1',
        type: 'workflow_automation',
        title: 'Intelligent Automation Hub',
        position: { x: 9, y: 6 },
        size: { width: 3, height: 2 },
        config: { aiDriven: true, quantumOptimized: true },
        isMinimized: false,
        isFullscreen: false,
        category: 'operations'
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
          <div className="h-full bg-muted rounded flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto mb-2 text-primary animate-pulse" />
                <p className="text-sm font-medium">AI-Enhanced Tactical Map</p>
                <p className="text-xs text-muted-foreground">
                  {data.employees.length} personnel • {data.vehicles.length} vehicles tracked
                </p>
              </div>
            </div>
            <div className="border-t p-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-500">94%</div>
                  <div className="text-muted-foreground">Coverage</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-500">12ms</div>
                  <div className="text-muted-foreground">Latency</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-500">AI</div>
                  <div className="text-muted-foreground">Enhanced</div>
                </div>
              </div>
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
                <div className="font-bold text-green-500">{data.security.zeroTrustScore?.toFixed(0) || 98}</div>
                <div className="text-muted-foreground">Trust Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-500">{data.security.vulnerabilities || 2}</div>
                <div className="text-muted-foreground">Vulnerabilities</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-500">{data.security.biometricEvents || 127}</div>
                <div className="text-muted-foreground">Biometric</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Threat Level:</span>
                <Badge 
                  variant={data.security.threatLevel === 'low' ? 'default' : 
                          data.security.threatLevel === 'medium' ? 'secondary' : 'destructive'} 
                  className="text-xs"
                >
                  {data.security.threatLevel || 'low'}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Blockchain Integrity:</span>
                <span className="text-green-400">{data.security.blockchainIntegrity?.toFixed(0) || 100}%</span>
              </div>
              <Progress value={data.security.blockchainIntegrity || 100} className="h-1" />
            </div>
          </div>
        );

      case 'performance_metrics':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-500">{(data.system.aiModelPerformance?.accuracy * 100 || 94).toFixed(0)}%</div>
                <div className="text-muted-foreground">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-500">{data.system.aiModelPerformance?.inferenceTime || 87}ms</div>
                <div className="text-muted-foreground">Inference</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Active Models:</span>
                <Badge variant="outline" className="text-xs">
                  {data.system.aiModelPerformance?.modelsActive || 8}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Confidence:</span>
                <span className="text-green-400">{(data.system.aiModelPerformance?.predictionConfidence * 100 || 92).toFixed(0)}%</span>
              </div>
              <Progress value={data.system.aiModelPerformance?.predictionConfidence * 100 || 92} className="h-1" />
              <div className="flex items-center justify-between text-xs">
                <span>Status:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400">{data.system.aiModelPerformance?.trainingStatus || 'ready'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'environmental_monitor':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                <div className="font-bold text-green-400">{(data.environmental.sustainabilityScore || 85).toFixed(0)}</div>
                <div className="text-muted-foreground">Sustainability</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded">
                <div className="font-bold text-teal-400">{(data.environmental.carbonFootprint || 1250).toFixed(0)}kg</div>
                <div className="text-muted-foreground">Carbon</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Energy Efficiency:</span>
                <span className="text-green-400">{(data.environmental.energyEfficiency * 100 || 78).toFixed(0)}%</span>
              </div>
              <Progress value={data.environmental.energyEfficiency * 100 || 78} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Renewable Energy:</span>
                <span className="text-blue-400">{(data.environmental.renewableEnergy * 100 || 65).toFixed(0)}%</span>
              </div>
              <Progress value={data.environmental.renewableEnergy * 100 || 65} className="h-1" />
            </div>
          </div>
        );

      case 'anomaly_detection':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded">
                <div className="font-bold text-red-400">{(data.analytics.anomalyDetection * 100 || 98.5).toFixed(1)}%</div>
                <div className="text-muted-foreground">Detection Rate</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded">
                <div className="font-bold text-amber-400">3</div>
                <div className="text-muted-foreground">Active Alerts</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Pattern Recognition:</span>
                  <span className="text-purple-400">{(data.analytics.patternRecognition * 100 || 94).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>ML Confidence:</span>
                  <span className="text-green-400">{(data.analytics.predictiveAccuracy * 100 || 92).toFixed(0)}%</span>
                </div>
                <div className="p-1 bg-muted rounded text-xs">
                  <div className="font-medium text-orange-400">Recent Anomaly</div>
                  <div className="text-muted-foreground">Unusual access pattern detected - Sector 7</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'device_health':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-500">{data.iotDevices.filter(d => d.status === 'online').length || 45}</div>
                <div className="text-muted-foreground">Online</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-500">{data.iotDevices.filter(d => d.status === 'maintenance').length || 3}</div>
                <div className="text-muted-foreground">Maintenance</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-500">{data.iotDevices.filter(d => d.status === 'offline').length || 1}</div>
                <div className="text-muted-foreground">Offline</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Avg Battery:</span>
                <span className="text-green-400">87%</span>
              </div>
              <Progress value={87} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Signal Strength:</span>
                <span className="text-blue-400">-45dBm</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Edge Computing:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'access_control':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded">
                <div className="font-bold text-blue-400">{data.biometricAuth.authenticationsToday || 127}</div>
                <div className="text-muted-foreground">Auth Today</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                <div className="font-bold text-green-400">{data.biometricAuth.averageAuthTime || 850}ms</div>
                <div className="text-muted-foreground">Avg Time</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Security Level:</span>
                <Badge variant="default" className="text-xs bg-purple-500">
                  {data.biometricAuth.securityLevel || 'maximum'}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Failed Attempts:</span>
                <span className="text-red-400">{data.biometricAuth.failedAttempts || 2}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center space-x-1">
                  <Fingerprint className="h-3 w-3 text-blue-400" />
                  <span>Fingerprint</span>
                </div>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-3 w-3 text-green-400" />
                  <span>Iris</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audit_log':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded">
                <div className="font-bold text-indigo-400">{data.blockchainAudit.transactionsToday || 1247}</div>
                <div className="text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded">
                <div className="font-bold text-purple-400">{data.blockchainAudit.blockHeight || 892156}</div>
                <div className="text-muted-foreground">Block Height</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Integrity Score:</span>
                <span className="text-green-400">{data.blockchainAudit.integrityScore?.toFixed(1) || 100.0}%</span>
              </div>
              <Progress value={data.blockchainAudit.integrityScore || 100} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Consensus Health:</span>
                <span className="text-blue-400">{data.blockchainAudit.consensusHealth?.toFixed(0) || 98}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Last Audit:</span>
                <span className="text-muted-foreground">{data.blockchainAudit.lastAudit || '2h ago'}</span>
              </div>
            </div>
          </div>
        );

      case 'workflow_automation':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded">
                <div className="font-bold text-cyan-400">87%</div>
                <div className="text-muted-foreground">Automation</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded">
                <div className="font-bold text-emerald-400">23</div>
                <div className="text-muted-foreground">Active Flows</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>AI Optimization:</span>
                <span className="text-purple-400">94%</span>
              </div>
              <Progress value={94} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Quantum Enhanced:</span>
                <div className="flex items-center space-x-1">
                  <Atom className="h-3 w-3 text-purple-400" />
                  <span className="text-purple-400">Active</span>
                </div>
              </div>
              <div className="p-1 bg-muted rounded text-xs">
                <div className="font-medium text-green-400">Recent Optimization</div>
                <div className="text-muted-foreground">Task scheduling improved by 23%</div>
              </div>
            </div>
          </div>
        );

      case 'quantum_algorithms':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded">
                <div className="font-bold text-purple-400">QAOA</div>
                <div className="text-muted-foreground">Algorithm</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded">
                <div className="font-bold text-violet-400">VQE</div>
                <div className="text-muted-foreground">Optimizer</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Algorithm Efficiency:</span>
                <span className="text-purple-400">96.7%</span>
              </div>
              <Progress value={96.7} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Iterations/sec:</span>
                <span className="text-cyan-400">1,247</span>
              </div>
              <div className="p-1 bg-muted rounded text-xs">
                <div className="font-medium text-purple-400">Active Job</div>
                <div className="text-muted-foreground">Portfolio optimization - 73% complete</div>
              </div>
            </div>
          </div>
        );

      case 'predictive_analytics':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded">
                <div className="font-bold text-emerald-400">{(data.analytics.predictiveAccuracy * 100 || 94.2).toFixed(1)}%</div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded">
                <div className="font-bold text-cyan-400">87ms</div>
                <div className="text-muted-foreground">Inference</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>LSTM Models:</span>
                <Badge variant="outline" className="text-xs">5</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Forecast Horizon:</span>
                <span className="text-blue-400">72h</span>
              </div>
              <div className="space-y-1">
                <div className="p-1 bg-muted rounded text-xs">
                  <div className="font-medium text-green-400">Next Prediction</div>
                  <div className="text-muted-foreground">Equipment failure risk: 12% (Sector 3)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'defect_detection':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded">
                <div className="font-bold text-orange-400">{(data.analytics.defectDetectionRate * 100 || 98.3).toFixed(1)}%</div>
                <div className="text-muted-foreground">Detection</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded">
                <div className="font-bold text-yellow-400">7</div>
                <div className="text-muted-foreground">Found Today</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CNN Models:</span>
                <Badge variant="outline" className="text-xs">3</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Processing Speed:</span>
                <span className="text-green-400">125 fps</span>
              </div>
              <div className="p-1 bg-muted rounded text-xs">
                <div className="font-medium text-red-400">Critical Defect</div>
                <div className="text-muted-foreground">Structural crack detected - Grid 7B</div>
              </div>
            </div>
          </div>
        );

      case 'ar_visualization':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded">
                <div className="font-bold text-teal-400">AR</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded">
                <div className="font-bold text-purple-400">12</div>
                <div className="text-muted-foreground">Overlays</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Frame Rate:</span>
                <span className="text-green-400">60 fps</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Tracking Accuracy:</span>
                <span className="text-blue-400">99.2%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>WebXR Status:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'facial_recognition':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded">
                <div className="font-bold text-blue-400">97.8%</div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                <div className="font-bold text-green-400">34</div>
                <div className="text-muted-foreground">Recognized</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Processing Time:</span>
                <span className="text-cyan-400">45ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Database Size:</span>
                <span className="text-purple-400">15,247</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Live Feeds:</span>
                <Badge variant="outline" className="text-xs">8</Badge>
              </div>
            </div>
          </div>
        );

      case 'carbon_tracker':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                <div className="font-bold text-green-400">-15%</div>
                <div className="text-muted-foreground">Reduction</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded">
                <div className="font-bold text-teal-400">2.1t</div>
                <div className="text-muted-foreground">CO₂/Month</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Target Progress:</span>
                <span className="text-green-400">78%</span>
              </div>
              <Progress value={78} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Carbon Credits:</span>
                <span className="text-blue-400">45</span>
              </div>
              <div className="p-1 bg-muted rounded text-xs">
                <div className="font-medium text-green-400">Achievement</div>
                <div className="text-muted-foreground">Monthly reduction goal met</div>
              </div>
            </div>
          </div>
        );

      case 'threat_detection':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded">
                <div className="font-bold text-red-400">HIGH</div>
                <div className="text-muted-foreground">Alert Level</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded">
                <div className="font-bold text-yellow-400">3</div>
                <div className="text-muted-foreground">Active Threats</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>AI Confidence:</span>
                <span className="text-red-400">94.7%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Response Time:</span>
                <span className="text-green-400">1.2s</span>
              </div>
              <div className="p-1 bg-muted rounded text-xs">
                <div className="font-medium text-red-400">Critical Threat</div>
                <div className="text-muted-foreground">Unauthorized access attempt - Sector 9</div>
              </div>
            </div>
          </div>
        );

      case 'voice_assistant':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded">
                <div className="font-bold text-indigo-400">NLP</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                <div className="font-bold text-green-400">89%</div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Commands Today:</span>
                <span className="text-blue-400">247</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Response Time:</span>
                <span className="text-green-400">0.8s</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Voice Recognition:</span>
                <div className="flex items-center space-x-1">
                  <Mic className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Listening</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'scanning_3d':
        return (
          <div className="h-full space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded">
                <div className="font-bold text-cyan-400">LiDAR</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded">
                <div className="font-bold text-purple-400">4K</div>
                <div className="text-muted-foreground">Resolution</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Scan Accuracy:</span>
                <span className="text-green-400">±2mm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Processing:</span>
                <span className="text-blue-400">Real-time</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Point Cloud:</span>
                <span className="text-purple-400">2.1M points</span>
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
                  <SelectItem value="surveillance">Surveillance & AI</SelectItem>
                  <SelectItem value="operations">Operations & Quantum</SelectItem>
                  <SelectItem value="analytics">Analytics & ML</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="security">Security & Zero-Trust</SelectItem>
                  <SelectItem value="resources">Resources & IoT</SelectItem>
                  <SelectItem value="quantum">Quantum Computing</SelectItem>
                  <SelectItem value="environmental">Environmental & Sustainability</SelectItem>
                  <SelectItem value="visualization">AR/VR & 3D</SelectItem>
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
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Operational</span>
            </div>
            <span>CPU: {liveData.system.cpu?.toFixed(0)}%</span>
            <span>Memory: {liveData.system.memory?.toFixed(0)}%</span>
            <span>Network: {liveData.system.networkLatency?.toFixed(0)}ms</span>
            <div className="flex items-center space-x-1">
              <Atom className="h-3 w-3 text-purple-400" />
              <span>Quantum: {liveData.quantumMetrics.qubits || 0}Q</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="h-3 w-3 text-blue-400" />
              <span>AI: {(liveData.system.aiModelPerformance?.accuracy * 100 || 94).toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-400" />
              <span>Security: {liveData.security.zeroTrustScore?.toFixed(0) || 98}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3 text-teal-400" />
              <span>Carbon: {(liveData.environmental.carbonFootprint || 1250).toFixed(0)}kg</span>
            </div>
            <span>Personnel: {liveData.employees.length}</span>
            <span>Alerts: {liveData.alerts.length}</span>
            <span>IoT: {liveData.iotDevices.filter(d => d.status === 'online').length || 45}/{liveData.iotDevices.length || 49}</span>
            <span>Uptime: {liveData.system.uptime}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Last Update: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverWatchTOSS;