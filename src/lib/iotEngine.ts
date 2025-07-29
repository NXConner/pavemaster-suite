/**
 * Phase 6: IoT Engine
 * Advanced Internet of Things system for construction equipment and environmental monitoring
 */

import { performanceMonitor } from './performance';
import { globalInfrastructure } from './globalInfrastructure';

// IoT Core Interfaces
export interface IoTDevice {
  id: string;
  name: string;
  type: IoTDeviceType;
  category: IoTCategory;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  status: IoTStatus;
  location: IoTLocation;
  connectivity: IoTConnectivity;
  specifications: IoTSpecifications;
  sensors: IoTSensor[];
  actuators: IoTActuator[];
  lastSeen: Date;
  batteryLevel?: number;
  metadata: Record<string, any>;
}

export enum IoTDeviceType {
  EXCAVATOR = 'excavator',
  CRANE = 'crane',
  CONCRETE_MIXER = 'concrete_mixer',
  BULLDOZER = 'bulldozer',
  DUMP_TRUCK = 'dump_truck',
  GENERATOR = 'generator',
  COMPRESSOR = 'compressor',
  ENVIRONMENTAL_SENSOR = 'environmental_sensor',
  SAFETY_BEACON = 'safety_beacon',
  WEATHER_STATION = 'weather_station',
  SECURITY_CAMERA = 'security_camera',
  ACCESS_CONTROL = 'access_control',
  LIGHTING_SYSTEM = 'lighting_system',
  POWER_METER = 'power_meter',
  WATER_LEVEL_SENSOR = 'water_level_sensor',
  SOIL_SENSOR = 'soil_sensor',
  VIBRATION_SENSOR = 'vibration_sensor',
  NOISE_MONITOR = 'noise_monitor',
  AIR_QUALITY_SENSOR = 'air_quality_sensor',
  SMART_HELMET = 'smart_helmet',
  WEARABLE_DEVICE = 'wearable_device'
}

export enum IoTCategory {
  HEAVY_EQUIPMENT = 'heavy_equipment',
  ENVIRONMENTAL = 'environmental',
  SAFETY = 'safety',
  SECURITY = 'security',
  UTILITIES = 'utilities',
  WEARABLES = 'wearables',
  INFRASTRUCTURE = 'infrastructure'
}

export enum IoTStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  IDLE = 'idle',
  ACTIVE = 'active',
  WARNING = 'warning'
}

export interface IoTLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  zone?: string;
  building?: string;
  floor?: string;
  room?: string;
  precision: number; // meters
  lastUpdated: Date;
}

export interface IoTConnectivity {
  protocol: 'wifi' | 'cellular' | 'lora' | 'bluetooth' | 'zigbee' | 'ethernet';
  signalStrength: number; // dBm
  dataRate: number; // Mbps
  latency: number; // ms
  isConnected: boolean;
  lastConnected: Date;
  networkInfo?: {
    ssid?: string;
    carrier?: string;
    frequency?: number;
  };
}

export interface IoTSpecifications {
  dimensions: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
  powerRequirements: {
    voltage: number;
    current: number;
    powerConsumption: number; // watts
    batteryCapacity?: number; // mAh
  };
  operatingConditions: {
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
    ipRating: string; // IP65, IP67, etc.
    certifications: string[];
  };
  dataRate: {
    samplingFrequency: number; // Hz
    dataSize: number; // bytes per sample
    storageCapacity: number; // GB
  };
}

export interface IoTSensor {
  id: string;
  type: IoTSensorType;
  unit: string;
  range: { min: number; max: number };
  accuracy: number;
  resolution: number;
  calibrationDate: Date;
  isEnabled: boolean;
  thresholds: IoTThreshold[];
}

