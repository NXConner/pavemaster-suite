// ============================================================================
// CORE TYPE DEFINITIONS - PaveMaster Suite
// ============================================================================

// Enhanced User Management Types
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  permissions: Permission[];
  preferences: UserPreferences;
  profile: UserProfile;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'crew_leader'
  | 'crew_member'
  | 'driver'
  | 'inspector'
  | 'estimator'
  | 'client';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  level: PermissionLevel;
}

export type PermissionCategory =
  | 'projects'
  | 'equipment'
  | 'employees'
  | 'financial'
  | 'settings'
  | 'reports'
  | 'system';

export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';

export interface UserPreferences {
  theme: ThemeMode;
  language: SupportedLanguage;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  jargonMode: JargonMode;
  wallpaper: string;
  displayDensity: 'compact' | 'comfortable' | 'spacious';
}

export interface UserProfile {
  company?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  certifications?: Certification[];
  skills?: string[];
  bio?: string;
}

// Enhanced Project Management Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  phase: ProjectPhase;
  client: ClientInfo;
  location: ProjectLocation;
  scope: ProjectScope;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  team: ProjectTeam;
  equipment: EquipmentAssignment[];
  materials: MaterialRequirement[];
  safety: SafetyInfo;
  quality: QualityMetrics;
  weather: WeatherRequirements;
  permits: Permit[];
  documents: ProjectDocument[];
  progress: ProjectProgress;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export type ProjectType =
  | 'asphalt_paving'
  | 'sealcoating'
  | 'line_striping'
  | 'repair'
  | 'maintenance'
  | 'inspection'
  | 'consultation';

export type ProjectStatus =
  | 'draft'
  | 'quoted'
  | 'approved'
  | 'scheduled'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'warranty';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type ProjectPhase =
  | 'planning'
  | 'preparation'
  | 'mobilization'
  | 'execution'
  | 'quality_control'
  | 'cleanup'
  | 'closeout';

// Equipment and Fleet Types
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  make: string;
  model: string;
  year: number;
  serialNumber: string;
  licensePlate?: string;
  vin?: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location: Location;
  operator?: OperatorInfo;
  maintenance: MaintenanceInfo;
  telemetrics: TelemetricsData;
  specifications: EquipmentSpecs;
  costs: EquipmentCosts;
  insurance: InsuranceInfo;
  inspection: InspectionInfo;
  attachments: EquipmentAttachment[];
  documents: EquipmentDocument[];
  alerts: EquipmentAlert[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentType =
  | 'paver'
  | 'roller'
  | 'truck'
  | 'distributor'
  | 'sweeper'
  | 'crack_sealer'
  | 'striping_machine'
  | 'excavator'
  | 'loader'
  | 'milling_machine'
  | 'compactor'
  | 'trailer'
  | 'generator'
  | 'tool';

export type EquipmentCategory =
  | 'heavy_machinery'
  | 'vehicles'
  | 'tools'
  | 'safety_equipment'
  | 'testing_equipment';

export type EquipmentStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'repair'
  | 'offline'
  | 'retired';

export type EquipmentCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'critical';

// Financial and Cost Types
export interface FinancialData {
  revenue: MonetaryAmount;
  expenses: ExpenseBreakdown;
  profit: MonetaryAmount;
  profitMargin: number;
  costPerUnit: MonetaryAmount;
  budget: BudgetInfo;
  forecast: FinancialForecast;
  variance: VarianceAnalysis;
  kpis: FinancialKPI[];
  trends: FinancialTrend[];
}

export interface MonetaryAmount {
  amount: number;
  currency: Currency;
  formatted: string;
}

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP';

// Location and Geographic Types
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  address?: Address;
  zone?: string;
  region?: string;
  weather?: WeatherData;
  timestamp: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// AI and Analytics Types
export interface AIAnalysis {
  id: string;
  type: AnalysisType;
  input: any;
  output: AIOutput;
  confidence: number;
  model: AIModel;
  processingTime: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export type AnalysisType =
  | 'cost_prediction'
  | 'quality_assessment'
  | 'weather_impact'
  | 'resource_optimization'
  | 'risk_analysis'
  | 'performance_prediction';

export interface AIOutput {
  prediction?: any;
  recommendation?: string;
  insights?: Insight[];
  visualizations?: Visualization[];
  confidence: number;
  explanation?: string;
}

// Weather and Environmental Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  conditions: WeatherCondition;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  suitability: WeatherSuitability;
  timestamp: Date;
}

export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'storm'
  | 'extreme';

export interface WeatherSuitability {
  paving: SuitabilityLevel;
  sealcoating: SuitabilityLevel;
  striping: SuitabilityLevel;
  general: SuitabilityLevel;
  reasons: string[];
}

export type SuitabilityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unsuitable';

// IoT and Sensor Types
export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  firmware: string;
  status: DeviceStatus;
  battery: BatteryInfo;
  connectivity: ConnectivityInfo;
  sensors: Sensor[];
  location: Location;
  configuration: DeviceConfiguration;
  data: SensorData[];
  alerts: DeviceAlert[];
  metadata: Record<string, any>;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DeviceType =
  | 'gps_tracker'
  | 'temperature_sensor'
  | 'pressure_sensor'
  | 'fuel_monitor'
  | 'camera'
  | 'accelerometer'
  | 'engine_monitor'
  | 'environmental_sensor';

export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';

// Safety and Compliance Types
export interface SafetyRecord {
  id: string;
  type: SafetyRecordType;
  severity: SafetySeverity;
  description: string;
  location: Location;
  personnel: PersonnelInvolved[];
  equipment?: EquipmentInvolved[];
  injuries?: InjuryDetails[];
  actions: SafetyAction[];
  investigation: Investigation;
  compliance: ComplianceCheck;
  documents: SafetyDocument[];
  status: SafetyStatus;
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export type SafetyRecordType =
  | 'incident'
  | 'near_miss'
  | 'inspection'
  | 'training'
  | 'audit'
  | 'violation';

export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';

// Communication and Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  status: NotificationStatus;
  data: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export type NotificationType =
  | 'alert'
  | 'reminder'
  | 'update'
  | 'emergency'
  | 'system'
  | 'marketing';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationChannel = 'app' | 'email' | 'sms' | 'push' | 'webhook';

// Jargon and Localization Types
export type JargonMode = 'civilian' | 'military' | 'hybrid';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt';

export interface JargonTerm {
  civilian: string;
  military: string;
  context: string;
  category: JargonCategory;
}

export type JargonCategory =
  | 'general'
  | 'operations'
  | 'equipment'
  | 'navigation'
  | 'communication'
  | 'safety'
  | 'status';

// Theme and UI Types
export type ThemeMode = 'light' | 'dark' | 'system' | 'isac' | 'defcon' | 'overwatch';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  wallpaper: string;
  tacticalGrid: boolean;
  animations: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  digest: 'immediate' | 'hourly' | 'daily' | 'weekly';
  categories: Record<NotificationCategory, boolean>;
}

export interface DashboardPreferences {
  layout: 'grid' | 'list' | 'tactical';
  widgets: DashboardWidget[];
  autoRefresh: boolean;
  refreshInterval: number;
  showMetrics: boolean;
  showWeather: boolean;
  showAlerts: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, any>;
  visible: boolean;
}

export type WidgetType =
  | 'metrics'
  | 'chart'
  | 'map'
  | 'table'
  | 'alert'
  | 'weather'
  | 'equipment'
  | 'project';

// Data structures for common use cases
export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  number: string;
  issuedAt: Date;
  expiresAt: Date;
  verified: boolean;
}

