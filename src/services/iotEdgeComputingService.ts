// PHASE 15: IoT and Edge Computing Service
// Advanced IoT sensor integration and edge computing for real-time pavement monitoring

export interface IoTDevice {
  id: string;
  name: string;
  type: IoTDeviceType;
  location: DeviceLocation;
  status: DeviceStatus;
  capabilities: DeviceCapabilities;
  configuration: DeviceConfiguration;
  lastSeen: string;
  batteryLevel?: number;
  firmwareVersion: string;
  hardwareVersion: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
}

export interface IoTDeviceType {
  category: 'sensor' | 'gateway' | 'actuator' | 'camera' | 'weather_station' | 'traffic_counter';
  subtype: string;
  protocol: 'mqtt' | 'coap' | 'lorawan' | 'zigbee' | 'wifi' | 'cellular' | 'bluetooth';
  dataFormat: 'json' | 'protobuf' | 'cbor' | 'binary';
  powerSource: 'battery' | 'solar' | 'mains' | 'harvesting';
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  address: string;
  zone: string;
  site: string;
  installation: InstallationDetails;
}

export interface InstallationDetails {
  installedDate: string;
  installedBy: string;
  mountType: 'embedded' | 'surface' | 'pole' | 'wall' | 'underground';
  depth?: number;
  orientation?: number;
  calibrationData?: Record<string, any>;
}

export interface DeviceStatus {
  online: boolean;
  health: 'healthy' | 'warning' | 'critical' | 'offline';
  lastHeartbeat: string;
  uptime: number;
  errorCount: number;
  lastError?: DeviceError;
  performanceMetrics: DeviceMetrics;
}

