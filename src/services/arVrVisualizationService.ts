// PHASE 15: AR/VR Visualization and Training Service
// Immersive visualization, training, and mixed reality tools for pavement management

export interface ARVRSession {
  id: string;
  userId: string;
  type: 'ar' | 'vr' | 'mixed_reality';
  mode: SessionMode;
  environment: VirtualEnvironment;
  state: SessionState;
  devices: ConnectedDevice[];
  tracking: TrackingData;
  performance: PerformanceMetrics;
  startTime: string;
  lastActivity: string;
  settings: SessionSettings;
}

export interface SessionMode {
  category: 'training' | 'inspection' | 'visualization' | 'collaboration' | 'maintenance' | 'planning';
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objectives: LearningObjective[];
  constraints: SessionConstraints;
  interactionMethods: InteractionMethod[];
}

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'skill' | 'competency' | 'assessment';
  criteria: CompletionCriteria;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  prerequisites: string[];
  resources: LearningResource[];
}

export interface CompletionCriteria {
  minScore: number;
  maxAttempts: number;
  timeLimit?: number;
  requiredActions: string[];
  accuracyThreshold: number;
  assessmentMethod: 'automatic' | 'peer' | 'instructor' | 'ai';
}

export interface LearningResource {
  type: 'video' | 'document' | '3d_model' | 'simulation' | 'interactive_guide';
  url: string;
  title: string;
  format: string;
  size: number;
  duration?: number;
}

export interface SessionConstraints {
  maxDuration: number;
  allowedMovementArea: BoundingBox;
  requiredEquipment: string[];
  safetyProtocols: SafetyProtocol[];
  networkRequirements: NetworkRequirements;
}

