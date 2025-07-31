import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, Maximize2, Download, Settings, Eye, EyeOff,
  Ruler, Calculator, Box, Palette, Camera, Scan3D
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MeasurementOverlay3D {
  id: string;
  name: string;
  type: 'distance' | 'area' | 'volume' | 'height' | 'angle';
  points: THREE.Vector3[];
  value: number;
  unit: string;
  color: string;
  visible: boolean;
  highlighted: boolean;
}

interface AsphaltArea3D {
  id: string;
  name: string;
  vertices: THREE.Vector3[];
  height: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  texture?: string;
  measurements: {
    area: number;
    volume: number;
    thickness: number;
  };
}

interface ParkingSpace3D {
  id: string;
  position: THREE.Vector3;
  rotation: number;
  type: 'standard' | 'accessible' | 'compact' | 'electric';
  dimensions: { width: number; length: number; height: number };
  occupied: boolean;
}

interface Scene3DProps {
  measurements: MeasurementOverlay3D[];
  asphaltAreas: AsphaltArea3D[];
  parkingSpaces: ParkingSpace3D[];
  backgroundMode: 'white' | 'black' | 'transparent' | 'blueprint';
  showGrid: boolean;
  showLabels: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  lighting: 'natural' | 'studio' | 'dramatic';
  onMeasurementClick: (measurement: MeasurementOverlay3D) => void;
}

