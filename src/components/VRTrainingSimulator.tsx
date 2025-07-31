import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  XR, 
  Controllers, 
  Hands, 
  VRButton, 
  ARButton,
  useXR,
  useController
} from '@react-three/xr';
import { 
  OrbitControls, 
  Environment, 
  Sky, 
  Grid,
  Text,
  Html,
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  Stats
} from '@react-three/drei';
import { 
  Physics, 
  RigidBody, 
  CuboidCollider,
  BallCollider,
  useRapier
} from '@react-three/rapier';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Settings,
  Trophy,
  Target,
  Clock,
  Zap,
  Brain,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import * as THREE from 'three';

// Training scenario interfaces
interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  objectives: TrainingObjective[];
  environment: EnvironmentConfig;
  tools: TrainingTool[];
  assessment: AssessmentCriteria;
}

interface TrainingObjective {
  id: string;
  description: string;
  type: 'task' | 'knowledge' | 'safety' | 'efficiency';
  completed: boolean;
  score?: number;
}

interface EnvironmentConfig {
  type: 'parking_lot' | 'highway' | 'residential' | 'industrial';
  weather: 'sunny' | 'rainy' | 'foggy' | 'night';
  traffic: 'none' | 'light' | 'moderate' | 'heavy';
  complexity: number; // 1-10
}

interface TrainingTool {
  id: string;
  name: string;
  model: string; // 3D model path
  category: 'measurement' | 'analysis' | 'repair' | 'safety';
  interaction: InteractionType;
}

interface InteractionType {
  grab: boolean;
  point: boolean;
  voice: boolean;
  gesture: boolean;
}

interface AssessmentCriteria {
  timeLimit: number;
  accuracyThreshold: number;
  safetyRequirements: string[];
  performanceMetrics: PerformanceMetric[];
}

interface PerformanceMetric {
  name: string;
  weight: number;
  target: number;
  current: number;
}

// Training state management
interface TrainingState {
  currentScenario: TrainingScenario | null;
  isActive: boolean;
  startTime: number;
  elapsedTime: number;
  score: number;
  completedObjectives: string[];
  errors: TrainingError[];
  performance: PerformanceData;
}

interface TrainingError {
  id: string;
  type: 'safety' | 'procedure' | 'time' | 'accuracy';
  description: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceData {
  accuracy: number;
  efficiency: number;
  safety: number;
  overall: number;
  timeToComplete: number;
  errorsCount: number;
}

// VR Training Environment Component
const VRTrainingEnvironment: React.FC<{ scenario: TrainingScenario }> = ({ scenario }) => {
  const { scene } = useXR();
  const [tools, setTools] = useState<Map<string, THREE.Object3D>>(new Map());
  const [interactions, setInteractions] = useState<Map<string, any>>(new Map());

  // Load training environment based on scenario
  useEffect(() => {
    loadEnvironment(scenario.environment);
    loadTrainingTools(scenario.tools);
  }, [scenario]);

  const loadEnvironment = (config: EnvironmentConfig) => {
    // Dynamic environment loading based on configuration
    switch (config.type) {
      case 'parking_lot':
        return <ParkingLotEnvironment config={config} />;
      case 'highway':
        return <HighwayEnvironment config={config} />;
      case 'residential':
        return <ResidentialEnvironment config={config} />;
      case 'industrial':
        return <IndustrialEnvironment config={config} />;
    }
  };

  const loadTrainingTools = (toolConfigs: TrainingTool[]) => {
    // Load and position training tools in VR space
    toolConfigs.forEach(tool => {
      // Implementation for tool loading
    });
  };

  return (
    <group>
      {/* Dynamic Environment */}
      {loadEnvironment(scenario.environment)}
      
      {/* Training Tools */}
      <TrainingToolsSetup tools={scenario.tools} />
      
      {/* Interactive Elements */}
      <InteractiveElements scenario={scenario} />
      
      {/* Assessment Overlays */}
      <AssessmentOverlays objectives={scenario.objectives} />
    </group>
  );
};

// Parking Lot Training Environment
const ParkingLotEnvironment: React.FC<{ config: EnvironmentConfig }> = ({ config }) => {
  return (
    <group>
      {/* Ground plane */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[50, 0.2, 50]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
        <CuboidCollider args={[25, 0.1, 25]} />
      </RigidBody>

      {/* Parking spaces */}
      <ParkingSpaces count={20} layout="grid" />
      
      {/* Asphalt surface with cracks */}
      <AsphaltSurface 
        cracks={generateCracks(config.complexity)} 
        potholes={generatePotholes(config.complexity)}
      />
      
      {/* Church building */}
      <ChurchBuilding position={[15, 0, 15]} />
      
      {/* Weather effects */}
      <WeatherSystem weather={config.weather} />
      
      {/* Lighting */}
      <EnvironmentLighting weather={config.weather} />
    </group>
  );
};

// Interactive Training Tools
const TrainingToolsSetup: React.FC<{ tools: TrainingTool[] }> = ({ tools }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  return (
    <group>
      {tools.map((tool, index) => (
        <InteractiveTool
          key={tool.id}
          tool={tool}
          position={[index * 2, 1, -2]}
          selected={selectedTool === tool.id}
          onSelect={setSelectedTool}
        />
      ))}
    </group>
  );
};

// Individual Training Tool Component
const InteractiveTool: React.FC<{
  tool: TrainingTool;
  position: [number, number, number];
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ tool, position, selected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { world } = useRapier();

  const handleGrab = useCallback(() => {
    if (tool.interaction.grab) {
      onSelect(tool.id);
    }
  }, [tool, onSelect]);

  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <RigidBody position={position} colliders="hull">
      <mesh 
        ref={meshRef}
        onClick={handleGrab}
        onPointerEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Tool 3D model would be loaded here */}
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial 
          color={selected ? '#00ff00' : '#ffffff'} 
          emissive={selected ? '#004400' : '#000000'}
        />
      </mesh>
      
      {/* Tool label */}
      <Html position={[0, 0.5, 0]} center>
        <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {tool.name}
        </div>
      </Html>
    </RigidBody>
  );
};