export interface BoundingBox {
  center: Vector3D;
  dimensions: Vector3D;
  rotation: Vector3D;
  safetyBuffer: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SafetyProtocol {
  id: string;
  name: string;
  type: 'warning' | 'boundary' | 'emergency' | 'equipment';
  triggers: string[];
  actions: string[];
  priority: number;
}

export interface NetworkRequirements {
  minBandwidth: number;
  maxLatency: number;
  requiredProtocols: string[];
  qualityOfService: QoSLevel;
}

export type QoSLevel = 'basic' | 'standard' | 'premium' | 'ultra';

export interface InteractionMethod {
  type: 'gaze' | 'gesture' | 'voice' | 'controller' | 'haptic' | 'brain_computer';
  sensitivity: number;
  calibrated: boolean;
  supportedActions: string[];
  accessibility: AccessibilityFeatures;
}

export interface AccessibilityFeatures {
  visualImpairment: boolean;
  hearingImpairment: boolean;
  mobilityImpairment: boolean;
  cognitiveSupport: boolean;
  alternativeInputs: string[];
}

export interface VirtualEnvironment {
  id: string;
  name: string;
  type: 'synthetic' | 'photogrammetry' | 'hybrid' | 'real_world_overlay';
  location: EnvironmentLocation;
  assets: EnvironmentAsset[];
  lighting: LightingConfiguration;
  physics: PhysicsConfiguration;
  audio: AudioConfiguration;
  weather: WeatherConfiguration;
  timeOfDay: TimeConfiguration;
}

export interface EnvironmentLocation {
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  address: string;
  site: string;
  zone: string;
  realWorldMapping: boolean;
  accuracyLevel: 'low' | 'medium' | 'high' | 'survey_grade';
}

export interface EnvironmentAsset {
  id: string;
  name: string;
  type: 'building' | 'pavement' | 'equipment' | 'vehicle' | 'vegetation' | 'infrastructure';
  format: '3d_model' | 'point_cloud' | 'mesh' | 'procedural' | 'volumetric';
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  properties: AssetProperties;
  interactions: AssetInteraction[];
  lod: LevelOfDetail[];
}

export interface AssetProperties {
  material: MaterialProperties;
  physics: PhysicsProperties;
  metadata: Record<string, any>;
  condition: AssetCondition;
  measurements: AssetMeasurements;
}

export interface MaterialProperties {
  type: string;
  color: Color;
  texture: TextureMapping[];
  roughness: number;
  metallic: number;
  transparency: number;
  emission: Color;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface TextureMapping {
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emission' | 'height';
  url: string;
  scale: Vector3D;
  offset: Vector3D;
  rotation: number;
}

export interface PhysicsProperties {
  mass: number;
  friction: number;
  restitution: number;
  collisionShape: 'box' | 'sphere' | 'mesh' | 'convex_hull';
  isStatic: boolean;
  isTrigger: boolean;
}

export interface AssetCondition {
  overall: number; // 0-100
  structural: number;
  surface: number;
  drainage: number;
  markings: number;
  defects: Defect[];
  lastInspected: string;
}

export interface Defect {
  type: 'crack' | 'pothole' | 'rutting' | 'raveling' | 'bleeding' | 'shoving';
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: number;
  location: Vector3D;
  dimensions: Vector3D;
  progression: DefectProgression;
  repairPriority: number;
}

export interface DefectProgression {
  initialDate: string;
  currentSize: number;
  growthRate: number;
  predictedDevelopment: number[];
  triggers: string[];
}

export interface AssetMeasurements {
  length: number;
  width: number;
  height: number;
  area: number;
  volume: number;
  perimeter: number;
  slope: number;
  bearing: number;
}

export interface AssetInteraction {
  type: 'select' | 'inspect' | 'measure' | 'repair' | 'modify' | 'annotate';
  enabled: boolean;
  requirements: string[];
  feedback: InteractionFeedback;
  validation: InteractionValidation;
}

export interface InteractionFeedback {
  visual: VisualFeedback;
  audio: AudioFeedback;
  haptic: HapticFeedback;
  ui: UIFeedback;
}

export interface VisualFeedback {
  highlight: boolean;
  outline: boolean;
  particles: boolean;
  animation: string;
  color: Color;
  intensity: number;
}

export interface AudioFeedback {
  sound: string;
  volume: number;
  pitch: number;
  spatial: boolean;
  looping: boolean;
}

export interface HapticFeedback {
  pattern: string;
  intensity: number;
  duration: number;
  frequency: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

export interface UIFeedback {
  tooltip: boolean;
  popup: boolean;
  overlay: boolean;
  notification: boolean;
  content: string;
}

export interface InteractionValidation {
  requiredPrecision: number;
  timeWindow: number;
  allowedDeviations: number;
  scoring: ScoringCriteria;
}

export interface ScoringCriteria {
  method: 'accuracy' | 'speed' | 'efficiency' | 'comprehensive';
  weights: Record<string, number>;
  penalties: Record<string, number>;
  bonuses: Record<string, number>;
}

export interface LevelOfDetail {
  distance: number;
  vertices: number;
  triangles: number;
  textureResolution: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface LightingConfiguration {
  mode: 'realistic' | 'artistic' | 'functional' | 'debug';
  globalIllumination: boolean;
  shadows: ShadowConfiguration;
  ambientLight: LightSource;
  directionalLight: LightSource;
  pointLights: LightSource[];
  environmentMapping: boolean;
}

export interface ShadowConfiguration {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  distance: number;
  cascades: number;
  softness: number;
}

export interface LightSource {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'area';
  color: Color;
  intensity: number;
  position?: Vector3D;
  direction?: Vector3D;
  range?: number;
  angle?: number;
  shadows: boolean;
}

export interface PhysicsConfiguration {
  enabled: boolean;
  gravity: Vector3D;
  timeStep: number;
  iterations: number;
  collisionDetection: 'discrete' | 'continuous' | 'hybrid';
  solver: 'impulse' | 'projected_gauss_seidel' | 'dantzig';
}

export interface AudioConfiguration {
  enabled: boolean;
  spatialAudio: boolean;
  reverberation: ReverbConfiguration;
  occlusion: boolean;
  doppler: boolean;
  masterVolume: number;
  categories: AudioCategory[];
}

export interface ReverbConfiguration {
  roomSize: number;
  dampening: number;
  wetness: number;
  dryness: number;
  preDelay: number;
}

export interface AudioCategory {
  name: string;
  volume: number;
  priority: number;
  maxChannels: number;
  compression: boolean;
}

export interface WeatherConfiguration {
  enabled: boolean;
  condition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: Vector3D;
  precipitation: PrecipitationSettings;
  visibility: number;
}

export interface PrecipitationSettings {
  type: 'none' | 'rain' | 'snow' | 'hail' | 'sleet';
  intensity: number;
  direction: Vector3D;
  accumulation: boolean;
  puddling: boolean;
}

export interface TimeConfiguration {
  hour: number;
  minute: number;
  timeScale: number;
  dynamicLighting: boolean;
  seasonalChanges: boolean;
  realTimeSync: boolean;
}

export interface SessionState {
  status: 'initializing' | 'active' | 'paused' | 'completed' | 'error' | 'disconnected';
  progress: SessionProgress;
  currentObjective: string;
  completedObjectives: string[];
  score: SessionScore;
  errors: SessionError[];
  warnings: SessionWarning[];
}

export interface SessionProgress {
  overallCompletion: number;
  timeElapsed: number;
  actionsPerformed: number;
  milestonesReached: string[];
  skillsAssessed: SkillAssessment[];
}

export interface SkillAssessment {
  skill: string;
  level: 'novice' | 'competent' | 'proficient' | 'expert';
  confidence: number;
  improvement: number;
  recommendations: string[];
}

export interface SessionScore {
  total: number;
  breakdown: Record<string, number>;
  ranking: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding';
  comparison: ScoreComparison;
}

export interface ScoreComparison {
  personalBest: number;
  groupAverage: number;
  globalAverage: number;
  percentile: number;
}

export interface SessionError {
  code: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  resolved: boolean;
}

export interface SessionWarning {
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  action: string;
}

export interface ConnectedDevice {
  id: string;
  type: 'headset' | 'controller' | 'tracker' | 'haptic' | 'biometric';
  name: string;
  manufacturer: string;
  model: string;
  capabilities: DeviceCapabilities;
  status: DeviceStatus;
  battery?: number;
  firmware: string;
  calibration: CalibrationData;
}

export interface DeviceCapabilities {
  dof: number; // Degrees of freedom
  trackingVolume: BoundingBox;
  resolution: Resolution;
  refreshRate: number;
  fieldOfView: FieldOfView;
  sensors: DeviceSensor[];
  inputs: InputCapability[];
  outputs: OutputCapability[];
}

export interface Resolution {
  width: number;
  height: number;
  pixelDensity: number;
  eyeTracking: boolean;
}

export interface FieldOfView {
  horizontal: number;
  vertical: number;
  diagonal: number;
  overlap: number;
}

export interface DeviceSensor {
  type: 'accelerometer' | 'gyroscope' | 'magnetometer' | 'proximity' | 'light' | 'temperature';
  accuracy: number;
  sampleRate: number;
  range: { min: number; max: number };
}

export interface InputCapability {
  type: 'button' | 'trigger' | 'joystick' | 'touchpad' | 'gesture' | 'voice' | 'eye_tracking';
  precision: number;
  latency: number;
  force: boolean;
}

export interface OutputCapability {
  type: 'visual' | 'audio' | 'haptic' | 'thermal' | 'olfactory';
  resolution: number;
  frequency: number;
  intensity: number;
}

export interface DeviceStatus {
  connected: boolean;
  tracking: boolean;
  battery: number;
  temperature: number;
  errors: string[];
  latency: number;
  frameRate: number;
}

export interface CalibrationData {
  lastCalibrated: string;
  ipd: number; // Interpupillary distance
  eyeRelief: number;
  lensOffset: Vector3D;
  trackingOffset: Vector3D;
  colorProfile: ColorProfile;
}

export interface ColorProfile {
  gamma: number;
  brightness: number;
  contrast: number;
  saturation: number;
  whitePoint: Color;
}

export interface TrackingData {
  headPose: Pose;
  eyeGaze: EyeGaze;
  handPoses: HandPose[];
  bodyPose?: BodyPose;
  faceExpression?: FaceExpression;
  voiceActivity?: VoiceActivity;
}

export interface Pose {
  position: Vector3D;
  rotation: Quaternion;
  velocity: Vector3D;
  angularVelocity: Vector3D;
  confidence: number;
  timestamp: string;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface EyeGaze {
  leftEye: EyeData;
  rightEye: EyeData;
  combined: GazeRay;
  focusDistance: number;
  pupilDilation: number;
  blinkRate: number;
}

export interface EyeData {
  gazeRay: GazeRay;
  pupilDiameter: number;
  openness: number;
  confidence: number;
}

export interface GazeRay {
  origin: Vector3D;
  direction: Vector3D;
  hitPoint?: Vector3D;
  hitObject?: string;
}

export interface HandPose {
  side: 'left' | 'right';
  wrist: Pose;
  fingers: FingerPose[];
  gesture: RecognizedGesture;
  confidence: number;
}

export interface FingerPose {
  type: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  joints: JointPose[];
  flexion: number;
  extension: number;
}

export interface JointPose {
  position: Vector3D;
  rotation: Quaternion;
  confidence: number;
}

export interface RecognizedGesture {
  name: string;
  confidence: number;
  duration: number;
  completed: boolean;
}

export interface BodyPose {
  joints: BodyJoint[];
  centerOfMass: Vector3D;
  height: number;
  confidence: number;
}

export interface BodyJoint {
  type: string;
  position: Vector3D;
  rotation: Quaternion;
  confidence: number;
}

export interface FaceExpression {
  emotions: EmotionData[];
  landmarks: FaceLandmark[];
  age: number;
  gender: 'male' | 'female' | 'unknown';
  attention: number;
}

export interface EmotionData {
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  intensity: number;
  confidence: number;
}

export interface FaceLandmark {
  type: string;
  position: Vector3D;
  confidence: number;
}

export interface VoiceActivity {
  speaking: boolean;
  volume: number;
  pitch: number;
  tone: string;
  words: RecognizedWord[];
  sentiment: SentimentAnalysis;
}

export interface RecognizedWord {
  word: string;
  confidence: number;
  startTime: number;
  endTime: number;
}

export interface SentimentAnalysis {
  polarity: number; // -1 to 1
  subjectivity: number; // 0 to 1
  confidence: number;
}

export interface PerformanceMetrics {
  frameRate: number;
  frameTime: number;
  renderTime: number;
  gpuUtilization: number;
  cpuUtilization: number;
  memoryUsage: number;
  networkLatency: number;
  motionToPhoton: number;
  droppedFrames: number;
  thermalState: ThermalState;
}

export interface ThermalState {
  temperature: number;
  throttling: boolean;
  level: 'normal' | 'elevated' | 'critical';
  timeToThrottle: number;
}

export interface SessionSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  input: InputSettings;
  comfort: ComfortSettings;
  accessibility: AccessibilitySettings;
  networking: NetworkSettings;
}

export interface GraphicsSettings {
  renderScale: number;
  antiAliasing: 'none' | 'fxaa' | 'msaa_2x' | 'msaa_4x' | 'msaa_8x';
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  effectsQuality: 'low' | 'medium' | 'high' | 'ultra';
  postProcessing: boolean;
  vrSpecific: VRGraphicsSettings;
}

export interface VRGraphicsSettings {
  foveatedRendering: boolean;
  fixedFoveatedRendering: number;
  dynamicFoveatedRendering: boolean;
  eyeTrackingFoveation: boolean;
  reprojection: boolean;
  timewarp: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  spatialAudio: boolean;
  headTracking: boolean;
  voiceChat: boolean;
  microphoneSensitivity: number;
  noiseCancellation: boolean;
}

export interface InputSettings {
  dominantHand: 'left' | 'right' | 'ambidextrous';
  gestureThreshold: number;
  voiceCommands: boolean;
  eyeTrackingCalibration: boolean;
  handTrackingMode: 'controllers' | 'hands' | 'hybrid';
}

export interface ComfortSettings {
  locomotion: 'teleport' | 'smooth' | 'dash' | 'hybrid';
  turnMethod: 'smooth' | 'snap' | 'comfort';
  snapTurnAngle: number;
  vignetteStrength: number;
  motionSickness: 'none' | 'low' | 'medium' | 'high';
}

export interface AccessibilitySettings {
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  hearingImpairment: boolean;
  subtitles: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

export interface NetworkSettings {
  quality: 'low' | 'medium' | 'high' | 'adaptive';
  bandwidth: number;
  compression: boolean;
  cloudRendering: boolean;
  localCaching: boolean;
}

export interface TrainingModule {
  id: string;
  name: string;
  version: string;
  category: 'inspection' | 'maintenance' | 'safety' | 'equipment' | 'analysis';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  objectives: LearningObjective[];
  scenarios: TrainingScenario[];
  assessments: Assessment[];
  certification: CertificationInfo;
  prerequisites: string[];
  resources: LearningResource[];
}

export interface TrainingScenario {
  id: string;
  name: string;
  description: string;
  environment: string;
  challenges: ScenarioChallenge[];
  tools: VirtualTool[];
  metrics: PerformanceMetric[];
  adaptivity: AdaptivitySettings;
}

export interface ScenarioChallenge {
  type: 'time_pressure' | 'complexity' | 'accuracy' | 'safety' | 'resource_constraint';
  parameters: Record<string, any>;
  triggers: string[];
  adaptations: string[];
}

export interface VirtualTool {
  id: string;
  name: string;
  type: 'measuring' | 'inspection' | 'repair' | 'analysis' | 'safety';
  model: string;
  interactions: ToolInteraction[];
  physics: boolean;
  haptics: boolean;
}

export interface ToolInteraction {
  action: string;
  method: 'grip' | 'trigger' | 'button' | 'gesture' | 'voice';
  feedback: InteractionFeedback;
  precision: number;
}

export interface PerformanceMetric {
  name: string;
  type: 'time' | 'accuracy' | 'efficiency' | 'safety' | 'knowledge';
  weight: number;
  threshold: number;
  measurement: MetricMeasurement;
}

export interface MetricMeasurement {
  method: 'automatic' | 'user_reported' | 'instructor_evaluated';
  frequency: 'continuous' | 'periodic' | 'event_triggered';
  aggregation: 'average' | 'sum' | 'maximum' | 'minimum' | 'last';
}

export interface AdaptivitySettings {
  enabled: boolean;
  factors: AdaptivityFactor[];
  adjustments: AdaptivityAdjustment[];
  learningModel: 'rule_based' | 'ml_based' | 'hybrid';
}

export interface AdaptivityFactor {
  factor: 'performance' | 'engagement' | 'difficulty' | 'learning_style' | 'preferences';
  weight: number;
  threshold: number;
}

export interface AdaptivityAdjustment {
  trigger: string;
  action: 'increase_difficulty' | 'decrease_difficulty' | 'add_hints' | 'change_pace' | 'provide_support';
  magnitude: number;
}

export interface Assessment {
  id: string;
  name: string;
  type: 'formative' | 'summative' | 'diagnostic' | 'competency';
  format: 'practical' | 'theoretical' | 'mixed' | 'simulation';
  questions: AssessmentQuestion[];
  scoring: ScoringCriteria;
  certification: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'practical_task' | 'simulation' | 'open_ended';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  difficulty: number;
}

export interface CertificationInfo {
  available: boolean;
  authority: string;
  validityPeriod: number;
  renewalRequired: boolean;
  prerequisites: string[];
  passingScore: number;
}

// PHASE 15: AR/VR Visualization Service Class
export class ARVRVisualizationService {
  private sessions: Map<string, ARVRSession> = new Map();
  private trainingModules: Map<string, TrainingModule> = new Map();
  private environments: Map<string, VirtualEnvironment> = new Map();
  private connectedDevices: Map<string, ConnectedDevice> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 15: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🥽 Initializing AR/VR Visualization Service...');
      
