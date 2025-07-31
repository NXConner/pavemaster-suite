import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Points, 
  PointMaterial, 
  OrbitControls, 
  Text, 
  Html,
  Sphere,
  Box,
  Line,
  Float
} from '@react-three/drei';
import { 
  Vector3, 
  BufferGeometry, 
  Float32BufferAttribute, 
  Color,
  MathUtils,
  AdditiveBlending
} from 'three';
import * as THREE from 'three';

interface QuantumState {
  qubits: number;
  coherenceTime: number;
  fidelity: number;
  entanglement: number;
  gateErrors: number;
}

interface Quantum3DProps {
  quantumData: QuantumState;
  width?: number;
  height?: number;
}

// Quantum Particle System Component
const QuantumParticles: React.FC<{ count: number; quantumData: QuantumState }> = ({ 
  count, 
  quantumData 
}) => {
  const mesh = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);
  
  // Generate particle positions
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create quantum-inspired particle distribution
      const radius = MathUtils.randFloat(1, 5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color based on quantum coherence
      const coherenceLevel = quantumData.coherenceTime / 1000;
      colors[i * 3] = 0.5 + coherenceLevel * 0.5; // Red
      colors[i * 3 + 1] = 0.3 + coherenceLevel * 0.7; // Green
      colors[i * 3 + 2] = 0.8 + coherenceLevel * 0.2; // Blue
    }
    
    return [positions, colors];
  }, [count, quantumData.coherenceTime]);

  useFrame((state) => {
    if (mesh.current) {
      // Rotate particles based on quantum entanglement
      mesh.current.rotation.x = state.clock.elapsedTime * 0.05 * quantumData.entanglement;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1 * quantumData.entanglement;
      
      // Update particle positions for quantum fluctuations
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (light.current) {
      // Pulse light based on fidelity
      light.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * quantumData.fidelity * 0.5;
    }
  });

  return (
    <group>
      <Points ref={mesh} positions={positions} colors={colors}>
        <PointMaterial
          size={0.05}
          vertexColors
          blending={AdditiveBlending}
          sizeAttenuation={true}
          transparent
          opacity={0.8}
        />
      </Points>
      <pointLight ref={light} position={[0, 0, 0]} color="#8b5cf6" intensity={1} />
    </group>
  );
};

// Quantum State Visualization (Bloch Sphere-inspired)
const QuantumStateVisualization: React.FC<{ quantumData: QuantumState }> = ({ quantumData }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const vectorRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    if (vectorRef.current) {
      // Animate quantum state vector based on coherence
      const coherence = quantumData.coherenceTime / 1000;
      vectorRef.current.position.x = Math.cos(state.clock.elapsedTime) * coherence;
      vectorRef.current.position.z = Math.sin(state.clock.elapsedTime) * coherence;
      vectorRef.current.position.y = quantumData.fidelity - 0.5;
    }
  });

  return (
    <group position={[3, 0, 0]}>
      {/* Bloch Sphere */}
      <Sphere ref={sphereRef} args={[1, 32, 32]}>
        <meshStandardMaterial 
          color="#4f46e5" 
          transparent 
          opacity={0.2} 
          wireframe 
        />
      </Sphere>
      
      {/* Quantum State Vector */}
      <Sphere ref={vectorRef} args={[0.05, 8, 8]} position={[0, 0, 0.5]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Coordinate axes */}
      <Line 
        points={[[-1, 0, 0], [1, 0, 0]]} 
        color="#ef4444" 
        lineWidth={2}
      />
      <Line 
        points={[[0, -1, 0], [0, 1, 0]]} 
        color="#10b981" 
        lineWidth={2}
      />
      <Line 
        points={[[0, 0, -1], [0, 0, 1]]} 
        color="#8b5cf6" 
        lineWidth={2}
      />
      
      {/* Labels */}
      <Text
        position={[1.2, 0, 0]}
        fontSize={0.1}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.1}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        |+⟩
      </Text>
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.1}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>
    </group>
  );
};