export enum IoTSensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  VIBRATION = 'vibration',
  ACCELERATION = 'acceleration',
  GPS = 'gps',
  GYROSCOPE = 'gyroscope',
  MAGNETOMETER = 'magnetometer',
  PROXIMITY = 'proximity',
  LIGHT = 'light',
  SOUND = 'sound',
  AIR_QUALITY = 'air_quality',
  FUEL_LEVEL = 'fuel_level',
  ENGINE_RPM = 'engine_rpm',
  ENGINE_TEMPERATURE = 'engine_temperature',
  HYDRAULIC_PRESSURE = 'hydraulic_pressure',
  LOAD_WEIGHT = 'load_weight',
  HOUR_METER = 'hour_meter',
  SPEED = 'speed',
  TILT = 'tilt',
  STRAIN = 'strain',
  FLOW_RATE = 'flow_rate',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  POWER = 'power'
}

export interface IoTActuator {
  id: string;
  type: IoTActuatorType;
  isEnabled: boolean;
  currentState: any;
  supportedCommands: string[];
}

export enum IoTActuatorType {
  MOTOR = 'motor',
  PUMP = 'pump',
  VALVE = 'valve',
  RELAY = 'relay',
  LED = 'led',
  SPEAKER = 'speaker',
  DISPLAY = 'display',
  ALARM = 'alarm'
}

export interface IoTThreshold {
  id: string;
  name: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | number[];
  severity: 'info' | 'warning' | 'critical';
  actions: IoTAction[];
  isEnabled: boolean;
}

export interface IoTAction {
  type: 'notification' | 'email' | 'sms' | 'webhook' | 'actuator_control' | 'emergency_stop';
  parameters: Record<string, any>;
}