      // Setup training modules
      await this.setupTrainingModules();
      
      // Initialize virtual environments
      await this.setupVirtualEnvironments();
      
      // Setup device compatibility
      await this.initializeDeviceSupport();
      
      // Start performance monitoring
      await this.startPerformanceMonitoring();
      
      this.isInitialized = true;
      console.log('✅ AR/VR Visualization Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AR/VR visualization service:', error);
      throw error;
    }
  }

  // PHASE 15: Setup Training Modules
  private async setupTrainingModules(): Promise<void> {
    const defaultModules: TrainingModule[] = [
      // Pavement Inspection Training
      {
        id: 'pavement_inspection_101',
        name: 'Pavement Inspection Fundamentals',
        version: '2.1.0',
        category: 'inspection',
        difficulty: 'beginner',
        duration: 1800, // 30 minutes
        objectives: [
          {
            id: 'visual_assessment',
            title: 'Visual Pavement Assessment',
            description: 'Learn to identify common pavement defects through visual inspection',
            type: 'skill',
            criteria: {
              minScore: 80,
              maxAttempts: 3,
              timeLimit: 600,
              requiredActions: ['identify_cracks', 'assess_severity', 'document_findings'],
              accuracyThreshold: 0.85,
              assessmentMethod: 'automatic'
            },
            priority: 'high',
            estimatedDuration: 900,
            prerequisites: [],
            resources: [
              {
                type: '3d_model',
                url: '/models/pavement_samples.glb',
                title: 'Pavement Condition Samples',
                format: 'glb',
                size: 15728640,
                duration: 0
              }
            ]
          },
          {
            id: 'crack_classification',
            title: 'Crack Type Classification',
            description: 'Distinguish between different types of pavement cracks',
            type: 'knowledge',
            criteria: {
              minScore: 90,
              maxAttempts: 2,
              requiredActions: ['classify_longitudinal', 'classify_transverse', 'classify_alligator'],
              accuracyThreshold: 0.9,
              assessmentMethod: 'automatic'
            },
            priority: 'critical',
            estimatedDuration: 600,
            prerequisites: ['visual_assessment'],
            resources: []
          }
        ],
        scenarios: [
          {
            id: 'church_parking_inspection',
            name: 'Church Parking Lot Inspection',
            description: 'Practice inspecting a typical church parking lot for defects',
            environment: 'church_parking_lot_001',
            challenges: [
              {
                type: 'time_pressure',
                parameters: { time_limit: 900 },
                triggers: ['scenario_start'],
                adaptations: ['reduce_complexity', 'provide_hints']
              },
              {
                type: 'accuracy',
                parameters: { min_accuracy: 0.85 },
                triggers: ['assessment_failure'],
                adaptations: ['additional_training', 'guided_practice']
              }
            ],
            tools: [
              {
                id: 'crack_gauge',
                name: 'Digital Crack Gauge',
                type: 'measuring',
                model: '/models/tools/crack_gauge.glb',
                interactions: [
                  {
                    action: 'measure',
                    method: 'trigger',
                    feedback: {
                      visual: { highlight: true, outline: true, particles: false, animation: 'pulse', color: { r: 0, g: 1, b: 0, a: 1 }, intensity: 0.8 },
                      audio: { sound: '/audio/measurement_beep.wav', volume: 0.7, pitch: 1.0, spatial: true, looping: false },
                      haptic: { pattern: 'click', intensity: 0.6, duration: 100, frequency: 250, waveform: 'sine' },
                      ui: { tooltip: true, popup: false, overlay: false, notification: false, content: 'Crack width: {measurement}mm' }
                    },
                    precision: 0.1
                  }
                ],
                physics: true,
                haptics: true
              }
            ],
            metrics: [
              {
                name: 'defect_detection_rate',
                type: 'accuracy',
                weight: 0.4,
                threshold: 0.8,
                measurement: {
                  method: 'automatic',
                  frequency: 'continuous',
                  aggregation: 'average'
                }
              },
              {
                name: 'inspection_time',
                type: 'time',
                weight: 0.3,
                threshold: 900,
                measurement: {
                  method: 'automatic',
                  frequency: 'continuous',
                  aggregation: 'sum'
                }
              }
            ],
            adaptivity: {
              enabled: true,
              factors: [
                { factor: 'performance', weight: 0.5, threshold: 0.7 },
                { factor: 'engagement', weight: 0.3, threshold: 0.6 }
              ],
              adjustments: [
                { trigger: 'low_performance', action: 'add_hints', magnitude: 0.5 },
                { trigger: 'high_performance', action: 'increase_difficulty', magnitude: 0.2 }
              ],
              learningModel: 'hybrid'
            }
          }
        ],
        assessments: [
          {
            id: 'final_assessment',
            name: 'Pavement Inspection Certification',
            type: 'summative',
            format: 'practical',
            questions: [
              {
                id: 'q1',
                type: 'practical_task',
                question: 'Identify and classify all visible defects in the assigned pavement section',
                correctAnswer: ['longitudinal_crack', 'transverse_crack', 'pothole'],
                explanation: 'This section contains three distinct defect types requiring different repair approaches',
                points: 25,
                difficulty: 0.7
              }
            ],
            scoring: {
              method: 'comprehensive',
              weights: { accuracy: 0.5, speed: 0.2, efficiency: 0.3 },
              penalties: { missed_defect: -10, incorrect_classification: -5 },
              bonuses: { early_completion: 5, exceptional_accuracy: 10 }
            },
            certification: true
          }
        ],
        certification: {
          available: true,
          authority: 'PaveMaster Institute',
          validityPeriod: 31536000000, // 1 year
          renewalRequired: true,
          prerequisites: [],
          passingScore: 80
        },
        prerequisites: [],
        resources: []
      },

      // AR Overlay Training
      {
        id: 'ar_overlay_training',
        name: 'Augmented Reality Overlay Operations',
        version: '1.5.0',
        category: 'equipment',
        difficulty: 'intermediate',
        duration: 2400, // 40 minutes
        objectives: [
          {
            id: 'ar_navigation',
            title: 'AR Interface Navigation',
            description: 'Master the AR interface for pavement management tasks',
            type: 'skill',
            criteria: {
              minScore: 85,
              maxAttempts: 2,
              requiredActions: ['menu_navigation', 'object_selection', 'data_overlay'],
              accuracyThreshold: 0.9,
              assessmentMethod: 'automatic'
            },
            priority: 'high',
            estimatedDuration: 1200,
            prerequisites: [],
            resources: []
          }
        ],
        scenarios: [],
        assessments: [],
        certification: {
          available: false,
          authority: '',
          validityPeriod: 0,
          renewalRequired: false,
          prerequisites: [],
          passingScore: 0
        },
        prerequisites: ['pavement_inspection_101'],
        resources: []
      }
    ];

    defaultModules.forEach(module => {
      this.trainingModules.set(module.id, module);
    });

    console.log(`🎓 Setup ${defaultModules.length} training modules`);
  }