export interface ClientInfo {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'government';
  contact: ContactInfo;
  billing: BillingInfo;
  preferences: ClientPreferences;
}

export interface ContactInfo {
  primary: ContactPerson;
  billing?: ContactPerson;
  emergency?: ContactPerson;
}

export interface ContactPerson {
  name: string;
  title?: string;
  email: string;
  phone: string;
  mobile?: string;
}

export interface BillingInfo {
  method: 'net30' | 'net60' | 'immediate' | 'milestone';
  terms: string;
  taxId?: string;
  creditLimit?: MonetaryAmount;
}

export interface ClientPreferences {
  communicationMethod: 'email' | 'phone' | 'app';
  reportingFrequency: 'daily' | 'weekly' | 'milestone' | 'completion';
  documentation: 'minimal' | 'standard' | 'comprehensive';
}

export interface ProjectLocation {
  primary: Location;
  secondary?: Location[];
  accessPoints: AccessPoint[];
  restrictions: LocationRestriction[];
  permits: LocationPermit[];
}

export interface AccessPoint {
  name: string;
  location: Location;
  type: 'main' | 'emergency' | 'equipment' | 'material';
  restrictions?: string[];
}

export interface LocationRestriction {
  type: 'time' | 'noise' | 'traffic' | 'environmental';
  description: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
}

export interface LocationPermit {
  number: string;
  type: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  conditions: string[];
}

export interface ProjectScope {
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acres';
  thickness?: number;
  thicknessUnit?: 'inches' | 'mm';
  materials: MaterialSpec[];
  specifications: ProjectSpecification[];
  exclusions: string[];
  assumptions: string[];
}

export interface MaterialSpec {
  material: string;
  quantity: number;
  unit: string;
  grade?: string;
  supplier?: string;
  costPerUnit: MonetaryAmount;
  totalCost: MonetaryAmount;
}

export interface ProjectSpecification {
  category: string;
  requirement: string;
  standard: string;
  tolerance?: string;
  testMethod?: string;
}

export interface ProjectTimeline {
  plannedStart: Date;
  plannedEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  milestones: Milestone[];
  criticalPath: string[];
  buffer: number; // days
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[];
}

export interface ProjectBudget {
  total: MonetaryAmount;
  allocated: BudgetAllocation[];
  spent: MonetaryAmount;
  remaining: MonetaryAmount;
  variance: number; // percentage
  forecast: MonetaryAmount;
  contingency: MonetaryAmount;
}

export interface BudgetAllocation {
  category: BudgetCategory;
  allocated: MonetaryAmount;
  spent: MonetaryAmount;
  remaining: MonetaryAmount;
}