export interface IoTDataPoint {
  deviceId: string;
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'poor' | 'uncertain';
  metadata?: Record<string, any>;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  sensorId?: string;
  type: 'threshold_exceeded' | 'device_offline' | 'battery_low' | 'maintenance_due' | 'error';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface IoTDashboard {
  id: string;
  name: string;
  description: string;
  widgets: IoTWidget[];
  layout: IoTLayout;
  filters: IoTFilter[];
  refreshInterval: number; // seconds
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface IoTWidget {
  id: string;
  type: 'chart' | 'gauge' | 'map' | 'table' | 'status' | 'alert_list';
  title: string;
  deviceIds: string[];
  sensorTypes: IoTSensorType[];
  timeRange: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'custom';
  position: { x: number; y: number; width: number; height: number };
  configuration: Record<string, any>;
}

export interface IoTLayout {
  columns: number;
  rows: number;
  gridSize: number;
}

export interface IoTFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface IoTAnalytics {
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  dataPointsToday: number;
  alertsToday: number;
  batteryAlerts: number;
  maintenanceAlerts: number;
  performanceMetrics: {
    averageLatency: number;
    dataLossRate: number;
    uptimePercentage: number;
  };
  topAlertingDevices: { deviceId: string; alertCount: number }[];
  energyConsumption: number; // kWh
  carbonFootprint: number; // kg CO2
}

class IoTEngine {
  private devices: Map<string, IoTDevice> = new Map();
  private dataBuffer: Map<string, IoTDataPoint[]> = new Map();
  private alerts: Map<string, IoTAlert> = new Map();
  private subscriptions: Map<string, Set<(data: IoTDataPoint) => void>> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeIoTEngine();
    this.setupWebSocketConnection();
    this.startDataCollection();
  }

  /**
   * Initialize IoT engine
   */
  private async initializeIoTEngine(): Promise<void> {
    try {
      console.log('🌐 Initializing IoT Engine...');

      // Load registered devices
      await this.loadRegisteredDevices();

      // Initialize data collection
      this.initializeDataCollection();

      // Set up alert monitoring
      this.setupAlertMonitoring();

      // Start device discovery
      this.startDeviceDiscovery();

      performanceMonitor.recordMetric('iot_engine_init', performance.now(), 'ms');

      console.log('✅ IoT Engine Initialized Successfully');

    } catch (error) {
      console.error('❌ Error initializing IoT Engine:', error);
    }
  }

  /**
   * Load registered devices from database
   */
  private async loadRegisteredDevices(): Promise<void> {
    try {
      // Mock devices for demonstration
      const mockDevices: IoTDevice[] = [
        {
          id: 'excavator-001',
          name: 'Caterpillar 320 Excavator',
          type: IoTDeviceType.EXCAVATOR,
          category: IoTCategory.HEAVY_EQUIPMENT,
          manufacturer: 'Caterpillar',
          model: '320',
          firmwareVersion: '2.1.5',
          status: IoTStatus.ACTIVE,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            altitude: 10,
            zone: 'Zone A',
            precision: 5,
            lastUpdated: new Date()
          },
          connectivity: {
            protocol: 'cellular',
            signalStrength: -80,
            dataRate: 10.5,
            latency: 45,
            isConnected: true,
            lastConnected: new Date(),
            networkInfo: {
              carrier: 'Verizon'
            }
          },
          specifications: {
            dimensions: { width: 3.2, height: 3.8, depth: 8.5, weight: 32000 },
            powerRequirements: { voltage: 24, current: 120, powerConsumption: 2880 },
            operatingConditions: {
              temperatureRange: { min: -20, max: 50 },
              humidityRange: { min: 0, max: 95 },
              ipRating: 'IP65',
              certifications: ['CE', 'FCC', 'ISO9001']
            },
            dataRate: { samplingFrequency: 1, dataSize: 256, storageCapacity: 32 }
          },
          sensors: [
            {
              id: 'temp-001',
              type: IoTSensorType.ENGINE_TEMPERATURE,
              unit: '°C',
              range: { min: -40, max: 150 },
              accuracy: 0.5,
              resolution: 0.1,
              calibrationDate: new Date('2024-01-01'),
              isEnabled: true,
              thresholds: [
                {
                  id: 'temp-high',
                  name: 'High Temperature',
                  condition: 'greater_than',
                  value: 95,
                  severity: 'warning',
                  actions: [
                    { type: 'notification', parameters: { message: 'Engine temperature high' } }
                  ],
                  isEnabled: true
                }
              ]
            },
            {
              id: 'fuel-001',
              type: IoTSensorType.FUEL_LEVEL,
              unit: '%',
              range: { min: 0, max: 100 },
              accuracy: 1,
              resolution: 0.1,
              calibrationDate: new Date('2024-01-01'),
              isEnabled: true,
              thresholds: [
                {
                  id: 'fuel-low',
                  name: 'Low Fuel',
                  condition: 'less_than',
                  value: 20,
                  severity: 'warning',
                  actions: [
                    { type: 'notification', parameters: { message: 'Fuel level low' } }
                  ],
                  isEnabled: true
                }
              ]
            }
          ],
          actuators: [
            {
              id: 'alarm-001',
              type: IoTActuatorType.ALARM,
              isEnabled: true,
              currentState: false,
              supportedCommands: ['activate', 'deactivate', 'test']
            }
          ],
          lastSeen: new Date(),
          batteryLevel: 85,
          metadata: {
            operator: 'John Smith',
            project: 'Highway Bridge Construction',
            maintenanceSchedule: '2025-03-01'
          }
        },
        {
          id: 'weather-001',
          name: 'Site Weather Station',
          type: IoTDeviceType.WEATHER_STATION,
          category: IoTCategory.ENVIRONMENTAL,
          manufacturer: 'Davis Instruments',
          model: 'Vantage Pro2',
          firmwareVersion: '1.8.2',
          status: IoTStatus.ONLINE,
          location: {
            latitude: 40.7130,
            longitude: -74.0058,
            altitude: 15,
            zone: 'Zone B',
            precision: 2,
            lastUpdated: new Date()
          },
          connectivity: {
            protocol: 'wifi',
            signalStrength: -65,
            dataRate: 54,
            latency: 12,
            isConnected: true,
            lastConnected: new Date(),
            networkInfo: {
              ssid: 'ConstructionSite_5G'
            }
          },
          specifications: {
            dimensions: { width: 0.3, height: 0.5, depth: 0.3, weight: 2.5 },
            powerRequirements: { voltage: 12, current: 0.5, powerConsumption: 6 },
            operatingConditions: {
              temperatureRange: { min: -40, max: 70 },
              humidityRange: { min: 0, max: 100 },
              ipRating: 'IP67',
              certifications: ['FCC', 'CE']
            },
            dataRate: { samplingFrequency: 0.1, dataSize: 128, storageCapacity: 16 }
          },
          sensors: [
            {
              id: 'temp-002',
              type: IoTSensorType.TEMPERATURE,
              unit: '°C',
              range: { min: -40, max: 70 },
              accuracy: 0.3,
              resolution: 0.1,
              calibrationDate: new Date('2024-01-01'),
              isEnabled: true,
              thresholds: []
            },
            {
              id: 'hum-001',
              type: IoTSensorType.HUMIDITY,
              unit: '%',
              range: { min: 0, max: 100 },
              accuracy: 2,
              resolution: 0.1,
              calibrationDate: new Date('2024-01-01'),
              isEnabled: true,
              thresholds: []
            }
          ],
          actuators: [],
          lastSeen: new Date(),
          metadata: {
            installationDate: '2024-01-15',
            maintenanceInterval: '6 months'
          }
        }
      ];

      for (const device of mockDevices) {
        this.devices.set(device.id, device);
        this.dataBuffer.set(device.id, []);
      }

      console.log(`📱 Loaded ${mockDevices.length} IoT devices`);

    } catch (error) {
      console.error('Error loading registered devices:', error);
    }
  }