  // PHASE 15: Setup Virtual Environments
  private async setupVirtualEnvironments(): Promise<void> {
    const defaultEnvironments: VirtualEnvironment[] = [
      {
        id: 'church_parking_lot_001',
        name: 'Community Church Parking Lot',
        type: 'photogrammetry',
        location: {
          coordinates: { latitude: 40.7128, longitude: -74.0060, altitude: 10.5 },
          address: '123 Church Street, New York, NY',
          site: 'community_church',
          zone: 'main_parking',
          realWorldMapping: true,
          accuracyLevel: 'high'
        },
        assets: [
          {
            id: 'main_pavement',
            name: 'Main Parking Area',
            type: 'pavement',
            format: '3d_model',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            properties: {
              material: {
                type: 'asphalt',
                color: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
                texture: [
                  {
                    type: 'diffuse',
                    url: '/textures/asphalt_diffuse.jpg',
                    scale: { x: 10, y: 10, z: 1 },
                    offset: { x: 0, y: 0, z: 0 },
                    rotation: 0
                  }
                ],
                roughness: 0.8,
                metallic: 0.1,
                transparency: 0,
                emission: { r: 0, g: 0, b: 0, a: 0 }
              },
              physics: {
                mass: 0,
                friction: 0.7,
                restitution: 0.1,
                collisionShape: 'mesh',
                isStatic: true,
                isTrigger: false
              },
              metadata: {
                construction_date: '2018-06-15',
                last_maintenance: '2023-04-20',
                traffic_load: 'medium'
              },
              condition: {
                overall: 75,
                structural: 80,
                surface: 70,
                drainage: 85,
                markings: 65,
                defects: [
                  {
                    type: 'crack',
                    severity: 'medium',
                    area: 2.5,
                    location: { x: 5.2, y: 0.1, z: 3.8 },
                    dimensions: { x: 0.02, y: 0.1, z: 1.5 },
                    progression: {
                      initialDate: '2023-09-15',
                      currentSize: 1.5,
                      growthRate: 0.1,
                      predictedDevelopment: [1.6, 1.8, 2.1, 2.5],
                      triggers: ['freeze_thaw', 'heavy_traffic']
                    },
                    repairPriority: 3
                  }
                ],
                lastInspected: '2024-01-15'
              },
              measurements: {
                length: 50.0,
                width: 30.0,
                height: 0.1,
                area: 1500.0,
                volume: 150.0,
                perimeter: 160.0,
                slope: 2.0,
                bearing: 45.0
              }
            },
            interactions: [
              {
                type: 'inspect',
                enabled: true,
                requirements: ['inspection_tool'],
                feedback: {
                  visual: { highlight: true, outline: true, particles: true, animation: 'glow', color: { r: 0, g: 0.8, b: 1, a: 0.7 }, intensity: 0.6 },
                  audio: { sound: '/audio/inspection_mode.wav', volume: 0.5, pitch: 1.0, spatial: false, looping: true },
                  haptic: { pattern: 'subtle_pulse', intensity: 0.3, duration: 1000, frequency: 2, waveform: 'sine' },
                  ui: { tooltip: true, popup: true, overlay: true, notification: false, content: 'Inspection data overlay active' }
                },
                validation: {
                  requiredPrecision: 0.05,
                  timeWindow: 30000,
                  allowedDeviations: 2,
                  scoring: {
                    method: 'accuracy',
                    weights: { precision: 0.6, speed: 0.4 },
                    penalties: { deviation: -2 },
                    bonuses: { perfect_accuracy: 5 }
                  }
                }
              }
            ],
            lod: [
              { distance: 10, vertices: 10000, triangles: 8000, textureResolution: 2048, quality: 'ultra' },
              { distance: 50, vertices: 5000, triangles: 4000, textureResolution: 1024, quality: 'high' },
              { distance: 100, vertices: 1000, triangles: 800, textureResolution: 512, quality: 'medium' }
            ]
          }
        ],
        lighting: {
          mode: 'realistic',
          globalIllumination: true,
          shadows: {
            enabled: true,
            quality: 'high',
            distance: 100,
            cascades: 4,
            softness: 0.5
          },
          ambientLight: {
            type: 'ambient',
            color: { r: 0.4, g: 0.4, b: 0.6, a: 1 },
            intensity: 0.3,
            shadows: false
          },
          directionalLight: {
            type: 'directional',
            color: { r: 1, g: 0.95, b: 0.8, a: 1 },
            intensity: 1.2,
            direction: { x: -0.3, y: -0.7, z: -0.6 },
            shadows: true
          },
          pointLights: [],
          environmentMapping: true
        },
        physics: {
          enabled: true,
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.016,
          iterations: 10,
          collisionDetection: 'continuous',
          solver: 'impulse'
        },
        audio: {
          enabled: true,
          spatialAudio: true,
          reverberation: {
            roomSize: 50,
            dampening: 0.3,
            wetness: 0.2,
            dryness: 0.8,
            preDelay: 0.02
          },
          occlusion: true,
          doppler: true,
          masterVolume: 0.8,
          categories: [
            { name: 'environment', volume: 0.6, priority: 1, maxChannels: 8, compression: true },
            { name: 'feedback', volume: 0.8, priority: 3, maxChannels: 4, compression: false }
          ]
        },
        weather: {
          enabled: true,
          condition: 'clear',
          temperature: 22,
          humidity: 55,
          windSpeed: 5,
          windDirection: { x: 1, y: 0, z: 0.3 },
          precipitation: {
            type: 'none',
            intensity: 0,
            direction: { x: 0, y: -1, z: 0 },
            accumulation: false,
            puddling: false
          },
          visibility: 1000
        },
        timeOfDay: {
          hour: 14,
          minute: 30,
          timeScale: 1,
          dynamicLighting: true,
          seasonalChanges: false,
          realTimeSync: false
        }
      }
    ];

    defaultEnvironments.forEach(env => {
      this.environments.set(env.id, env);
    });

    console.log(`🌍 Setup ${defaultEnvironments.length} virtual environments`);
  }