export type BudgetCategory =
  | 'materials'
  | 'labor'
  | 'equipment'
  | 'permits'
  | 'overhead'
  | 'contingency';

export interface ProjectTeam {
  lead: TeamMember;
  members: TeamMember[];
  external: ExternalTeamMember[];
}

export interface TeamMember {
  userId: string;
  role: ProjectRole;
  responsibility: string;
  allocation: number; // percentage
  rate?: MonetaryAmount;
}

export interface ExternalTeamMember {
  name: string;
  company: string;
  role: string;
  contact: ContactInfo;
  rate?: MonetaryAmount;
}

export type ProjectRole =
  | 'project_manager'
  | 'foreman'
  | 'operator'
  | 'laborer'
  | 'inspector'
  | 'supervisor';

export interface EquipmentAssignment {
  equipmentId: string;
  assignedAt: Date;
  unassignedAt?: Date;
  operator?: string;
  purpose: string;
  status: AssignmentStatus;
}

export type AssignmentStatus = 'assigned' | 'in_transit' | 'on_site' | 'completed';

export interface MaterialRequirement {
  materialId: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  supplier?: string;
  status: MaterialStatus;
}

export type MaterialStatus =
  | 'ordered'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'installed';

export interface SafetyInfo {
  plan: SafetyPlan;
  requirements: SafetyRequirement[];
  training: SafetyTraining[];
  equipment: SafetyEquipment[];
  incidents: SafetyIncident[];
}

export interface SafetyPlan {
  id: string;
  version: string;
  approvedBy: string;
  approvedAt: Date;
  hazards: Hazard[];
  controls: SafetyControl[];
  procedures: SafetyProcedure[];
}

export interface Hazard {
  type: HazardType;
  description: string;
  severity: SafetySeverity;
  likelihood: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export type HazardType =
  | 'chemical'
  | 'physical'
  | 'biological'
  | 'ergonomic'
  | 'environmental';

export interface SafetyControl {
  hazardId: string;
  type: ControlType;
  description: string;
  responsibility: string;
  frequency: string;
}

export type ControlType =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export interface SafetyProcedure {
  name: string;
  steps: string[];
  responsibility: string;
  frequency: string;
  documentation: string[];
}

export interface SafetyRequirement {
  category: SafetyCategory;
  requirement: string;
  standard: string;
  mandatory: boolean;
}

export type SafetyCategory =
  | 'ppe'
  | 'training'
  | 'equipment'
  | 'procedure'
  | 'environmental';

export interface SafetyTraining {
  type: string;
  required: boolean;
  frequency: string;
  provider: string;
  certification?: string;
}

export interface SafetyEquipment {
  type: string;
  quantity: number;
  standard: string;
  inspectionFrequency: string;
  replacement: string;
}

export interface SafetyIncident {
  id: string;
  type: IncidentType;
  severity: SafetySeverity;
  description: string;
  location: Location;
  reportedAt: Date;
  reportedBy: string;
  status: IncidentStatus;
}

export type IncidentType = 'injury' | 'near_miss' | 'property_damage' | 'environmental';

export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

export interface QualityMetrics {
  standards: QualityStandard[];
  tests: QualityTest[];
  inspections: QualityInspection[];
  defects: QualityDefect[];
  score: number;
  grade: QualityGrade;
}

export interface QualityStandard {
  name: string;
  specification: string;
  tolerance: string;
  testMethod: string;
  frequency: string;
}

export interface QualityTest {
  id: string;
  standard: string;
  location: Location;
  result: TestResult;
  performedBy: string;
  performedAt: Date;
  equipment: string;
  conditions: Record<string, any>;
}

export interface TestResult {
  value: number;
  unit: string;
  status: 'pass' | 'fail' | 'marginal';
  specification: {
    min?: number;
    max?: number;
    target?: number;
  };
}

export interface QualityInspection {
  id: string;
  type: InspectionType;
  checklist: InspectionItem[];
  score: number;
  status: InspectionStatus;
  inspector: string;
  inspectedAt: Date;
  photos: string[];
  notes: string;
}

export type InspectionType =
  | 'pre_construction'
  | 'in_progress'
  | 'final'
  | 'warranty';

export interface InspectionItem {
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
}

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed';

export interface QualityDefect {
  id: string;
  type: DefectType;
  severity: DefectSeverity;
  location: Location;
  description: string;
  cause?: string;
  correction: string;
  status: DefectStatus;
  detectedAt: Date;
  correctedAt?: Date;
}

export type DefectType =
  | 'surface'
  | 'structural'
  | 'dimensional'
  | 'material'
  | 'workmanship';

export type DefectSeverity = 'minor' | 'major' | 'critical';

export type DefectStatus = 'open' | 'in_progress' | 'resolved' | 'verified';

export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface WeatherRequirements {
  temperature: {
    min: number;
    max: number;
    optimal: number;
  };
  humidity: {
    max: number;
  };
  windSpeed: {
    max: number;
  };
  precipitation: {
    allowed: boolean;
    maxRate: number;
  };
  visibility: {
    min: number;
  };
}

export interface Permit {
  id: string;
  type: PermitType;
  number: string;
  issuer: string;
  status: PermitStatus;
  validFrom: Date;
  validTo: Date;
  conditions: string[];
  cost: MonetaryAmount;
  documents: string[];
}

export type PermitType =
  | 'construction'
  | 'traffic_control'
  | 'environmental'
  | 'business'
  | 'special';

export type PermitStatus =
  | 'applied'
  | 'under_review'
  | 'approved'
  | 'issued'
  | 'expired'
  | 'revoked';

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  version: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnail?: string;
  metadata: DocumentMetadata;
  access: DocumentAccess;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
}