export interface DeviceError {
  code: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface DeviceMetrics {
  dataTransmissionRate: number;
  signalStrength: number;
  temperature: number;
  humidity: number;
  voltage: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface DeviceCapabilities {
  sensors: SensorCapability[];
  actuators: ActuatorCapability[];
  processing: ProcessingCapability;
  communication: CommunicationCapability;
  storage: StorageCapability;
}

export interface SensorCapability {
  type: 'temperature' | 'humidity' | 'pressure' | 'vibration' | 'strain' | 'moisture' | 'ph' | 'chloride' | 'crack_detection' | 'load_bearing';
  range: { min: number; max: number; unit: string };
  accuracy: number;
  resolution: number;
  samplingRate: number;
  calibrationRequired: boolean;
}

export interface ActuatorCapability {
  type: 'valve' | 'pump' | 'heater' | 'fan' | 'alarm' | 'light' | 'barrier';
  controlType: 'binary' | 'analog' | 'pwm';
  powerRating: number;
  responseTime: number;
}

export interface ProcessingCapability {
  cpu: string;
  memory: number;
  storage: number;
  edgeComputing: boolean;
  aiAcceleration: boolean;
  realTimeProcessing: boolean;
}

export interface CommunicationCapability {
  protocols: string[];
  bandwidth: number;
  range: number;
  powerConsumption: number;
  latency: number;
}

export interface StorageCapability {
  capacity: number;
  type: 'flash' | 'sd' | 'emmc' | 'nvme';
  bufferSize: number;
  compressionSupported: boolean;
}

export interface DeviceConfiguration {
  samplingInterval: number;
  transmissionInterval: number;
  thresholds: AlertThreshold[];
  calibration: CalibrationSettings;
  powerManagement: PowerManagementSettings;
  security: SecuritySettings;
}

export interface AlertThreshold {
  parameter: string;
  warningLevel: number;
  criticalLevel: number;
  hysteresis: number;
  enabled: boolean;
}

export interface CalibrationSettings {
  lastCalibrated: string;
  calibrationInterval: number;
  autoCalibration: boolean;
  calibrationData: Record<string, number>;
  drift: number;
}

export interface PowerManagementSettings {
  sleepMode: boolean;
  sleepInterval: number;
  wakeupTriggers: string[];
  powerSaving: 'aggressive' | 'balanced' | 'performance';
  lowBatteryThreshold: number;
}

export interface SecuritySettings {
  encryption: boolean;
  authentication: boolean;
  certificates: CertificateInfo[];
  keyRotation: boolean;
  firmwareVerification: boolean;
}

export interface CertificateInfo {
  type: 'device' | 'ca' | 'server';
  algorithm: string;
  keyLength: number;
  validFrom: string;
  validTo: string;
  fingerprint: string;
}

export interface SensorData {
  deviceId: string;
  timestamp: string;
  measurements: Measurement[];
  location: DeviceLocation;
  quality: DataQuality;
  processing: ProcessingInfo;
}

export interface Measurement {
  type: string;
  value: number;
  unit: string;
  accuracy: number;
  confidence: number;
  anomaly: boolean;
  processed: boolean;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  outliers: number;
}

export interface ProcessingInfo {
  edgeProcessed: boolean;
  cloudProcessed: boolean;
  algorithms: string[];
  latency: number;
  computeTime: number;
}

export interface EdgeNode {
  id: string;
  name: string;
  type: 'gateway' | 'compute_node' | 'micro_datacenter';
  location: DeviceLocation;
  capabilities: EdgeCapabilities;
  status: EdgeStatus;
  connectedDevices: string[];
  workloads: EdgeWorkload[];
}

export interface EdgeCapabilities {
  compute: ComputeCapability;
  storage: StorageCapability;
  networking: NetworkingCapability;
  aiAcceleration: AIAccelerationCapability;
  containerSupport: boolean;
  kubernetesSupport: boolean;
}

export interface ComputeCapability {
  cpuCores: number;
  cpuFrequency: number;
  architecture: string;
  memory: number;
  gpu?: GPUCapability;
  tpu?: TPUCapability;
}

export interface GPUCapability {
  model: string;
  memory: number;
  computeUnits: number;
  tensorPerformance: number;
}

export interface TPUCapability {
  model: string;
  tops: number;
  precision: string[];
  frameworks: string[];
}

export interface NetworkingCapability {
  interfaces: NetworkInterface[];
  bandwidth: number;
  protocols: string[];
  qosSupport: boolean;
}

export interface NetworkInterface {
  type: 'ethernet' | 'wifi' | 'cellular' | 'lora' | 'zigbee';
  speed: number;
  duplex: boolean;
  poe: boolean;
}

export interface AIAccelerationCapability {
  frameworks: string[];
  models: string[];
  inferenceSpeed: number;
  memoryOptimization: boolean;
  quantization: string[];
}

export interface EdgeStatus {
  online: boolean;
  health: 'healthy' | 'degraded' | 'critical';
  load: ResourceLoad;
  temperature: number;
  uptime: number;
  lastMaintenance: string;
}

export interface ResourceLoad {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

export interface EdgeWorkload {
  id: string;
  name: string;
  type: 'data_processing' | 'ai_inference' | 'data_aggregation' | 'protocol_translation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resources: ResourceRequirements;
  status: 'running' | 'stopped' | 'error' | 'pending';
  metrics: WorkloadMetrics;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  gpu?: number;
  bandwidth: number;
}

export interface WorkloadMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  resourceUtilization: ResourceLoad;
  queueDepth: number;
}

export interface IoTDataPipeline {
  id: string;
  name: string;
  source: DataSource;
  processing: ProcessingStage[];
  destination: DataDestination;
  configuration: PipelineConfiguration;
  metrics: PipelineMetrics;
}

export interface DataSource {
  type: 'device' | 'gateway' | 'stream' | 'batch';
  deviceIds?: string[];
  protocol: string;
  format: string;
  compression?: string;
  encryption?: boolean;
}

export interface ProcessingStage {
  id: string;
  name: string;
  type: 'filter' | 'transform' | 'aggregate' | 'enrich' | 'validate' | 'ai_inference';
  configuration: Record<string, any>;
  resources: ResourceRequirements;
  enabled: boolean;
}

export interface DataDestination {
  type: 'database' | 'timeseries' | 'object_storage' | 'message_queue' | 'api';
  endpoint: string;
  credentials: string;
  format: string;
  batchSize?: number;
  retention?: number;
}

export interface PipelineConfiguration {
  batchSize: number;
  bufferSize: number;
  timeout: number;
  retryPolicy: RetryPolicy;
  errorHandling: ErrorHandling;
  monitoring: MonitoringConfig;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffMultiplier: number;
  maxBackoffTime: number;
}

export interface ErrorHandling {
  onError: 'retry' | 'skip' | 'deadletter' | 'alert';
  deadLetterQueue?: string;
  alertThreshold: number;
  escalation: boolean;
}

export interface MonitoringConfig {
  metricsEnabled: boolean;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
  healthChecks: boolean;
  alerting: boolean;
}

export interface PipelineMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  dataQuality: number;
  backpressure: number;
  resourceUtilization: ResourceLoad;
}

// PHASE 15: IoT and Edge Computing Service Class
export class IoTEdgeComputingService {
  private devices: Map<string, IoTDevice> = new Map();
  private edgeNodes: Map<string, EdgeNode> = new Map();
  private pipelines: Map<string, IoTDataPipeline> = new Map();
  private sensorData: Map<string, SensorData[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 15: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🌐 Initializing IoT and Edge Computing Service...');
      
      // Setup IoT devices
      await this.setupDefaultDevices();
      
      // Initialize edge nodes
      await this.initializeEdgeNodes();
      
      // Create data pipelines
      await this.setupDataPipelines();
      
      // Start real-time monitoring
      await this.startRealTimeMonitoring();
      
      this.isInitialized = true;
      console.log('✅ IoT and Edge Computing Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize IoT edge computing service:', error);
      throw error;
    }
  }