// Quantum Gate Visualization
const QuantumGateVisualization: React.FC<{ quantumData: QuantumState }> = ({ quantumData }) => {
  const gateRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    gateRefs.current.forEach((gate, index) => {
      if (gate) {
        gate.rotation.x = state.clock.elapsedTime * (0.5 + index * 0.1);
        gate.rotation.z = state.clock.elapsedTime * (0.3 + index * 0.05);
        
        // Scale based on gate errors
        const scale = 1 - quantumData.gateErrors * 0.5;
        gate.scale.setScalar(scale);
      }
    });
  });

  return (
    <group position={[-3, 0, 0]}>
      {Array.from({ length: quantumData.qubits }, (_, i) => (
        <Float
          key={i}
          speed={1 + i * 0.1}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Box
            ref={(el) => {
              if (el) gateRefs.current[i] = el;
            }}
            args={[0.3, 0.3, 0.3]}
            position={[0, i * 0.5 - quantumData.qubits * 0.25, 0]}
          >
            <meshStandardMaterial 
              color={new Color().setHSL(i / quantumData.qubits, 0.8, 0.6)}
              emissive={new Color().setHSL(i / quantumData.qubits, 0.8, 0.2)}
              emissiveIntensity={0.3}
            />
          </Box>
        </Float>
      ))}
      
      {/* Connecting lines between qubits */}
      {Array.from({ length: quantumData.qubits - 1 }, (_, i) => (
        <Line
          key={i}
          points={[
            [0, i * 0.5 - quantumData.qubits * 0.25 + 0.15, 0],
            [0, (i + 1) * 0.5 - quantumData.qubits * 0.25 - 0.15, 0]
          ]}
          color="#8b5cf6"
          lineWidth={2}
          transparent
          opacity={quantumData.entanglement}
        />
      ))}
      
      <Text
        position={[0, -2, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {quantumData.qubits} Qubits
      </Text>
    </group>
  );
};

// HUD Overlay for metrics
const QuantumHUD: React.FC<{ quantumData: QuantumState }> = ({ quantumData }) => {
  return (
    <Html
      position={[0, 3, 0]}
      center
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #8b5cf6',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '12px',
        minWidth: '200px'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Qubits:</div>
          <div>{quantumData.qubits}</div>
        </div>
        <div>
          <div style={{ color: '#06b6d4', fontWeight: 'bold' }}>Coherence:</div>
          <div>{quantumData.coherenceTime.toFixed(0)}μs</div>
        </div>
        <div>
          <div style={{ color: '#10b981', fontWeight: 'bold' }}>Fidelity:</div>
          <div>{(quantumData.fidelity * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Entanglement:</div>
          <div>{(quantumData.entanglement * 100).toFixed(1)}%</div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Gate Errors:</div>
          <div>{(quantumData.gateErrors * 100).toFixed(3)}%</div>
        </div>
      </div>
    </Html>
  );
};

// Main 3D Scene
const QuantumScene: React.FC<{ quantumData: QuantumState }> = ({ quantumData }) => {
  return (
    <>
      {/* Background particles */}
      <QuantumParticles count={200} quantumData={quantumData} />
      
      {/* Quantum state visualization */}
      <QuantumStateVisualization quantumData={quantumData} />
      
      {/* Quantum gates */}
      <QuantumGateVisualization quantumData={quantumData} />
      
      {/* HUD overlay */}
      <QuantumHUD quantumData={quantumData} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.5} 
        color="#ffffff" 
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1} 
        color="#8b5cf6" 
      />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main Component
const QuantumVisualization3D: React.FC<Quantum3DProps> = ({ 
  quantumData, 
  width = 400, 
  height = 300 
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        camera={{ position: [8, 5, 8], fov: 60 }}
        style={{ 
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' 
        }}
      >
        <QuantumScene quantumData={quantumData} />
      </Canvas>
      
      {/* Corner indicator */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(139, 92, 246, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}
      >
        3D QUANTUM VIZ
      </div>
    </div>
  );
};

export default QuantumVisualization3D;