  /**
   * Initialize data collection system
   */
  private initializeDataCollection(): void {
    // Set up data collection intervals for each device
    for (const [deviceId, device] of this.devices) {
      if (device.status === IoTStatus.ONLINE || device.status === IoTStatus.ACTIVE) {
        this.startDeviceDataCollection(deviceId);
      }
    }
  }

  /**
   * Start data collection for a specific device
   */
  private startDeviceDataCollection(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    const interval = 1000 / device.specifications.dataRate.samplingFrequency;

    setInterval(() => {
      this.collectDeviceData(deviceId);
    }, interval);
  }

  /**
   * Collect data from a device
   */
  private async collectDeviceData(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device || device.status === IoTStatus.OFFLINE) return;

    try {
      // Simulate sensor data collection
      for (const sensor of device.sensors) {
        if (!sensor.isEnabled) continue;

        const dataPoint: IoTDataPoint = {
          deviceId,
          sensorId: sensor.id,
          timestamp: new Date(),
          value: this.generateSensorValue(sensor),
          unit: sensor.unit,
          quality: 'good'
        };

        // Add to buffer
        const buffer = this.dataBuffer.get(deviceId) || [];
        buffer.push(dataPoint);

        // Keep only last 1000 points per device
        if (buffer.length > 1000) {
          buffer.shift();
        }

        this.dataBuffer.set(deviceId, buffer);

        // Check thresholds
        this.checkThresholds(device, sensor, dataPoint);

        // Notify subscribers
        this.notifySubscribers(deviceId, dataPoint);

        // Send to cloud if connected
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({
            type: 'data',
            payload: dataPoint
          }));
        }
      }

      // Update last seen timestamp
      device.lastSeen = new Date();

    } catch (error) {
      console.error(`Error collecting data from device ${deviceId}:`, error);
    }
  }

  /**
   * Generate realistic sensor values
   */
  private generateSensorValue(sensor: IoTSensor): number {
    const { min, max } = sensor.range;
    let baseValue: number;

    switch (sensor.type) {
      case IoTSensorType.TEMPERATURE:
        baseValue = 22 + Math.sin(Date.now() / 3600000) * 10; // Daily temperature cycle
        break;
      case IoTSensorType.ENGINE_TEMPERATURE:
        baseValue = 85 + Math.random() * 10; // Engine temp
        break;
      case IoTSensorType.FUEL_LEVEL:
        baseValue = Math.max(0, 100 - (Date.now() % 86400000) / 864000); // Decreasing fuel
        break;
      case IoTSensorType.HUMIDITY:
        baseValue = 50 + Math.random() * 30;
        break;
      case IoTSensorType.VIBRATION:
        baseValue = Math.random() * 5;
        break;
      default:
        baseValue = min + Math.random() * (max - min);
    }

    // Add some noise
    const noise = (Math.random() - 0.5) * sensor.resolution * 2;
    const value = Math.max(min, Math.min(max, baseValue + noise));

    return Math.round(value / sensor.resolution) * sensor.resolution;
  }

  /**
   * Check sensor thresholds
   */
  private checkThresholds(device: IoTDevice, sensor: IoTSensor, dataPoint: IoTDataPoint): void {
    for (const threshold of sensor.thresholds) {
      if (!threshold.isEnabled) continue;

      let triggered = false;

      switch (threshold.condition) {
        case 'greater_than':
          triggered = dataPoint.value > (threshold.value as number);
          break;
        case 'less_than':
          triggered = dataPoint.value < (threshold.value as number);
          break;
        case 'equals':
          triggered = dataPoint.value === threshold.value;
          break;
        case 'between':
          if (Array.isArray(threshold.value)) {
            triggered = dataPoint.value >= threshold.value[0] && dataPoint.value <= threshold.value[1];
          }
          break;
      }

      if (triggered) {
        this.triggerAlert(device, sensor, threshold, dataPoint);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(
    device: IoTDevice,
    sensor: IoTSensor,
    threshold: IoTThreshold,
    dataPoint: IoTDataPoint
  ): void {
    const alert: IoTAlert = {
      id: crypto.randomUUID(),
      deviceId: device.id,
      sensorId: sensor.id,
      type: 'threshold_exceeded',
      severity: threshold.severity,
      message: `${threshold.name}: ${dataPoint.value} ${dataPoint.unit}`,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.set(alert.id, alert);

    // Execute threshold actions
    for (const action of threshold.actions) {
      this.executeAction(action, alert);
    }

    console.log(`🚨 Alert triggered: ${alert.message} on device ${device.name}`);
  }

  /**
   * Execute an alert action
   */
  private async executeAction(action: IoTAction, alert: IoTAlert): Promise<void> {
    try {
      switch (action.type) {
        case 'notification':
          this.sendNotification(action.parameters.message, alert);
          break;
        case 'email':
          await this.sendEmail(action.parameters.to, action.parameters.subject, alert);
          break;
        case 'webhook':
          await this.sendWebhook(action.parameters.url, alert);
          break;
        case 'actuator_control':
          await this.controlActuator(alert.deviceId, action.parameters);
          break;
        case 'emergency_stop':
          await this.emergencyStop(alert.deviceId);
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }

  /**
   * Send notification
   */
  private sendNotification(message: string, alert: IoTAlert): void {
    // Integration with notification system
    console.log(`📢 Notification: ${message}`);
  }

  /**
   * Send email alert
   */
  private async sendEmail(to: string, subject: string, alert: IoTAlert): Promise<void> {
    // Integration with email service
    console.log(`📧 Email sent to ${to}: ${subject}`);
  }

  /**
   * Send webhook
   */
  private async sendWebhook(url: string, alert: IoTAlert): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Control device actuator
   */
  private async controlActuator(deviceId: string, parameters: any): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    const actuator = device.actuators.find(a => a.id === parameters.actuatorId);
    if (!actuator) return;

    console.log(`🎛️ Controlling actuator ${actuator.id} on device ${device.name}`);
    
    // Send command to device
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'actuator_control',
        deviceId,
        actuatorId: actuator.id,
        command: parameters.command,
        value: parameters.value
      }));
    }
  }

  /**
   * Emergency stop for device
   */
  private async emergencyStop(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    console.log(`🛑 Emergency stop triggered for device ${device.name}`);

    // Send emergency stop command
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'emergency_stop',
        deviceId
      }));
    }
  }

  /**
   * Setup WebSocket connection for real-time data
   */
  private setupWebSocketConnection(): void {
    const wsUrl = `${globalInfrastructure.getCurrentRegion().endpoints.api.replace('https', 'wss')}/iot/ws`;
    
    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('🔌 IoT WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

      this.websocket.onclose = () => {
        console.log('🔌 IoT WebSocket disconnected');
        this.stopHeartbeat();
        this.reconnectWebSocket();
      };

      this.websocket.onerror = (error) => {
        console.error('🔌 IoT WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'device_status':
          this.updateDeviceStatus(message.deviceId, message.status);
          break;
        case 'command_response':
          this.handleCommandResponse(message);
          break;
        case 'device_registered':
          this.addDevice(message.device);
          break;
        case 'device_removed':
          this.removeDevice(message.deviceId);
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Reconnect WebSocket
   */
  private reconnectWebSocket(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.setupWebSocketConnection();
      }, delay);
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Setup alert monitoring
   */
  private setupAlertMonitoring(): void {
    // Monitor device connectivity
    setInterval(() => {
      this.checkDeviceConnectivity();
    }, 60000); // Check every minute

    // Monitor battery levels
    setInterval(() => {
      this.checkBatteryLevels();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Check device connectivity
   */
  private checkDeviceConnectivity(): void {
    const now = new Date();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [deviceId, device] of this.devices) {
      const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();
      
      if (timeSinceLastSeen > offlineThreshold && device.status !== IoTStatus.OFFLINE) {
        this.updateDeviceStatus(deviceId, IoTStatus.OFFLINE);
        
        const alert: IoTAlert = {
          id: crypto.randomUUID(),
          deviceId,
          type: 'device_offline',
          severity: 'warning',
          message: `Device ${device.name} is offline`,
          timestamp: now,
          acknowledged: false,
          resolved: false
        };
        
        this.alerts.set(alert.id, alert);
        console.log(`📵 Device ${device.name} went offline`);
      }
    }
  }

  /**
   * Check battery levels
   */
  private checkBatteryLevels(): void {
    for (const [deviceId, device] of this.devices) {
      if (device.batteryLevel !== undefined && device.batteryLevel < 20) {
        const alert: IoTAlert = {
          id: crypto.randomUUID(),
          deviceId,
          type: 'battery_low',
          severity: 'warning',
          message: `Low battery: ${device.batteryLevel}%`,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        };
        
        this.alerts.set(alert.id, alert);
        console.log(`🔋 Low battery on device ${device.name}: ${device.batteryLevel}%`);
      }
    }
  }

  /**
   * Start device discovery
   */
  private startDeviceDiscovery(): void {
    // Simulate device discovery
    setInterval(() => {
      this.discoverNewDevices();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Discover new devices
   */
  private async discoverNewDevices(): Promise<void> {
    // In a real implementation, this would scan for new devices
    // using various protocols (Bluetooth, WiFi, etc.)
    console.log('🔍 Scanning for new IoT devices...');
  }

  /**
   * Update device status
   */
  private updateDeviceStatus(deviceId: string, status: IoTStatus): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      console.log(`📱 Device ${device.name} status: ${status}`);
    }
  }

  /**
   * Handle command response
   */
  private handleCommandResponse(message: any): void {
    console.log(`📡 Command response from ${message.deviceId}:`, message.response);
  }

  /**
   * Add new device
   */
  addDevice(device: IoTDevice): void {
    this.devices.set(device.id, device);
    this.dataBuffer.set(device.id, []);
    
    if (device.status === IoTStatus.ONLINE || device.status === IoTStatus.ACTIVE) {
      this.startDeviceDataCollection(device.id);
    }
    
    console.log(`➕ Added new IoT device: ${device.name}`);
  }

  /**
   * Remove device
   */
  removeDevice(deviceId: string): void {
    this.devices.delete(deviceId);
    this.dataBuffer.delete(deviceId);
    
    console.log(`➖ Removed IoT device: ${deviceId}`);
  }

  /**
   * Get all devices
   */
  getDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: IoTDeviceType): IoTDevice[] {
    return Array.from(this.devices.values()).filter(device => device.type === type);
  }

  /**
   * Get devices by category
   */
  getDevicesByCategory(category: IoTCategory): IoTDevice[] {
    return Array.from(this.devices.values()).filter(device => device.category === category);
  }

  /**
   * Get device data
   */
  getDeviceData(deviceId: string, limit?: number): IoTDataPoint[] {
    const data = this.dataBuffer.get(deviceId) || [];
    return limit ? data.slice(-limit) : data;
  }

  /**
   * Get alerts
   */
  getAlerts(filter?: { deviceId?: string; severity?: string; acknowledged?: boolean }): IoTAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.deviceId) {
        alerts = alerts.filter(alert => alert.deviceId === filter.deviceId);
      }
      if (filter.severity) {
        alerts = alerts.filter(alert => alert.severity === filter.severity);
      }
      if (filter.acknowledged !== undefined) {
        alerts = alerts.filter(alert => alert.acknowledged === filter.acknowledged);
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      
      console.log(`✅ Alert ${alertId} acknowledged by ${userId}`);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, userId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = userId;
      alert.resolvedAt = new Date();
      
      console.log(`🔧 Alert ${alertId} resolved by ${userId}`);
    }
  }

  /**
   * Subscribe to device data
   */
  subscribe(deviceId: string, callback: (data: IoTDataPoint) => void): () => void {
    if (!this.subscriptions.has(deviceId)) {
      this.subscriptions.set(deviceId, new Set());
    }
    
    this.subscriptions.get(deviceId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscriptions.get(deviceId)?.delete(callback);
    };
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(deviceId: string, data: IoTDataPoint): void {
    const subscribers = this.subscriptions.get(deviceId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics(): IoTAnalytics {
    const devices = Array.from(this.devices.values());
    const alerts = Array.from(this.alerts.values());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAlerts = alerts.filter(alert => alert.timestamp >= today);
    const dataPointsToday = Array.from(this.dataBuffer.values())
      .flat()
      .filter(dp => dp.timestamp >= today);

    return {
      deviceCount: devices.length,
      onlineDevices: devices.filter(d => d.status === IoTStatus.ONLINE || d.status === IoTStatus.ACTIVE).length,
      offlineDevices: devices.filter(d => d.status === IoTStatus.OFFLINE).length,
      dataPointsToday: dataPointsToday.length,
      alertsToday: todayAlerts.length,
      batteryAlerts: alerts.filter(a => a.type === 'battery_low' && !a.resolved).length,
      maintenanceAlerts: alerts.filter(a => a.type === 'maintenance_due' && !a.resolved).length,
      performanceMetrics: {
        averageLatency: 45, // Mock value
        dataLossRate: 0.1, // Mock value
        uptimePercentage: 99.5 // Mock value
      },
      topAlertingDevices: this.getTopAlertingDevices(),
      energyConsumption: this.calculateEnergyConsumption(),
      carbonFootprint: this.calculateCarbonFootprint()
    };
  }

  /**
   * Get top alerting devices
   */
  private getTopAlertingDevices(): { deviceId: string; alertCount: number }[] {
    const alertCounts = new Map<string, number>();
    
    for (const alert of this.alerts.values()) {
      const count = alertCounts.get(alert.deviceId) || 0;
      alertCounts.set(alert.deviceId, count + 1);
    }
    
    return Array.from(alertCounts.entries())
      .map(([deviceId, alertCount]) => ({ deviceId, alertCount }))
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, 5);
  }

  /**
   * Calculate energy consumption
   */
  private calculateEnergyConsumption(): number {
    let totalConsumption = 0;
    
    for (const device of this.devices.values()) {
      if (device.status === IoTStatus.ACTIVE || device.status === IoTStatus.ONLINE) {
        totalConsumption += device.specifications.powerRequirements.powerConsumption;
      }
    }
    
    // Convert to kWh (assuming 24 hour operation)
    return (totalConsumption * 24) / 1000;
  }

  /**
   * Calculate carbon footprint
   */
  private calculateCarbonFootprint(): number {
    const energyConsumption = this.calculateEnergyConsumption();
    const carbonIntensity = 0.4; // kg CO2 per kWh (varies by region)
    
    return energyConsumption * carbonIntensity;
  }

  /**
   * Start data collection
   */
  private startDataCollection(): void {
    console.log('📊 IoT Data collection started');
  }

  /**
   * Send command to device
   */
  async sendCommand(deviceId: string, command: string, parameters?: any): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    if (device.status === IoTStatus.OFFLINE) {
      throw new Error('Device is offline');
    }

    try {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'command',
          deviceId,
          command,
          parameters
        }));
        
        console.log(`📡 Command sent to ${device.name}: ${command}`);
        return true;
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }
}

// Export singleton instance
export const iotEngine = new IoTEngine();
export default iotEngine;