export type DocumentType =
  | 'drawing'
  | 'specification'
  | 'report'
  | 'photo'
  | 'video'
  | 'permit'
  | 'contract'
  | 'invoice';

export type DocumentCategory =
  | 'planning'
  | 'execution'
  | 'quality'
  | 'safety'
  | 'financial'
  | 'legal'
  | 'correspondence';

export interface DocumentMetadata {
  title: string;
  description?: string;
  tags: string[];
  location?: Location;
  capturedAt?: Date;
  equipment?: string;
  author?: string;
  subject?: string;
}

export interface DocumentAccess {
  public: boolean;
  users: string[];
  roles: UserRole[];
  expiresAt?: Date;
}

export interface ProjectProgress {
  overall: number; // percentage
  phases: PhaseProgress[];
  milestones: MilestoneProgress[];
  quality: QualityProgress;
  safety: SafetyProgress;
  budget: BudgetProgress;
  schedule: ScheduleProgress;
  lastUpdated: Date;
}

export interface PhaseProgress {
  phase: ProjectPhase;
  progress: number;
  status: PhaseStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

export interface MilestoneProgress {
  milestoneId: string;
  status: MilestoneStatus;
  progress: number;
  variance: number; // days
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface QualityProgress {
  testsCompleted: number;
  testsPassed: number;
  defectsFound: number;
  defectsResolved: number;
  overallScore: number;
}

export interface SafetyProgress {
  incidentsReported: number;
  incidentsResolved: number;
  trainingCompleted: number;
  inspectionsCompleted: number;
  safetyScore: number;
}

export interface BudgetProgress {
  spent: number; // percentage
  committed: number; // percentage
  variance: number; // percentage
  forecastAccuracy: number; // percentage
}

export interface ScheduleProgress {
  daysElapsed: number;
  daysRemaining: number;
  variance: number; // days
  criticalPathDelay: number; // days
}

// Additional supporting types
export interface OperatorInfo {
  userId: string;
  licenseNumber?: string;
  certifications: string[];
  experience: number; // years
  rating: number; // 1-5
}

export interface MaintenanceInfo {
  schedule: MaintenanceSchedule[];
  history: MaintenanceRecord[];
  nextDue: Date;
  status: MaintenanceStatus;
  costs: MaintenanceCosts;
}

export interface MaintenanceSchedule {
  type: MaintenanceType;
  interval: number;
  intervalUnit: 'hours' | 'days' | 'miles' | 'kilometers';
  lastPerformed?: Date;
  nextDue: Date;
  description: string;
}

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'predictive'
  | 'emergency';

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  description: string;
  performedBy: string;
  performedAt: Date;
  cost: MonetaryAmount;
  parts: MaintenancePart[];
  labor: LaborRecord;
  nextAction?: string;
  nextDue?: Date;
}

export interface MaintenancePart {
  partNumber: string;
  description: string;
  quantity: number;
  cost: MonetaryAmount;
  supplier: string;
}

export interface LaborRecord {
  hours: number;
  rate: MonetaryAmount;
  technician: string;
  description: string;
}

export type MaintenanceStatus = 'current' | 'due' | 'overdue' | 'in_progress';

export interface MaintenanceCosts {
  annual: MonetaryAmount;
  lifetime: MonetaryAmount;
  perHour: MonetaryAmount;
  perMile?: MonetaryAmount;
}

export interface TelemetricsData {
  fuelLevel: number;
  fuelConsumption: number;
  engineHours: number;
  mileage: number;
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
  diagnosticCodes: DiagnosticCode[];
  lastReading: Date;
}

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export interface EquipmentSpecs {
  engine: EngineSpecs;
  dimensions: Dimensions;
  capacities: Capacities;
  performance: PerformanceSpecs;
  features: string[];
}

export interface EngineSpecs {
  make: string;
  model: string;
  displacement: number;
  power: number;
  torque: number;
  fuelType: FuelType;
  emissions: EmissionStandard;
}

export type FuelType = 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'natural_gas';

export type EmissionStandard = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'metric' | 'imperial';
}

export interface Capacities {
  fuel: number;
  hydraulic: number;
  engine: number;
  cooling: number;
  material?: number;
  units: Record<string, string>;
}

export interface PerformanceSpecs {
  maxSpeed: number;
  workingSpeed: number;
  productivity: number;
  productivityUnit: string;
  climbGrade: number;
  turning: number;
}

export interface EquipmentCosts {
  purchase: MonetaryAmount;
  current: MonetaryAmount;
  depreciation: DepreciationInfo;
  operating: OperatingCosts;
  total: TotalCosts;
}