  // PHASE 15: Setup Default IoT Devices
  private async setupDefaultDevices(): Promise<void> {
    const defaultDevices: IoTDevice[] = [
      // Pavement Strain Sensor
      {
        id: 'strain_sensor_001',
        name: 'Parking Lot Strain Sensor #1',
        type: {
          category: 'sensor',
          subtype: 'strain_gauge',
          protocol: 'lorawan',
          dataFormat: 'json',
          powerSource: 'battery'
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Church Street, New York, NY',
          zone: 'main_parking',
          site: 'community_church',
          installation: {
            installedDate: '2024-01-15',
            installedBy: 'IoT Installation Team',
            mountType: 'embedded',
            depth: 6,
            calibrationData: { baseline: 0.0, sensitivity: 2.5 }
          }
        },
        status: {
          online: true,
          health: 'healthy',
          lastHeartbeat: new Date().toISOString(),
          uptime: 2592000, // 30 days
          errorCount: 0,
          performanceMetrics: {
            dataTransmissionRate: 95.5,
            signalStrength: -65,
            temperature: 22.5,
            humidity: 45.2,
            voltage: 3.7,
            memoryUsage: 34,
            cpuUsage: 12
          }
        },
        capabilities: {
          sensors: [
            {
              type: 'strain',
              range: { min: -1000, max: 1000, unit: 'micro_strain' },
              accuracy: 0.1,
              resolution: 0.01,
              samplingRate: 100,
              calibrationRequired: true
            },
            {
              type: 'temperature',
              range: { min: -40, max: 85, unit: 'celsius' },
              accuracy: 0.5,
              resolution: 0.1,
              samplingRate: 1,
              calibrationRequired: false
            }
          ],
          actuators: [],
          processing: {
            cpu: 'ARM Cortex-M4',
            memory: 256,
            storage: 1024,
            edgeComputing: true,
            aiAcceleration: false,
            realTimeProcessing: true
          },
          communication: {
            protocols: ['lorawan', 'bluetooth'],
            bandwidth: 50,
            range: 15000,
            powerConsumption: 0.1,
            latency: 1000
          },
          storage: {
            capacity: 1024,
            type: 'flash',
            bufferSize: 128,
            compressionSupported: true
          }
        },
        configuration: {
          samplingInterval: 10000, // 10 seconds
          transmissionInterval: 300000, // 5 minutes
          thresholds: [
            {
              parameter: 'strain',
              warningLevel: 800,
              criticalLevel: 950,
              hysteresis: 50,
              enabled: true
            }
          ],
          calibration: {
            lastCalibrated: '2024-01-15',
            calibrationInterval: 2592000000, // 30 days
            autoCalibration: false,
            calibrationData: { offset: 0.0, scale: 1.0 },
            drift: 0.02
          },
          powerManagement: {
            sleepMode: true,
            sleepInterval: 60000,
            wakeupTriggers: ['scheduled', 'threshold'],
            powerSaving: 'balanced',
            lowBatteryThreshold: 20
          },
          security: {
            encryption: true,
            authentication: true,
            certificates: [],
            keyRotation: true,
            firmwareVerification: true
          }
        },
        lastSeen: new Date().toISOString(),
        batteryLevel: 87,
        firmwareVersion: '2.1.4',
        hardwareVersion: '1.2',
        manufacturer: 'PaveTech Sensors',
        model: 'PS-4000',
        serialNumber: 'PT240115001'
      },

      // Weather Station
      {
        id: 'weather_station_001',
        name: 'Main Weather Station',
        type: {
          category: 'weather_station',
          subtype: 'multi_sensor',
          protocol: 'wifi',
          dataFormat: 'json',
          powerSource: 'solar'
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Church Street, New York, NY',
          zone: 'roof_top',
          site: 'community_church',
          installation: {
            installedDate: '2024-01-10',
            installedBy: 'Weather Systems Inc',
            mountType: 'pole',
            orientation: 180,
            calibrationData: { windDirection: 0, barometer: 1013.25 }
          }
        },
        status: {
          online: true,
          health: 'healthy',
          lastHeartbeat: new Date().toISOString(),
          uptime: 2678400, // 31 days
          errorCount: 0,
          performanceMetrics: {
            dataTransmissionRate: 99.2,
            signalStrength: -45,
            temperature: 18.3,
            humidity: 62.1,
            voltage: 12.8,
            memoryUsage: 28,
            cpuUsage: 8
          }
        },
        capabilities: {
          sensors: [
            {
              type: 'temperature',
              range: { min: -40, max: 60, unit: 'celsius' },
              accuracy: 0.2,
              resolution: 0.1,
              samplingRate: 1,
              calibrationRequired: true
            },
            {
              type: 'humidity',
              range: { min: 0, max: 100, unit: 'percent' },
              accuracy: 2,
              resolution: 0.1,
              samplingRate: 1,
              calibrationRequired: true
            },
            {
              type: 'pressure',
              range: { min: 800, max: 1100, unit: 'hPa' },
              accuracy: 0.5,
              resolution: 0.1,
              samplingRate: 1,
              calibrationRequired: true
            }
          ],
          actuators: [],
          processing: {
            cpu: 'ESP32',
            memory: 512,
            storage: 4096,
            edgeComputing: true,
            aiAcceleration: false,
            realTimeProcessing: true
          },
          communication: {
            protocols: ['wifi', 'cellular'],
            bandwidth: 150,
            range: 100,
            powerConsumption: 0.5,
            latency: 200
          },
          storage: {
            capacity: 4096,
            type: 'flash',
            bufferSize: 512,
            compressionSupported: true
          }
        },
        configuration: {
          samplingInterval: 60000, // 1 minute
          transmissionInterval: 300000, // 5 minutes
          thresholds: [
            {
              parameter: 'temperature',
              warningLevel: 35,
              criticalLevel: 40,
              hysteresis: 2,
              enabled: true
            }
          ],
          calibration: {
            lastCalibrated: '2024-01-10',
            calibrationInterval: 7776000000, // 90 days
            autoCalibration: true,
            calibrationData: { temperatureOffset: 0.1, humidityOffset: -1.2 },
            drift: 0.01
          },
          powerManagement: {
            sleepMode: false,
            sleepInterval: 0,
            wakeupTriggers: [],
            powerSaving: 'performance',
            lowBatteryThreshold: 15
          },
          security: {
            encryption: true,
            authentication: true,
            certificates: [],
            keyRotation: true,
            firmwareVerification: true
          }
        },
        lastSeen: new Date().toISOString(),
        firmwareVersion: '3.2.1',
        hardwareVersion: '2.0',
        manufacturer: 'WeatherTech Pro',
        model: 'WS-5000',
        serialNumber: 'WT240110001'
      },

      // Traffic Counter
      {
        id: 'traffic_counter_001',
        name: 'Parking Lot Traffic Counter',
        type: {
          category: 'traffic_counter',
          subtype: 'pneumatic_tube',
          protocol: 'cellular',
          dataFormat: 'json',
          powerSource: 'battery'
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Church Street, New York, NY',
          zone: 'entrance',
          site: 'community_church',
          installation: {
            installedDate: '2024-01-20',
            installedBy: 'Traffic Solutions LLC',
            mountType: 'surface',
            calibrationData: { vehicleThreshold: 50, axleSpacing: 2.5 }
          }
        },
        status: {
          online: true,
          health: 'healthy',
          lastHeartbeat: new Date().toISOString(),
          uptime: 2419200, // 28 days
          errorCount: 0,
          performanceMetrics: {
            dataTransmissionRate: 97.8,
            signalStrength: -72,
            temperature: 25.1,
            humidity: 52.3,
            voltage: 3.6,
            memoryUsage: 41,
            cpuUsage: 15
          }
        },
        capabilities: {
          sensors: [
            {
              type: 'pressure',
              range: { min: 0, max: 10000, unit: 'kPa' },
              accuracy: 1,
              resolution: 0.1,
              samplingRate: 1000,
              calibrationRequired: true
            },
            {
              type: 'vibration',
              range: { min: 0, max: 100, unit: 'g' },
              accuracy: 0.1,
              resolution: 0.01,
              samplingRate: 1000,
              calibrationRequired: false
            }
          ],
          actuators: [],
          processing: {
            cpu: 'ARM Cortex-A7',
            memory: 1024,
            storage: 8192,
            edgeComputing: true,
            aiAcceleration: true,
            realTimeProcessing: true
          },
          communication: {
            protocols: ['cellular', 'wifi'],
            bandwidth: 100,
            range: 5000,
            powerConsumption: 0.8,
            latency: 500
          },
          storage: {
            capacity: 8192,
            type: 'emmc',
            bufferSize: 1024,
            compressionSupported: true
          }
        },
        configuration: {
          samplingInterval: 1000, // 1 second
          transmissionInterval: 3600000, // 1 hour
          thresholds: [],
          calibration: {
            lastCalibrated: '2024-01-20',
            calibrationInterval: 5184000000, // 60 days
            autoCalibration: false,
            calibrationData: { sensitivity: 1.0, deadband: 5 },
            drift: 0.05
          },
          powerManagement: {
            sleepMode: false,
            sleepInterval: 0,
            wakeupTriggers: ['vehicle_detection'],
            powerSaving: 'balanced',
            lowBatteryThreshold: 25
          },
          security: {
            encryption: true,
            authentication: true,
            certificates: [],
            keyRotation: true,
            firmwareVerification: true
          }
        },
        lastSeen: new Date().toISOString(),
        batteryLevel: 73,
        firmwareVersion: '1.8.6',
        hardwareVersion: '3.1',
        manufacturer: 'TrafficSense',
        model: 'TS-2400',
        serialNumber: 'TS240120001'
      }
    ];

    defaultDevices.forEach(device => {
      this.devices.set(device.id, device);
    });

    console.log(`🌐 Setup ${defaultDevices.length} IoT devices`);
  }