// 3D Measurement Line Component
const MeasurementLine: React.FC<{
  measurement: MeasurementOverlay3D;
  onClick: () => void;
}> = ({ measurement, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  });

  if (measurement.points.length < 2) return null;

  const start = measurement.points[0];
  const end = measurement.points[measurement.points.length - 1];
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  return (
    <group>
      {/* Line */}
      <mesh
        ref={meshRef}
        position={midpoint}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.02, 0.02, length, 8]} />
        <meshStandardMaterial 
          color={measurement.color} 
          transparent={!measurement.visible}
          opacity={measurement.visible ? 1 : 0.3}
        />
      </mesh>

      {/* End points */}
      {measurement.points.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={measurement.color} />
        </mesh>
      ))}

      {/* Label */}
      {measurement.visible && (
        <Html position={midpoint} center>
          <div className="bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs border">
            <div className="font-medium">{measurement.name}</div>
            <div>{measurement.value.toFixed(2)} {measurement.unit}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Area Overlay Component
const AreaOverlay3D: React.FC<{
  measurement: MeasurementOverlay3D;
  onClick: () => void;
}> = ({ measurement, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  if (measurement.points.length < 3) return null;

  // Create shape from points
  const shape = new THREE.Shape();
  measurement.points.forEach((point, index) => {
    if (index === 0) {
      shape.moveTo(point.x, point.z);
    } else {
      shape.lineTo(point.x, point.z);
    }
  });

  return (
    <group>
      {/* Area plane */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={measurement.color}
          transparent
          opacity={measurement.visible ? (hovered ? 0.6 : 0.4) : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outline */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={measurement.points.length}
            array={new Float32Array(measurement.points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={measurement.color} linewidth={2} />
      </lineLoop>

      {/* Label at centroid */}
      {measurement.visible && (
        <Html position={getCentroid(measurement.points)} center>
          <div className="bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs border">
            <div className="font-medium">{measurement.name}</div>
            <div>{measurement.value.toFixed(2)} {measurement.unit}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Asphalt Surface Component
const AsphaltSurface3D: React.FC<{
  asphaltArea: AsphaltArea3D;
}> = ({ asphaltArea }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create extruded geometry from vertices
  const shape = new THREE.Shape();
  asphaltArea.vertices.forEach((vertex, index) => {
    if (index === 0) {
      shape.moveTo(vertex.x, vertex.z);
    } else {
      shape.lineTo(vertex.x, vertex.z);
    }
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#4ade80';
      case 'good': return '#22d3ee';
      case 'fair': return '#fbbf24';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <group>
      {/* Asphalt surface */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <extrudeGeometry 
          args={[
            shape, 
            { 
              depth: asphaltArea.height,
              bevelEnabled: false
            }
          ]} 
        />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : getConditionColor(asphaltArea.condition)}
          transparent
          opacity={0.8}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Condition indicator */}
      {hovered && (
        <Html position={getCentroid(asphaltArea.vertices)} center>
          <Card className="w-48">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="font-medium">{asphaltArea.name}</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>Condition:</div>
                  <Badge variant={asphaltArea.condition === 'good' ? 'default' : 'destructive'}>
                    {asphaltArea.condition}
                  </Badge>
                  <div>Area:</div>
                  <div>{asphaltArea.measurements.area.toFixed(1)} m²</div>
                  <div>Volume:</div>
                  <div>{asphaltArea.measurements.volume.toFixed(1)} m³</div>
                  <div>Thickness:</div>
                  <div>{asphaltArea.measurements.thickness.toFixed(1)} cm</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Html>
      )}
    </group>
  );
};

// Parking Space Component
const ParkingSpace3D: React.FC<{
  parkingSpace: ParkingSpace3D;
}> = ({ parkingSpace }) => {
  const getSpaceColor = (type: string, occupied: boolean) => {
    if (occupied) return '#ef4444';
    switch (type) {
      case 'accessible': return '#3b82f6';
      case 'electric': return '#10b981';
      case 'compact': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <group position={parkingSpace.position} rotation={[0, parkingSpace.rotation, 0]}>
      {/* Parking space outline */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={new Float32Array([
              -parkingSpace.dimensions.width/2, 0, -parkingSpace.dimensions.length/2,
              parkingSpace.dimensions.width/2, 0, -parkingSpace.dimensions.length/2,
              parkingSpace.dimensions.width/2, 0, parkingSpace.dimensions.length/2,
              -parkingSpace.dimensions.width/2, 0, parkingSpace.dimensions.length/2,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={getSpaceColor(parkingSpace.type, parkingSpace.occupied)} 
          linewidth={3}
        />
      </lineLoop>

      {/* Space fill if occupied */}
      {parkingSpace.occupied && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[parkingSpace.dimensions.width, parkingSpace.dimensions.length]} />
          <meshStandardMaterial 
            color={getSpaceColor(parkingSpace.type, true)}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Space number */}
      <Html position={[0, 0.1, 0]} center>
        <div className="text-xs font-mono bg-background/80 rounded px-1">
          {parkingSpace.id.split('-')[1]}
        </div>
      </Html>
    </group>
  );
};

// Camera Controller Component
const CameraController: React.FC<{
  autoRotate: boolean;
  rotationSpeed: number;
}> = ({ autoRotate, rotationSpeed }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (autoRotate) {
      camera.position.x = Math.cos(Date.now() * 0.001 * rotationSpeed) * 20;
      camera.position.z = Math.sin(Date.now() * 0.001 * rotationSpeed) * 20;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

// Main Scene Component
const Scene3D: React.FC<Scene3DProps> = ({
  measurements,
  asphaltAreas,
  parkingSpaces,
  backgroundMode,
  showGrid,
  showLabels,
  autoRotate,
  rotationSpeed,
  lighting,
  onMeasurementClick
}) => {
  const getBackgroundColor = () => {
    switch (backgroundMode) {
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      case 'blueprint': return '#001133';
      default: return undefined;
    }
  };

  return (
    <>
      {/* Background */}
      {backgroundMode !== 'transparent' && (
        <color attach="background" args={[getBackgroundColor()]} />
      )}

      {/* Lighting */}
      {lighting === 'natural' && (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
        </>
      )}

      {lighting === 'studio' && (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          <pointLight position={[0, 15, 0]} intensity={0.4} />
        </>
      )}

      {lighting === 'dramatic' && (
        <>
          <ambientLight intensity={0.2} />
          <spotLight
            position={[0, 20, 0]}
            angle={0.3}
            penumbra={0.5}
            intensity={1}
            castShadow
          />
        </>
      )}

      {/* Grid */}
      {showGrid && (
        <Grid 
          args={[50, 50]} 
          position={[0, -0.01, 0]}
          cellColor={backgroundMode === 'white' ? '#cccccc' : '#444444'}
          sectionColor={backgroundMode === 'white' ? '#888888' : '#666666'}
        />
      )}

      {/* Camera Controller */}
      <CameraController autoRotate={autoRotate} rotationSpeed={rotationSpeed} />

      {/* Measurements */}
      {measurements.map(measurement => (
        <group key={measurement.id}>
          {measurement.type === 'distance' && (
            <MeasurementLine
              measurement={measurement}
              onClick={() => onMeasurementClick(measurement)}
            />
          )}
          {(measurement.type === 'area' || measurement.type === 'volume') && (
            <AreaOverlay3D
              measurement={measurement}
              onClick={() => onMeasurementClick(measurement)}
            />
          )}
        </group>
      ))}

      {/* Asphalt Areas */}
      {asphaltAreas.map(area => (
        <AsphaltSurface3D key={area.id} asphaltArea={area} />
      ))}

      {/* Parking Spaces */}
      {parkingSpaces.map(space => (
        <ParkingSpace3D key={space.id} parkingSpace={space} />
      ))}
    </>
  );
};

// Main Enhanced 3D Visualization Component
const Enhanced3DVisualization: React.FC<{
  measurements?: MeasurementOverlay3D[];
  asphaltAreas?: AsphaltArea3D[];
  parkingSpaces?: ParkingSpace3D[];
  onExport?: () => void;
}> = ({ 
  measurements = [], 
  asphaltAreas = [], 
  parkingSpaces = [],
  onExport 
}) => {
  const [backgroundMode, setBackgroundMode] = useState<'white' | 'black' | 'transparent' | 'blueprint'>('white');
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [lighting, setLighting] = useState<'natural' | 'studio' | 'dramatic'>('natural');
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementOverlay3D | null>(null);

  const handleMeasurementClick = useCallback((measurement: MeasurementOverlay3D) => {
    setSelectedMeasurement(measurement);
  }, []);

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `3d-visualization-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold flex items-center">
            <Scan3D className="mr-2 w-5 h-5" />
            3D Visualization
          </h3>
          <Badge variant="outline">
            {measurements.length} Measurements
          </Badge>
          <Badge variant="outline">
            {asphaltAreas.length} Areas
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* Background Mode */}
          <Select value={backgroundMode} onValueChange={(value: any) => setBackgroundMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Background" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="transparent">Transparent</SelectItem>
              <SelectItem value="blueprint">Blueprint</SelectItem>
            </SelectContent>
          </Select>

          {/* Lighting */}
          <Select value={lighting} onValueChange={(value: any) => setLighting(value)}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Lighting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Side Panel */}
        <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
          <div className="p-4 space-y-4">
            {/* View Controls */}
            <div className="space-y-3">
              <h4 className="font-medium">View Controls</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="grid">Show Grid</Label>
                <Switch
                  id="grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="labels">Show Labels</Label>
                <Switch
                  id="labels"
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="rotate">Auto Rotate</Label>
                <Switch
                  id="rotate"
                  checked={autoRotate}
                  onCheckedChange={setAutoRotate}
                />
              </div>

              {autoRotate && (
                <div className="space-y-2">
                  <Label>Rotation Speed</Label>
                  <Slider
                    value={[rotationSpeed]}
                    onValueChange={([value]) => setRotationSpeed(value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Measurements List */}
            {measurements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Measurements</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {measurements.map(measurement => (
                    <div
                      key={measurement.id}
                      className={`p-2 rounded cursor-pointer border ${
                        selectedMeasurement?.id === measurement.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border'
                      }`}
                      onClick={() => handleMeasurementClick(measurement)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: measurement.color }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{measurement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {measurement.value.toFixed(2)} {measurement.unit}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle visibility
                          }}
                        >
                          {measurement.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Asphalt Areas List */}
            {asphaltAreas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Asphalt Areas</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {asphaltAreas.map(area => (
                    <div key={area.id} className="p-2 rounded border">
                      <div className="text-sm font-medium">{area.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {area.measurements.area.toFixed(1)} m² • {area.condition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [10, 10, 10], fov: 50 }}
            style={{ background: backgroundMode === 'transparent' ? 'transparent' : undefined }}
          >
            <Scene3D
              measurements={measurements}
              asphaltAreas={asphaltAreas}
              parkingSpaces={parkingSpaces}
              backgroundMode={backgroundMode}
              showGrid={showGrid}
              showLabels={showLabels}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              lighting={lighting}
              onMeasurementClick={handleMeasurementClick}
            />
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={rotationSpeed}
            />
          </Canvas>

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate centroid
const getCentroid = (points: THREE.Vector3[]): THREE.Vector3 => {
  const centroid = new THREE.Vector3();
  points.forEach(point => centroid.add(point));
  centroid.divideScalar(points.length);
  return centroid;
};

export default Enhanced3DVisualization;
export type { MeasurementOverlay3D, AsphaltArea3D, ParkingSpace3D };