  // PHASE 15: Initialize Device Support
  private async initializeDeviceSupport(): Promise<void> {
    const supportedDevices: ConnectedDevice[] = [
      {
        id: 'meta_quest_pro',
        type: 'headset',
        name: 'Meta Quest Pro',
        manufacturer: 'Meta',
        model: 'Quest Pro',
        capabilities: {
          dof: 6,
          trackingVolume: {
            center: { x: 0, y: 1.7, z: 0 },
            dimensions: { x: 8, y: 3, z: 8 },
            rotation: { x: 0, y: 0, z: 0 },
            safetyBuffer: 0.5
          },
          resolution: {
            width: 1800,
            height: 1920,
            pixelDensity: 500,
            eyeTracking: true
          },
          refreshRate: 90,
          fieldOfView: {
            horizontal: 106,
            vertical: 96,
            diagonal: 120,
            overlap: 85
          },
          sensors: [
            { type: 'accelerometer', accuracy: 0.01, sampleRate: 1000, range: { min: -16, max: 16 } },
            { type: 'gyroscope', accuracy: 0.001, sampleRate: 1000, range: { min: -2000, max: 2000 } }
          ],
          inputs: [
            { type: 'eye_tracking', precision: 0.5, latency: 5, force: false },
            { type: 'gesture', precision: 2, latency: 20, force: false }
          ],
          outputs: [
            { type: 'visual', resolution: 1800, frequency: 90, intensity: 100 },
            { type: 'audio', resolution: 48000, frequency: 20000, intensity: 100 }
          ]
        },
        status: {
          connected: false,
          tracking: false,
          battery: 0,
          temperature: 25,
          errors: [],
          latency: 0,
          frameRate: 0
        },
        firmware: '55.0.0',
        calibration: {
          lastCalibrated: '2024-01-20',
          ipd: 63.5,
          eyeRelief: 14,
          lensOffset: { x: 0, y: 0, z: 0 },
          trackingOffset: { x: 0, y: 0, z: 0 },
          colorProfile: {
            gamma: 2.2,
            brightness: 80,
            contrast: 50,
            saturation: 100,
            whitePoint: { r: 1, g: 1, b: 1, a: 1 }
          }
        }
      }
    ];

    supportedDevices.forEach(device => {
      this.connectedDevices.set(device.id, device);
    });

    console.log(`🎮 Initialized support for ${supportedDevices.length} device types`);
  }