  // PHASE 15: Initialize Edge Nodes
  private async initializeEdgeNodes(): Promise<void> {
    const defaultEdgeNodes: EdgeNode[] = [
      // Main Edge Gateway
      {
        id: 'edge_gateway_001',
        name: 'Main Edge Gateway',
        type: 'gateway',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Church Street, New York, NY',
          zone: 'main_building',
          site: 'community_church',
          installation: {
            installedDate: '2024-01-05',
            installedBy: 'Edge Systems Corp',
            mountType: 'wall'
          }
        },
        capabilities: {
          compute: {
            cpuCores: 8,
            cpuFrequency: 2400,
            architecture: 'ARM64',
            memory: 16384,
            gpu: {
              model: 'NVIDIA Jetson Nano',
              memory: 4096,
              computeUnits: 128,
              tensorPerformance: 472
            }
          },
          storage: {
            capacity: 512000,
            type: 'nvme',
            bufferSize: 8192,
            compressionSupported: true
          },
          networking: {
            interfaces: [
              { type: 'ethernet', speed: 1000, duplex: true, poe: false },
              { type: 'wifi', speed: 300, duplex: true, poe: false },
              { type: 'cellular', speed: 100, duplex: true, poe: false },
              { type: 'lora', speed: 50, duplex: false, poe: false }
            ],
            bandwidth: 1000,
            protocols: ['tcp', 'udp', 'mqtt', 'coap', 'lorawan'],
            qosSupport: true
          },
          aiAcceleration: {
            frameworks: ['TensorFlow', 'PyTorch', 'ONNX'],
            models: ['CNN', 'LSTM', 'Transformer'],
            inferenceSpeed: 100,
            memoryOptimization: true,
            quantization: ['INT8', 'FP16']
          },
          containerSupport: true,
          kubernetesSupport: true
        },
        status: {
          online: true,
          health: 'healthy',
          load: {
            cpu: 35,
            memory: 42,
            storage: 28,
            network: 15,
            gpu: 20
          },
          temperature: 58.2,
          uptime: 2678400,
          lastMaintenance: '2024-01-05'
        },
        connectedDevices: ['strain_sensor_001', 'weather_station_001', 'traffic_counter_001'],
        workloads: [
          {
            id: 'sensor_data_processing',
            name: 'Sensor Data Processing',
            type: 'data_processing',
            priority: 'high',
            resources: {
              cpu: 20,
              memory: 25,
              storage: 10,
              bandwidth: 50
            },
            status: 'running',
            metrics: {
              throughput: 1250,
              latency: 45,
              errorRate: 0.1,
              resourceUtilization: {
                cpu: 18,
                memory: 22,
                storage: 8,
                network: 12
              },
              queueDepth: 5
            }
          },
          {
            id: 'ai_anomaly_detection',
            name: 'AI Anomaly Detection',
            type: 'ai_inference',
            priority: 'medium',
            resources: {
              cpu: 15,
              memory: 20,
              storage: 5,
              gpu: 40,
              bandwidth: 20
            },
            status: 'running',
            metrics: {
              throughput: 85,
              latency: 120,
              errorRate: 0.05,
              resourceUtilization: {
                cpu: 12,
                memory: 18,
                storage: 3,
                network: 8,
                gpu: 35
              },
              queueDepth: 2
            }
          }
        ]
      }
    ];