export interface DepreciationInfo {
  method: DepreciationMethod;
  rate: number;
  useful: number; // years
  salvage: MonetaryAmount;
  accumulated: MonetaryAmount;
}

export type DepreciationMethod =
  | 'straight_line'
  | 'declining_balance'
  | 'sum_of_years'
  | 'units_of_production';

export interface OperatingCosts {
  fuel: MonetaryAmount;
  maintenance: MonetaryAmount;
  labor: MonetaryAmount;
  insurance: MonetaryAmount;
  taxes: MonetaryAmount;
  total: MonetaryAmount;
  perHour: MonetaryAmount;
}

export interface TotalCosts {
  ownership: MonetaryAmount;
  operating: MonetaryAmount;
  total: MonetaryAmount;
  perHour: MonetaryAmount;
  perProject: MonetaryAmount;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverage: InsuranceCoverage[];
  premium: MonetaryAmount;
  deductible: MonetaryAmount;
  validFrom: Date;
  validTo: Date;
  claims: InsuranceClaim[];
}

export interface InsuranceCoverage {
  type: CoverageType;
  limit: MonetaryAmount;
  description: string;
}

export type CoverageType =
  | 'liability'
  | 'collision'
  | 'comprehensive'
  | 'theft'
  | 'fire'
  | 'vandalism';

export interface InsuranceClaim {
  id: string;
  date: Date;
  type: CoverageType;
  amount: MonetaryAmount;
  status: ClaimStatus;
  description: string;
}

export type ClaimStatus = 'filed' | 'processing' | 'approved' | 'denied' | 'settled';

export interface InspectionInfo {
  schedule: InspectionSchedule[];
  history: InspectionRecord[];
  nextDue: Date;
  status: InspectionStatus;
  certifications: InspectionCertification[];
}

export interface InspectionSchedule {
  type: InspectionType;
  frequency: string;
  authority: string;
  requirements: string[];
  nextDue: Date;
}

export interface InspectionRecord {
  id: string;
  type: InspectionType;
  inspector: string;
  date: Date;
  result: InspectionResult;
  deficiencies: InspectionDeficiency[];
  certificate?: string;
  validUntil?: Date;
}

export type InspectionResult = 'pass' | 'conditional' | 'fail';

export interface InspectionDeficiency {
  item: string;
  severity: DefectSeverity;
  description: string;
  correctionRequired: boolean;
  correctedAt?: Date;
}

export interface InspectionCertification {
  type: string;
  number: string;
  issuer: string;
  issuedAt: Date;
  expiresAt: Date;
  status: CertificationStatus;
}

export type CertificationStatus = 'valid' | 'expired' | 'suspended' | 'revoked';

export interface EquipmentAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  model: string;
  serialNumber: string;
  status: AttachmentStatus;
  compatibility: string[];
  specifications: Record<string, any>;
}

export type AttachmentType =
  | 'blade'
  | 'bucket'
  | 'hammer'
  | 'auger'
  | 'spreader'
  | 'plow'
  | 'brush'
  | 'lifting';

export type AttachmentStatus = 'attached' | 'detached' | 'maintenance' | 'retired';

export interface EquipmentDocument {
  id: string;
  type: EquipmentDocumentType;
  name: string;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export type EquipmentDocumentType =
  | 'manual'
  | 'warranty'
  | 'insurance'
  | 'registration'
  | 'inspection'
  | 'permit';

export interface EquipmentAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggered: Date;
  acknowledged?: Date;
  resolved?: Date;
  data: Record<string, any>;
}

export type AlertType =
  | 'maintenance'
  | 'performance'
  | 'safety'
  | 'security'
  | 'diagnostic'
  | 'location';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// Utility types for API responses and common patterns
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: APIMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface APIMetadata {
  pagination?: Pagination;
  sorting?: Sorting;
  filtering?: Filtering;
  timing?: Timing;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Sorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Filtering {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startswith'
  | 'endswith';

export interface Timing {
  requestTime: Date;
  responseTime: Date;
  duration: number; // milliseconds
}

// Event and logging types
export interface SystemEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  source: EventSource;
  user?: string;
  data: Record<string, any>;
  timestamp: Date;
  level: EventLevel;
  message: string;
}

export type EventType =
  | 'user_action'
  | 'system_action'
  | 'error'
  | 'performance'
  | 'security'
  | 'audit';

export type EventCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'system_configuration'
  | 'performance'
  | 'error';

export type EventSource =
  | 'web_app'
  | 'mobile_app'
  | 'api'
  | 'background_job'
  | 'external_system';

export type EventLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// Chart and visualization types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  type?: ChartType;
}

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'bubble';

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  title?: ChartTitle;
  legend?: ChartLegend;
  scales?: ChartScales;
  tooltips?: ChartTooltips;
}