  // PHASE 15: Start Performance Monitoring
  private async startPerformanceMonitoring(): Promise<void> {
    // Simulate performance monitoring
    setInterval(() => {
      this.updateSessionMetrics();
    }, 1000);

    console.log('📊 Started AR/VR performance monitoring');
  }

  // PHASE 15: Update Session Metrics
  private updateSessionMetrics(): void {
    for (const session of this.sessions.values()) {
      if (session.state.status === 'active') {
        // Update performance metrics
        session.performance.frameRate = 85 + Math.random() * 10;
        session.performance.frameTime = 11 + Math.random() * 2;
        session.performance.renderTime = 8 + Math.random() * 4;
        session.performance.gpuUtilization = 60 + Math.random() * 20;
        session.performance.cpuUtilization = 40 + Math.random() * 15;
        session.performance.memoryUsage = 70 + Math.random() * 10;
        session.performance.networkLatency = 20 + Math.random() * 10;
        session.performance.motionToPhoton = 18 + Math.random() * 4;
        session.performance.droppedFrames = Math.floor(Math.random() * 3);

        // Update thermal state
        session.performance.thermalState.temperature = 45 + Math.random() * 15;
        if (session.performance.thermalState.temperature > 55) {
          session.performance.thermalState.level = 'elevated';
          session.performance.thermalState.throttling = Math.random() < 0.3;
        } else {
          session.performance.thermalState.level = 'normal';
          session.performance.thermalState.throttling = false;
        }

        // Update session progress
        session.state.progress.timeElapsed += 1000;
        session.state.progress.actionsPerformed += Math.floor(Math.random() * 2);
        
        if (session.state.progress.timeElapsed % 30000 === 0) { // Every 30 seconds
          session.state.progress.overallCompletion = Math.min(100, 
            session.state.progress.overallCompletion + Math.random() * 5);
        }

        session.lastActivity = new Date().toISOString();
      }
    }
  }