    defaultEdgeNodes.forEach(node => {
      this.edgeNodes.set(node.id, node);
    });

    console.log(`🏗️ Initialized ${defaultEdgeNodes.length} edge nodes`);
  }

  // PHASE 15: Setup Data Pipelines
  private async setupDataPipelines(): Promise<void> {
    const defaultPipelines: IoTDataPipeline[] = [
      {
        id: 'sensor_data_pipeline',
        name: 'Real-time Sensor Data Pipeline',
        source: {
          type: 'device',
          deviceIds: ['strain_sensor_001', 'weather_station_001', 'traffic_counter_001'],
          protocol: 'mqtt',
          format: 'json',
          compression: 'gzip',
          encryption: true
        },
        processing: [
          {
            id: 'data_validation',
            name: 'Data Validation',
            type: 'validate',
            configuration: {
              schema: 'sensor_data_v1',
              required_fields: ['deviceId', 'timestamp', 'measurements'],
              value_ranges: {
                temperature: { min: -50, max: 60 },
                humidity: { min: 0, max: 100 }
              }
            },
            resources: {
              cpu: 5,
              memory: 10,
              storage: 0,
              bandwidth: 10
            },
            enabled: true
          },
          {
            id: 'anomaly_detection',
            name: 'Anomaly Detection',
            type: 'ai_inference',
            configuration: {
              model: 'isolation_forest',
              threshold: 0.8,
              window_size: 100,
              features: ['strain', 'temperature', 'pressure']
            },
            resources: {
              cpu: 20,
              memory: 50,
              storage: 5,
              bandwidth: 5
            },
            enabled: true
          },
          {
            id: 'data_enrichment',
            name: 'Data Enrichment',
            type: 'enrich',
            configuration: {
              weather_api: true,
              location_context: true,
              historical_comparison: true,
              alert_generation: true
            },
            resources: {
              cpu: 10,
              memory: 20,
              storage: 2,
              bandwidth: 15
            },
            enabled: true
          }
        ],
        destination: {
          type: 'timeseries',
          endpoint: 'influxdb://timeseries.pavemaster.com:8086/iot_data',
          credentials: 'iot_pipeline_credentials',
          format: 'line_protocol',
          batchSize: 100,
          retention: 31536000 // 1 year
        },
        configuration: {
          batchSize: 50,
          bufferSize: 1000,
          timeout: 30000,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            backoffMultiplier: 2,
            maxBackoffTime: 30000
          },
          errorHandling: {
            onError: 'retry',
            deadLetterQueue: 'failed_sensor_data',
            alertThreshold: 10,
            escalation: true
          },
          monitoring: {
            metricsEnabled: true,
            loggingLevel: 'info',
            healthChecks: true,
            alerting: true
          }
        },
        metrics: {
          throughput: 1200,
          latency: 85,
          errorRate: 0.2,
          dataQuality: 98.5,
          backpressure: 5,
          resourceUtilization: {
            cpu: 35,
            memory: 80,
            storage: 7,
            network: 30
          }
        }
      }
    ];

    defaultPipelines.forEach(pipeline => {
      this.pipelines.set(pipeline.id, pipeline);
    });

    console.log(`🔄 Setup ${defaultPipelines.length} data pipelines`);
  }

  // PHASE 15: Start Real-time Monitoring
  private async startRealTimeMonitoring(): Promise<void> {
    // Simulate sensor data generation
    setInterval(async () => {
      await this.generateSensorData();
      await this.processEdgeWorkloads();
      await this.updateDeviceStatus();
    }, 5000); // Every 5 seconds

    console.log('📡 Started real-time IoT monitoring');
  }

  // PHASE 15: Generate Sensor Data
  private async generateSensorData(): Promise<void> {
    for (const device of this.devices.values()) {
      if (!device.status.online) continue;

      const sensorData: SensorData = {
        deviceId: device.id,
        timestamp: new Date().toISOString(),
        measurements: [],
        location: device.location,
        quality: {
          completeness: 95 + Math.random() * 5,
          accuracy: 90 + Math.random() * 10,
          consistency: 92 + Math.random() * 8,
          timeliness: 98 + Math.random() * 2,
          validity: 96 + Math.random() * 4,
          outliers: Math.floor(Math.random() * 3)
        },
        processing: {
          edgeProcessed: true,
          cloudProcessed: false,
          algorithms: ['validation', 'filtering'],
          latency: 50 + Math.random() * 100,
          computeTime: 10 + Math.random() * 40
        }
      };

      // Generate measurements based on device capabilities
      for (const sensor of device.capabilities.sensors) {
        let value: number;
        
        switch (sensor.type) {
          case 'strain':
            value = Math.random() * 200 - 100; // -100 to 100 micro_strain
            break;
          case 'temperature':
            value = 20 + Math.random() * 10; // 20-30°C
            break;
          case 'humidity':
            value = 40 + Math.random() * 30; // 40-70%
            break;
          case 'pressure':
            value = 1000 + Math.random() * 50; // 1000-1050 hPa
            break;
          case 'vibration':
            value = Math.random() * 5; // 0-5 g
            break;
          default:
            value = Math.random() * 100;
        }

        sensorData.measurements.push({
          type: sensor.type,
          value: parseFloat(value.toFixed(2)),
          unit: sensor.range.unit,
          accuracy: sensor.accuracy,
          confidence: 85 + Math.random() * 15,
          anomaly: Math.random() < 0.05, // 5% chance of anomaly
          processed: true
        });
      }

      // Store sensor data
      const deviceData = this.sensorData.get(device.id) || [];
      deviceData.push(sensorData);
      
      // Keep only last 1000 data points
      if (deviceData.length > 1000) {
        deviceData.shift();
      }
      
      this.sensorData.set(device.id, deviceData);

      // Check for alerts
      await this.checkSensorAlerts(device, sensorData);
    }
  }

  // PHASE 15: Process Edge Workloads
  private async processEdgeWorkloads(): Promise<void> {
    for (const edgeNode of this.edgeNodes.values()) {
      for (const workload of edgeNode.workloads) {
        // Update workload metrics
        workload.metrics.throughput = Math.max(0, workload.metrics.throughput + (Math.random() - 0.5) * 100);
        workload.metrics.latency = Math.max(10, workload.metrics.latency + (Math.random() - 0.5) * 20);
        workload.metrics.errorRate = Math.max(0, Math.min(5, workload.metrics.errorRate + (Math.random() - 0.5) * 0.1));
        workload.metrics.queueDepth = Math.max(0, workload.metrics.queueDepth + Math.floor((Math.random() - 0.5) * 3));
        
        // Update resource utilization
        workload.metrics.resourceUtilization.cpu = Math.max(0, Math.min(100, 
          workload.metrics.resourceUtilization.cpu + (Math.random() - 0.5) * 10));
        workload.metrics.resourceUtilization.memory = Math.max(0, Math.min(100, 
          workload.metrics.resourceUtilization.memory + (Math.random() - 0.5) * 8));
      }
      
      // Update edge node status
      const totalCpu = edgeNode.workloads.reduce((sum, w) => sum + w.metrics.resourceUtilization.cpu, 0);
      const totalMemory = edgeNode.workloads.reduce((sum, w) => sum + w.metrics.resourceUtilization.memory, 0);
      
      edgeNode.status.load.cpu = Math.min(100, totalCpu / edgeNode.workloads.length);
      edgeNode.status.load.memory = Math.min(100, totalMemory / edgeNode.workloads.length);
      edgeNode.status.temperature = 45 + Math.random() * 20;
    }
  }

  // PHASE 15: Update Device Status
  private async updateDeviceStatus(): Promise<void> {
    for (const device of this.devices.values()) {
      // Update performance metrics
      device.status.performanceMetrics.dataTransmissionRate = Math.max(80, Math.min(100, 
        device.status.performanceMetrics.dataTransmissionRate + (Math.random() - 0.5) * 5));
      device.status.performanceMetrics.signalStrength = Math.max(-90, Math.min(-30, 
        device.status.performanceMetrics.signalStrength + (Math.random() - 0.5) * 10));
      device.status.performanceMetrics.temperature = Math.max(-10, Math.min(50, 
        device.status.performanceMetrics.temperature + (Math.random() - 0.5) * 3));
      
      // Update battery level if applicable
      if (device.batteryLevel !== undefined) {
        device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 0.1);
      }
      
      // Update health status
      if (device.batteryLevel && device.batteryLevel < 20) {
        device.status.health = 'warning';
      } else if (device.status.performanceMetrics.dataTransmissionRate < 85) {
        device.status.health = 'warning';
      } else {
        device.status.health = 'healthy';
      }
      
      device.status.lastHeartbeat = new Date().toISOString();
      device.lastSeen = new Date().toISOString();
    }
  }

  // PHASE 15: Check Sensor Alerts
  private async checkSensorAlerts(device: IoTDevice, sensorData: SensorData): Promise<void> {
    for (const threshold of device.configuration.thresholds) {
      if (!threshold.enabled) continue;
      
      const measurement = sensorData.measurements.find(m => m.type === threshold.parameter);
      if (!measurement) continue;
      
      if (measurement.value >= threshold.criticalLevel) {
        console.log(`🚨 CRITICAL Alert: ${device.name} - ${threshold.parameter} = ${measurement.value} (threshold: ${threshold.criticalLevel})`);
      } else if (measurement.value >= threshold.warningLevel) {
        console.log(`⚠️ WARNING Alert: ${device.name} - ${threshold.parameter} = ${measurement.value} (threshold: ${threshold.warningLevel})`);
      }
    }
  }

  // PHASE 15: Public API Methods
  async getDevices(): Promise<IoTDevice[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(deviceId: string): Promise<IoTDevice | null> {
    return this.devices.get(deviceId) || null;
  }

  async getDeviceData(deviceId: string, limit: number = 100): Promise<SensorData[]> {
    const data = this.sensorData.get(deviceId) || [];
    return data.slice(-limit);
  }

  async getEdgeNodes(): Promise<EdgeNode[]> {
    return Array.from(this.edgeNodes.values());
  }

  async getEdgeNode(nodeId: string): Promise<EdgeNode | null> {
    return this.edgeNodes.get(nodeId) || null;
  }

  async getPipelines(): Promise<IoTDataPipeline[]> {
    return Array.from(this.pipelines.values());
  }

  async getPipelineMetrics(pipelineId: string): Promise<PipelineMetrics | null> {
    const pipeline = this.pipelines.get(pipelineId);
    return pipeline ? pipeline.metrics : null;
  }

  async deployWorkload(nodeId: string, workload: Omit<EdgeWorkload, 'id' | 'status' | 'metrics'>): Promise<string> {
    const edgeNode = this.edgeNodes.get(nodeId);
    if (!edgeNode) {
      throw new Error(`Edge node ${nodeId} not found`);
    }

    const newWorkload: EdgeWorkload = {
      ...workload,
      id: `workload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'running',
      metrics: {
        throughput: 0,
        latency: 0,
        errorRate: 0,
        resourceUtilization: { cpu: 0, memory: 0, storage: 0, network: 0 },
        queueDepth: 0
      }
    };

    edgeNode.workloads.push(newWorkload);
    console.log(`🚀 Deployed workload ${newWorkload.name} to edge node ${edgeNode.name}`);
    
    return newWorkload.id;
  }

  async configureDevice(deviceId: string, configuration: Partial<DeviceConfiguration>): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    Object.assign(device.configuration, configuration);
    console.log(`⚙️ Updated configuration for device ${device.name}`);
  }

  async getNetworkTopology(): Promise<{
    devices: IoTDevice[];
    edgeNodes: EdgeNode[];
    connections: Array<{ from: string; to: string; type: string }>;
  }> {
    const devices = Array.from(this.devices.values());
    const edgeNodes = Array.from(this.edgeNodes.values());
    const connections: Array<{ from: string; to: string; type: string }> = [];

    // Create device-to-edge connections
    for (const edgeNode of edgeNodes) {
      for (const deviceId of edgeNode.connectedDevices) {
        connections.push({
          from: deviceId,
          to: edgeNode.id,
          type: 'data_flow'
        });
      }
    }

    return { devices, edgeNodes, connections };
  }

  // PHASE 15: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up IoT and Edge Computing Service...');
    
    this.devices.clear();
    this.edgeNodes.clear();
    this.pipelines.clear();
    this.sensorData.clear();
    
    console.log('✅ IoT and Edge Computing Service cleanup completed');
  }
}

// PHASE 15: Export singleton instance
export const iotEdgeComputingService = new IoTEdgeComputingService();
export default iotEdgeComputingService;