export interface ChartTitle {
  display: boolean;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChartLegend {
  display: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChartScales {
  x?: ChartAxis;
  y?: ChartAxis;
}

export interface ChartAxis {
  display: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  min?: number;
  max?: number;
  stepSize?: number;
}

export interface ChartTooltips {
  enabled: boolean;
  mode?: 'point' | 'nearest' | 'index' | 'dataset';
  intersect?: boolean;
}

// Global type exports and utilities
export type ID = string;
export type Timestamp = Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Conditional types for runtime validation
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type guards and predicates
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isProject = (obj: any): obj is Project => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isEquipment = (obj: any): obj is Equipment => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

// Type utilities for form handling
export type FormData<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type ValidationResult<T> = {
  isValid: boolean;
  data?: T;
  errors?: Record<keyof T, string>;
};

// Status and state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';
export type SyncState = 'synced' | 'pending' | 'syncing' | 'error' | 'conflict';

// Extended interfaces for complex features
export interface ExpenseBreakdown {
  materials: MonetaryAmount;
  labor: MonetaryAmount;
  equipment: MonetaryAmount;
  overhead: MonetaryAmount;
  permits: MonetaryAmount;
  other: MonetaryAmount;
  total: MonetaryAmount;
}

export interface BudgetInfo {
  allocated: MonetaryAmount;
  spent: MonetaryAmount;
  remaining: MonetaryAmount;
  forecast: MonetaryAmount;
  variance: {
    amount: MonetaryAmount;
    percentage: number;
  };
}

export interface FinancialForecast {
  period: 'month' | 'quarter' | 'year';
  revenue: MonetaryAmount;
  expenses: ExpenseBreakdown;
  profit: MonetaryAmount;
  confidence: number;
  assumptions: string[];
}

export interface VarianceAnalysis {
  budget: {
    amount: MonetaryAmount;
    percentage: number;
    explanation: string;
  };
  schedule: {
    days: number;
    percentage: number;
    explanation: string;
  };
  scope: {
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  };
}

export interface FinancialKPI {
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface FinancialTrend {
  metric: string;
  periods: TrendPeriod[];
  direction: 'increasing' | 'decreasing' | 'stable';
  correlation?: string;
}

export interface TrendPeriod {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  conditions: WeatherCondition;
  precipitation: {
    probability: number;
    amount: number;
  };
  wind: {
    speed: number;
    direction: number;
    gusts?: number;
  };
  humidity: number;
  suitability: WeatherSuitability;
}

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  issuedAt: Date;
  expiresAt: Date;
  affectedAreas: string[];
  recommendations: string[];
}

export type WeatherAlertType =
  | 'severe_weather'
  | 'high_wind'
  | 'extreme_temperature'
  | 'heavy_rain'
  | 'snow'
  | 'fog'
  | 'air_quality';

export interface BatteryInfo {
  level: number; // percentage
  voltage: number;
  charging: boolean;
  health: 'good' | 'fair' | 'poor' | 'critical';
  estimatedLife: number; // hours
  lastCharged: Date;
}

export interface ConnectivityInfo {
  type: ConnectionType;
  strength: number; // percentage
  latency: number; // milliseconds
  bandwidth: number; // mbps
  lastSeen: Date;
  protocol: string;
  address?: string;
}

export type ConnectionType = 'cellular' | 'wifi' | 'bluetooth' | 'satellite' | 'ethernet';

export interface Sensor {
  id: string;
  type: SensorType;
  model: string;
  unit: string;
  range: {
    min: number;
    max: number;
  };
  accuracy: number;
  calibration: SensorCalibration;
  status: SensorStatus;
}

export type SensorType =
  | 'temperature'
  | 'pressure'
  | 'humidity'
  | 'accelerometer'
  | 'gyroscope'
  | 'gps'
  | 'fuel'
  | 'engine'
  | 'hydraulic';

export interface SensorCalibration {
  lastCalibrated: Date;
  nextDue: Date;
  calibrator: string;
  certificate?: string;
  offset: number;
  multiplier: number;
}

export type SensorStatus = 'active' | 'inactive' | 'error' | 'calibration_needed';

export interface DeviceConfiguration {
  reportingInterval: number; // seconds
  alarmThresholds: Record<string, AlarmThreshold>;
  communicationSettings: CommunicationSettings;
  powerManagement: PowerManagement;
  security: DeviceSecurity;
}

export interface AlarmThreshold {
  low?: number;
  high?: number;
  critical?: number;
  enabled: boolean;
  action: AlarmAction;
}

export type AlarmAction = 'log' | 'alert' | 'shutdown' | 'notification';

export interface CommunicationSettings {
  protocol: 'mqtt' | 'http' | 'coap' | 'lorawan';
  endpoint: string;
  encryption: boolean;
  compression: boolean;
  retryAttempts: number;
  timeout: number;
}

export interface PowerManagement {
  mode: PowerMode;
  sleepInterval: number; // seconds
  wakeUpTriggers: WakeUpTrigger[];
  batteryThreshold: number; // percentage
}

export type PowerMode = 'always_on' | 'power_save' | 'sleep' | 'deep_sleep';

export type WakeUpTrigger = 'timer' | 'motion' | 'alarm' | 'external' | 'manual';

export interface DeviceSecurity {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  certificates: CertificateConfig[];
  accessControl: AccessControlConfig;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  rotationInterval: number; // days
  enabled: boolean;
}

export interface AuthenticationConfig {
  method: AuthMethod;
  credentials: Record<string, string>;
  tokenExpiry: number; // hours
  renewalThreshold: number; // hours
}

export type AuthMethod = 'api_key' | 'certificate' | 'oauth' | 'jwt' | 'basic';

export interface CertificateConfig {
  type: CertificateType;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  purpose: string;
}

export type CertificateType = 'client' | 'server' | 'ca' | 'self_signed';

export interface AccessControlConfig {
  allowedUsers: string[];
  allowedRoles: UserRole[];
  restrictedOperations: string[];
  auditLogging: boolean;
}

export interface SensorData {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: DataQuality;
  location?: Location;
  metadata?: Record<string, any>;
}

export type DataQuality = 'good' | 'questionable' | 'poor' | 'bad';

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: DeviceAlertType;
  severity: AlertSeverity;
  message: string;
  triggered: Date;
  acknowledged?: Date;
  resolved?: Date;
  data: Record<string, any>;
  actions: AlertAction[];
}

export type DeviceAlertType =
  | 'sensor_failure'
  | 'communication_loss'
  | 'battery_low'
  | 'threshold_exceeded'
  | 'tamper_detected'
  | 'maintenance_due';

export interface AlertAction {
  type: AlertActionType;
  status: ActionStatus;
  performedAt?: Date;
  performedBy?: string;
  result?: string;
}

export type AlertActionType =
  | 'notification_sent'
  | 'maintenance_scheduled'
  | 'operator_contacted'
  | 'system_shutdown'
  | 'backup_activated';

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface PersonnelInvolved {
  userId: string;
  role: string;
  involvement: InvolvementType;
  injuryStatus: InjuryStatus;
  statement?: string;
}

export type InvolvementType = 'victim' | 'witness' | 'first_aid' | 'supervisor' | 'investigator';

export type InjuryStatus = 'none' | 'minor' | 'major' | 'fatality';

export interface EquipmentInvolved {
  equipmentId: string;
  involvement: EquipmentInvolvement;
  damage: DamageAssessment;
  operatorId?: string;
}

export type EquipmentInvolvement = 'cause' | 'damaged' | 'witness' | 'rescue';

export interface DamageAssessment {
  severity: DamageSeverity;
  description: string;
  estimatedCost?: MonetaryAmount;
  repairable: boolean;
  downtime?: number; // hours
}

export type DamageSeverity = 'none' | 'minor' | 'moderate' | 'major' | 'total_loss';

export interface InjuryDetails {
  type: InjuryType;
  severity: InjurySeverity;
  bodyPart: BodyPart;
  description: string;
  treatment: TreatmentInfo;
  outcome: InjuryOutcome;
}

export type InjuryType = 'cut' | 'bruise' | 'burn' | 'fracture' | 'sprain' | 'other';

export type InjurySeverity = 'first_aid' | 'medical_attention' | 'hospitalization' | 'fatality';

export type BodyPart = 'head' | 'neck' | 'torso' | 'arms' | 'hands' | 'legs' | 'feet' | 'multiple';

export interface TreatmentInfo {
  firstAid: boolean;
  medicalAttention: boolean;
  hospitalization: boolean;
  provider?: string;
  description: string;
  returnToWork?: Date;
  restrictions?: string[];
}

export type InjuryOutcome = 'full_recovery' | 'partial_recovery' | 'permanent_disability' | 'fatality';

export interface SafetyAction {
  type: SafetyActionType;
  description: string;
  responsibility: string;
  dueDate?: Date;
  completedDate?: Date;
  status: ActionStatus;
  priority: ActionPriority;
}

export type SafetyActionType =
  | 'immediate'
  | 'corrective'
  | 'preventive'
  | 'training'
  | 'equipment'
  | 'procedure';

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Investigation {
  investigator: string;
  startedAt: Date;
  completedAt?: Date;
  method: InvestigationMethod;
  findings: InvestigationFinding[];
  rootCauses: RootCause[];
  recommendations: Recommendation[];
  status: InvestigationStatus;
}

export type InvestigationMethod =
  | 'incident_analysis'
  | 'root_cause_analysis'
  | 'fault_tree_analysis'
  | 'fishbone_diagram'
  | '5_whys';

export interface InvestigationFinding {
  category: FindingCategory;
  description: string;
  evidence: Evidence[];
  significance: FindingSignificance;
}

export type FindingCategory =
  | 'human_factors'
  | 'equipment_failure'
  | 'environmental'
  | 'procedural'
  | 'organizational';

export interface Evidence {
  type: EvidenceType;
  description: string;
  source: string;
  collectedAt: Date;
  location?: string;
}

export type EvidenceType = 'physical' | 'photographic' | 'documentary' | 'testimonial';

export type FindingSignificance = 'contributing' | 'direct_cause' | 'root_cause';

export interface RootCause {
  category: RootCauseCategory;
  description: string;
  evidence: string[];
  preventability: Preventability;
}

export type RootCauseCategory =
  | 'inadequate_training'
  | 'equipment_failure'
  | 'poor_procedures'
  | 'inadequate_supervision'
  | 'environmental_factors';

export type Preventability = 'preventable' | 'potentially_preventable' | 'not_preventable';

export interface Recommendation {
  priority: RecommendationPriority;
  description: string;
  implementation: ImplementationInfo;
  responsibility: string;
  resources: ResourceRequirement[];
  timeline: string;
  effectiveness: EffectivenessRating;
}

export type RecommendationPriority = 'immediate' | 'short_term' | 'long_term';

export interface ImplementationInfo {
  cost: MonetaryAmount;
  effort: EffortLevel;
  complexity: ComplexityLevel;
  dependencies: string[];
}

export type EffortLevel = 'low' | 'medium' | 'high';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

export interface ResourceRequirement {
  type: ResourceType;
  description: string;
  quantity?: number;
  cost?: MonetaryAmount;
}

export type ResourceType = 'personnel' | 'equipment' | 'training' | 'software' | 'facility';

export type EffectivenessRating = 'low' | 'medium' | 'high';

export type InvestigationStatus = 'initiated' | 'in_progress' | 'completed' | 'closed';

export interface ComplianceCheck {
  standards: ComplianceStandard[];
  violations: ComplianceViolation[];
  status: ComplianceStatus;
  lastAudit: Date;
  nextAudit: Date;
  auditScore: number;
}

export interface ComplianceStandard {
  name: string;
  version: string;
  authority: string;
  requirements: ComplianceRequirement[];
  applicability: string;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  mandatory: boolean;
  evidence: string[];
  status: RequirementStatus;
  lastVerified: Date;
}

export type RequirementStatus = 'compliant' | 'non_compliant' | 'not_applicable' | 'pending';

export interface ComplianceViolation {
  requirement: string;
  severity: ViolationSeverity;
  description: string;
  evidence: string[];
  correctionPlan: CorrectionPlan;
  status: ViolationStatus;
}

export type ViolationSeverity = 'minor' | 'major' | 'critical';

export interface CorrectionPlan {
  actions: CorrectiveAction[];
  timeline: string;
  responsibility: string;
  cost?: MonetaryAmount;
  status: CorrectionStatus;
}

export interface CorrectiveAction {
  description: string;
  dueDate: Date;
  completedDate?: Date;
  assignee: string;
  status: ActionStatus;
}

export type CorrectionStatus = 'planned' | 'in_progress' | 'completed' | 'verified';

export type ViolationStatus = 'open' | 'in_correction' | 'corrected' | 'verified';

export type ComplianceStatus = 'compliant' | 'minor_issues' | 'major_issues' | 'critical_issues';

export interface SafetyDocument {
  id: string;
  type: SafetyDocumentType;
  name: string;
  version: string;
  approvedBy: string;
  approvedAt: Date;
  effectiveDate: Date;
  reviewDate: Date;
  url: string;
  distribution: DocumentDistribution[];
}

export type SafetyDocumentType =
  | 'policy'
  | 'procedure'
  | 'checklist'
  | 'form'
  | 'training_material'
  | 'report';

export interface DocumentDistribution {
  recipient: string;
  distributedAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export type SafetyStatus = 'reported' | 'investigating' | 'action_required' | 'resolved' | 'closed';

export type NotificationCategory =
  | 'safety'
  | 'maintenance'
  | 'project'
  | 'financial'
  | 'system'
  | 'emergency';

export interface NotificationRecipient {
  type: RecipientType;
  identifier: string;
  preferences?: NotificationPreferences;
}

export type RecipientType = 'user' | 'role' | 'group' | 'all';

export type NotificationStatus = 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';

export interface AIModel {
  name: string;
  version: string;
  provider: string;
  capabilities: ModelCapability[];
  accuracy: number;
  lastTrained: Date;
}

export type ModelCapability =
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'prediction'
  | 'optimization'
  | 'anomaly_detection';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number;
  data: Record<string, any>;
  recommendations: string[];
}

export type InsightType = 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'optimization';

export type InsightImpact = 'low' | 'medium' | 'high' | 'critical';

export interface Visualization {
  type: VisualizationType;
  title: string;
  data: ChartData;
  insights: string[];
}

export type VisualizationType = 'chart' | 'graph' | 'heatmap' | 'scatter' | 'distribution';

// Global constants and enums
export const USER_ROLES: readonly UserRole[] = [
  'super_admin', 'admin', 'manager', 'crew_leader',
  'crew_member', 'driver', 'inspector', 'estimator', 'client',
] as const;

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'draft', 'quoted', 'approved', 'scheduled', 'in_progress',
  'on_hold', 'completed', 'cancelled', 'warranty',
] as const;

export const EQUIPMENT_TYPES: readonly EquipmentType[] = [
  'paver', 'roller', 'truck', 'distributor', 'sweeper', 'crack_sealer',
  'striping_machine', 'excavator', 'loader', 'milling_machine',
  'compactor', 'trailer', 'generator', 'tool',
] as const;

export const JARGON_MODES: readonly JargonMode[] = ['civilian', 'military', 'hybrid'] as const;

export const THEME_MODES: readonly ThemeMode[] = [
  'light', 'dark', 'system', 'isac', 'defcon', 'overwatch',
] as const;