  // PHASE 15: Public API Methods
  async startSession(config: {
    userId: string;
    type: 'ar' | 'vr' | 'mixed_reality';
    moduleId?: string;
    environmentId?: string;
    settings?: Partial<SessionSettings>;
  }): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ARVRSession = {
      id: sessionId,
      userId: config.userId,
      type: config.type,
      mode: {
        category: 'training',
        scenario: config.moduleId || 'free_exploration',
        difficulty: 'beginner',
        objectives: [],
        constraints: {
          maxDuration: 3600000, // 1 hour
          allowedMovementArea: {
            center: { x: 0, y: 1.7, z: 0 },
            dimensions: { x: 5, y: 3, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            safetyBuffer: 0.5
          },
          requiredEquipment: ['headset'],
          safetyProtocols: [],
          networkRequirements: {
            minBandwidth: 10,
            maxLatency: 50,
            requiredProtocols: ['webrtc'],
            qualityOfService: 'standard'
          }
        },
        interactionMethods: [
          {
            type: 'gaze',
            sensitivity: 0.8,
            calibrated: true,
            supportedActions: ['select', 'focus'],
            accessibility: {
              visualImpairment: false,
              hearingImpairment: false,
              mobilityImpairment: false,
              cognitiveSupport: false,
              alternativeInputs: []
            }
          }
        ]
      },
      environment: this.environments.get(config.environmentId || 'church_parking_lot_001')!,
      state: {
        status: 'initializing',
        progress: {
          overallCompletion: 0,
          timeElapsed: 0,
          actionsPerformed: 0,
          milestonesReached: [],
          skillsAssessed: []
        },
        currentObjective: '',
        completedObjectives: [],
        score: {
          total: 0,
          breakdown: {},
          ranking: 'poor',
          comparison: {
            personalBest: 0,
            groupAverage: 0,
            globalAverage: 0,
            percentile: 0
          }
        },
        errors: [],
        warnings: []
      },
      devices: [],
      tracking: {
        headPose: {
          position: { x: 0, y: 1.7, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          velocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 },
          confidence: 1.0,
          timestamp: new Date().toISOString()
        },
        eyeGaze: {
          leftEye: {
            gazeRay: {
              origin: { x: 0, y: 1.7, z: 0 },
              direction: { x: 0, y: 0, z: -1 }
            },
            pupilDiameter: 4.5,
            openness: 1.0,
            confidence: 0.95
          },
          rightEye: {
            gazeRay: {
              origin: { x: 0, y: 1.7, z: 0 },
              direction: { x: 0, y: 0, z: -1 }
            },
            pupilDiameter: 4.5,
            openness: 1.0,
            confidence: 0.95
          },
          combined: {
            origin: { x: 0, y: 1.7, z: 0 },
            direction: { x: 0, y: 0, z: -1 }
          },
          focusDistance: 2.0,
          pupilDilation: 0.5,
          blinkRate: 12
        },
        handPoses: []
      },
      performance: {
        frameRate: 90,
        frameTime: 11,
        renderTime: 8,
        gpuUtilization: 50,
        cpuUtilization: 30,
        memoryUsage: 60,
        networkLatency: 25,
        motionToPhoton: 20,
        droppedFrames: 0,
        thermalState: {
          temperature: 40,
          throttling: false,
          level: 'normal',
          timeToThrottle: -1
        }
      },
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      settings: {
        graphics: {
          renderScale: 1.0,
          antiAliasing: 'msaa_4x',
          shadowQuality: 'high',
          textureQuality: 'high',
          effectsQuality: 'high',
          postProcessing: true,
          vrSpecific: {
            foveatedRendering: true,
            fixedFoveatedRendering: 0.5,
            dynamicFoveatedRendering: true,
            eyeTrackingFoveation: true,
            reprojection: true,
            timewarp: true
          }
        },
        audio: {
          masterVolume: 80,
          spatialAudio: true,
          headTracking: true,
          voiceChat: false,
          microphoneSensitivity: 50,
          noiseCancellation: true
        },
        input: {
          dominantHand: 'right',
          gestureThreshold: 0.7,
          voiceCommands: false,
          eyeTrackingCalibration: true,
          handTrackingMode: 'hybrid'
        },
        comfort: {
          locomotion: 'teleport',
          turnMethod: 'snap',
          snapTurnAngle: 30,
          vignetteStrength: 0.5,
          motionSickness: 'medium'
        },
        accessibility: {
          colorBlindness: 'none',
          hearingImpairment: false,
          subtitles: false,
          highContrast: false,
          largeText: false,
          reducedMotion: false
        },
        networking: {
          quality: 'high',
          bandwidth: 50,
          compression: true,
          cloudRendering: false,
          localCaching: true
        }
      }
    };

    this.sessions.set(sessionId, session);
    
    // Start session
    setTimeout(() => {
      session.state.status = 'active';
    }, 2000);

    console.log(`🚀 Started ${config.type.toUpperCase()} session ${sessionId} for user ${config.userId}`);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<ARVRSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.state.status = 'completed';
    console.log(`🏁 Ended session ${sessionId}`);
  }