// Voice Command Handler
const VoiceCommandHandler: React.FC<{ 
  onCommand: (command: string) => void;
  enabled: boolean 
}> = ({ onCommand, enabled }) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!enabled || !('webkitSpeechRecognition' in window)) return;

    recognition.current = new (window as any).webkitSpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = false;
    
    recognition.current.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      onCommand(command);
    };

    recognition.current.onstart = () => setIsListening(true);
    recognition.current.onend = () => setIsListening(false);

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [enabled, onCommand]);

  const toggleListening = () => {
    if (!recognition.current) return;

    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  return (
    <Html position={[0, 2, -1]} center>
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isListening ? <VolumeX size={16} /> : <Volume2 size={16} />}
        {isListening ? 'Stop Listening' : 'Voice Commands'}
      </Button>
    </Html>
  );
};

// Performance Assessment System
const PerformanceAssessment: React.FC<{
  objectives: TrainingObjective[];
  performance: PerformanceData;
  errors: TrainingError[];
}> = ({ objectives, performance, errors }) => {
  return (
    <Html position={[2, 1.5, -1]} transform>
      <Card className="w-80 bg-black bg-opacity-90 text-white border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            Performance Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {Math.round(performance.overall)}%
            </div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Accuracy</span>
              <Progress value={performance.accuracy} className="w-20" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Efficiency</span>
              <Progress value={performance.efficiency} className="w-20" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Safety</span>
              <Progress value={performance.safety} className="w-20" />
            </div>
          </div>

          {/* Objectives Status */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Objectives</div>
            {objectives.map(objective => (
              <div key={objective.id} className="flex items-center gap-2 text-xs">
                {objective.completed ? (
                  <CheckCircle className="text-green-400" size={16} />
                ) : (
                  <XCircle className="text-red-400" size={16} />
                )}
                <span className={objective.completed ? 'text-green-400' : 'text-gray-400'}>
                  {objective.description}
                </span>
              </div>
            ))}
          </div>

          {/* Errors Summary */}
          {errors.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-red-400">Errors ({errors.length})</div>
              {errors.slice(0, 3).map(error => (
                <div key={error.id} className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="text-yellow-400" size={12} />
                  <span className="text-gray-400">{error.description}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Html>
  );
};

// Main VR Training Simulator Component
const VRTrainingSimulator: React.FC = () => {
  const [trainingState, setTrainingState] = useState<TrainingState>({
    currentScenario: null,
    isActive: false,
    startTime: 0,
    elapsedTime: 0,
    score: 0,
    completedObjectives: [],
    errors: [],
    performance: {
      accuracy: 0,
      efficiency: 0,
      safety: 0,
      overall: 0,
      timeToComplete: 0,
      errorsCount: 0
    }
  });

  const [selectedScenario, setSelectedScenario] = useState<string>('basic_inspection');
  const [vrEnabled, setVrEnabled] = useState(false);

  // Training scenarios
  const scenarios: TrainingScenario[] = [
    {
      id: 'basic_inspection',
      title: 'Basic Pavement Inspection',
      description: 'Learn fundamental pavement inspection techniques and crack identification.',
      difficulty: 'beginner',
      duration: 15,
      objectives: [
        {
          id: 'identify_cracks',
          description: 'Identify 5 different types of cracks',
          type: 'knowledge',
          completed: false
        },
        {
          id: 'measure_crack_length',
          description: 'Accurately measure crack lengths',
          type: 'task',
          completed: false
        },
        {
          id: 'document_findings',
          description: 'Properly document all findings',
          type: 'task',
          completed: false
        }
      ],
      environment: {
        type: 'parking_lot',
        weather: 'sunny',
        traffic: 'none',
        complexity: 3
      },
      tools: [
        {
          id: 'crack_ruler',
          name: 'Crack Measurement Ruler',
          model: '/models/tools/ruler.glb',
          category: 'measurement',
          interaction: { grab: true, point: true, voice: false, gesture: false }
        },
        {
          id: 'tablet',
          name: 'Digital Inspection Tablet',
          model: '/models/tools/tablet.glb',
          category: 'analysis',
          interaction: { grab: true, point: true, voice: true, gesture: true }
        }
      ],
      assessment: {
        timeLimit: 900, // 15 minutes
        accuracyThreshold: 80,
        safetyRequirements: ['wear_safety_vest', 'use_proper_tools'],
        performanceMetrics: [
          { name: 'crack_identification_accuracy', weight: 0.4, target: 90, current: 0 },
          { name: 'measurement_precision', weight: 0.3, target: 95, current: 0 },
          { name: 'documentation_completeness', weight: 0.3, target: 100, current: 0 }
        ]
      }
    },
    {
      id: 'emergency_repair',
      title: 'Emergency Pothole Repair',
      description: 'Practice emergency repair procedures for safety-critical pavement failures.',
      difficulty: 'intermediate',
      duration: 30,
      objectives: [
        {
          id: 'assess_damage',
          description: 'Assess pothole damage and determine repair method',
          type: 'knowledge',
          completed: false
        },
        {
          id: 'setup_safety_zone',
          description: 'Establish proper safety perimeter',
          type: 'safety',
          completed: false
        },
        {
          id: 'perform_repair',
          description: 'Execute cold patch repair procedure',
          type: 'task',
          completed: false
        }
      ],
      environment: {
        type: 'highway',
        weather: 'rainy',
        traffic: 'moderate',
        complexity: 7
      },
      tools: [
        {
          id: 'cold_patch',
          name: 'Cold Patch Material',
          model: '/models/tools/cold_patch.glb',
          category: 'repair',
          interaction: { grab: true, point: false, voice: false, gesture: false }
        },
        {
          id: 'tamper',
          name: 'Hand Tamper',
          model: '/models/tools/tamper.glb',
          category: 'repair',
          interaction: { grab: true, point: false, voice: false, gesture: true }
        },
        {
          id: 'safety_cones',
          name: 'Traffic Safety Cones',
          model: '/models/tools/cones.glb',
          category: 'safety',
          interaction: { grab: true, point: true, voice: false, gesture: false }
        }
      ],
      assessment: {
        timeLimit: 1800, // 30 minutes
        accuracyThreshold: 85,
        safetyRequirements: ['establish_work_zone', 'wear_high_vis', 'check_traffic'],
        performanceMetrics: [
          { name: 'safety_compliance', weight: 0.5, target: 100, current: 0 },
          { name: 'repair_quality', weight: 0.3, target: 90, current: 0 },
          { name: 'time_efficiency', weight: 0.2, target: 80, current: 0 }
        ]
      }
    }
  ];

  const handleVoiceCommand = useCallback((command: string) => {
    // Process voice commands for training interaction
    switch (command) {
      case 'start training':
        startTraining();
        break;
      case 'pause training':
        pauseTraining();
        break;
      case 'reset':
        resetTraining();
        break;
      case 'help':
        showHelp();
        break;
      default:
        // Process scenario-specific commands
        processScenarioCommand(command);
    }
  }, [trainingState]);

  const startTraining = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    setTrainingState({
      ...trainingState,
      currentScenario: scenario,
      isActive: true,
      startTime: Date.now(),
      elapsedTime: 0,
      completedObjectives: [],
      errors: []
    });
  };

  const pauseTraining = () => {
    setTrainingState({
      ...trainingState,
      isActive: false
    });
  };

  const resetTraining = () => {
    setTrainingState({
      currentScenario: null,
      isActive: false,
      startTime: 0,
      elapsedTime: 0,
      score: 0,
      completedObjectives: [],
      errors: [],
      performance: {
        accuracy: 0,
        efficiency: 0,
        safety: 0,
        overall: 0,
        timeToComplete: 0,
        errorsCount: 0
      }
    });
  };

  const showHelp = () => {
    // Show contextual help based on current scenario
  };

  const processScenarioCommand = (command: string) => {
    if (!trainingState.currentScenario) return;
    
    // Process scenario-specific voice commands
    // This would be implemented based on the current scenario's requirements
  };

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Training Control Panel */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="w-80 bg-black bg-opacity-90 text-white border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-blue-400" size={20} />
              VR Training Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scenario Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Training Scenario</label>
              <select 
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                {scenarios.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title} ({scenario.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Training Controls */}
            <div className="flex gap-2">
              <Button
                onClick={startTraining}
                disabled={trainingState.isActive}
                size="sm"
                className="flex-1"
              >
                <Play size={16} className="mr-1" />
                Start
              </Button>
              <Button
                onClick={pauseTraining}
                disabled={!trainingState.isActive}
                variant="outline"
                size="sm"
              >
                <Pause size={16} />
              </Button>
              <Button
                onClick={resetTraining}
                variant="outline"
                size="sm"
              >
                <RotateCcw size={16} />
              </Button>
            </div>

            {/* Training Status */}
            {trainingState.currentScenario && (
              <div className="space-y-2 pt-2 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Elapsed</span>
                  <Badge variant="outline">
                    <Clock size={12} className="mr-1" />
                    {Math.floor(trainingState.elapsedTime / 60)}:{String(trainingState.elapsedTime % 60).padStart(2, '0')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Score</span>
                  <Badge variant="outline">
                    <Target size={12} className="mr-1" />
                    {trainingState.score}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Objectives</span>
                  <Badge variant="outline">
                    {trainingState.completedObjectives.length}/{trainingState.currentScenario.objectives.length}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* VR/AR Entry Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <VRButton />
        <ARButton />
      </div>

      {/* 3D Training Environment */}
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        shadows
        gl={{ antialias: true }}
      >
        <XR>
          <color attach="background" args={['#1a1a2e']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Physics */}
          <Physics gravity={[0, -9.81, 0]}>
            {/* Training Environment */}
            {trainingState.currentScenario && (
              <VRTrainingEnvironment scenario={trainingState.currentScenario} />
            )}

            {/* Controllers and Hand Tracking */}
            <Controllers />
            <Hands />

            {/* Voice Command Handler */}
            <VoiceCommandHandler
              onCommand={handleVoiceCommand}
              enabled={trainingState.isActive}
            />

            {/* Performance Assessment Display */}
            {trainingState.currentScenario && (
              <PerformanceAssessment
                objectives={trainingState.currentScenario.objectives}
                performance={trainingState.performance}
                errors={trainingState.errors}
              />
            )}
          </Physics>

          {/* Environment */}
          <Environment preset="warehouse" />
          <Grid
            position={[0, -0.01, 0]}
            args={[10.5, 10.5]}
            cellSize={0.6}
            cellThickness={1}
            cellColor={'#6f6f6f'}
            sectionSize={3.3}
            sectionThickness={1.5}
            sectionColor={'#9d4b4b'}
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />

          {/* Performance Stats */}
          <Stats />
        </XR>
      </Canvas>
    </div>
  );
};

export default VRTrainingSimulator;