  async getTrainingModules(): Promise<TrainingModule[]> {
    return Array.from(this.trainingModules.values());
  }

  async getTrainingModule(moduleId: string): Promise<TrainingModule | null> {
    return this.trainingModules.get(moduleId) || null;
  }

  async getEnvironments(): Promise<VirtualEnvironment[]> {
    return Array.from(this.environments.values());
  }

  async getEnvironment(environmentId: string): Promise<VirtualEnvironment | null> {
    return this.environments.get(environmentId) || null;
  }

  async getSupportedDevices(): Promise<ConnectedDevice[]> {
    return Array.from(this.connectedDevices.values());
  }

  async connectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not supported`);
    }

    device.status.connected = true;
    device.status.tracking = true;
    device.status.battery = 85;
    device.status.frameRate = 90;
    device.status.latency = 20;

    console.log(`🔌 Connected device: ${device.name}`);
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    device.status.connected = false;
    device.status.tracking = false;
    device.status.frameRate = 0;

    console.log(`🔌 Disconnected device: ${device.name}`);
  }

  async getSessionMetrics(sessionId: string): Promise<PerformanceMetrics | null> {
    const session = this.sessions.get(sessionId);
    return session ? session.performance : null;
  }

  async updateSessionSettings(sessionId: string, settings: Partial<SessionSettings>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    Object.assign(session.settings, settings);
    console.log(`⚙️ Updated settings for session ${sessionId}`);
  }

  // PHASE 15: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up AR/VR Visualization Service...');
    
    // End all active sessions
    for (const session of this.sessions.values()) {
      if (session.state.status === 'active') {
        session.state.status = 'completed';
      }
    }
    
    this.sessions.clear();
    this.trainingModules.clear();
    this.environments.clear();
    this.connectedDevices.clear();
    
    console.log('✅ AR/VR Visualization Service cleanup completed');
  }
}

// PHASE 15: Export singleton instance
export const arVrVisualizationService = new ARVRVisualizationService();
export default arVrVisualizationService;