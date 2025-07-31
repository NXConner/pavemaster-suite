import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, Controllers, Hands, Interactive } from '@react-three/xr';
import { 
  Points, 
  PointMaterial, 
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
import { motion } from 'framer-motion';

interface QuantumState {
  qubits: number;
  coherenceTime: number;
  fidelity: number;
  entanglement: number;
  gateErrors: number;
}

interface WebXRQuantumProps {
  quantumData: QuantumState;
  onGestureCommand?: (command: string) => void;
  onVoiceCommand?: (command: string) => void;
}

// Voice Command System for WebXR
const useVoiceCommands = (onCommand: (command: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      const commands = {
        'increase qubits': 'INCREASE_QUBITS',
        'decrease qubits': 'DECREASE_QUBITS',
        'reset quantum state': 'RESET_QUANTUM',
        'show quantum gates': 'SHOW_GATES',
        'hide quantum gates': 'HIDE_GATES',
        'toggle particle system': 'TOGGLE_PARTICLES',
        'zoom in': 'ZOOM_IN',
        'zoom out': 'ZOOM_OUT',
        'rotate left': 'ROTATE_LEFT',
        'rotate right': 'ROTATE_RIGHT'
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        if (commands[transcript]) {
          onCommand(commands[transcript]);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening };
};

// Hand Gesture Recognition for Quantum Control
const useQuantumGestures = (onGesture: (gesture: string) => void) => {
  const [gestureState, setGestureState] = useState<string>('none');
  const lastGestureTime = useRef<number>(0);

  const processHandData = useCallback((handData: any) => {
    if (!handData || !handData.joints) return;

    const now = Date.now();
    if (now - lastGestureTime.current < 1000) return; // Debounce gestures

    // Simple gesture detection based on hand positions
    const indexTip = handData.joints['index-finger-tip'];
    const thumbTip = handData.joints['thumb-tip'];
    const middleTip = handData.joints['middle-finger-tip'];

    if (indexTip && thumbTip && middleTip) {
      const indexThumbDistance = indexTip.position.distanceTo(thumbTip.position);
      const indexMiddleDistance = indexTip.position.distanceTo(middleTip.position);

      // Pinch gesture (index and thumb close)
      if (indexThumbDistance < 0.03) {
        if (gestureState !== 'pinch') {
          setGestureState('pinch');
          onGesture('PINCH_GESTURE');
          lastGestureTime.current = now;
        }
      }
      // Point gesture (index extended, others closed)
      else if (indexMiddleDistance > 0.05) {
        if (gestureState !== 'point') {
          setGestureState('point');
          onGesture('POINT_GESTURE');
          lastGestureTime.current = now;
        }
      }
      // Open hand (all fingers extended)
      else if (indexThumbDistance > 0.08 && indexMiddleDistance < 0.03) {
        if (gestureState !== 'open') {
          setGestureState('open');
          onGesture('OPEN_HAND_GESTURE');
          lastGestureTime.current = now;
        }
      }
      else {
        setGestureState('none');
      }
    }
  }, [gestureState, onGesture]);

  return { gestureState, processHandData };
};

// Interactive Quantum Particle System with XR Support
const InteractiveQuantumParticles: React.FC<{ 
  count: number; 
  quantumData: QuantumState;
  onInteraction?: (type: string) => void;
}> = ({ count, quantumData, onInteraction }) => {
  const mesh = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Generate particle positions with quantum-inspired distribution
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Quantum-inspired spherical distribution
      const radius = MathUtils.randFloat(1, 5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color based on quantum coherence and entanglement
      const coherenceLevel = quantumData.coherenceTime / 1000;
      const entanglementLevel = quantumData.entanglement;
      
      colors[i * 3] = 0.5 + coherenceLevel * 0.5; // Red channel
      colors[i * 3 + 1] = 0.3 + entanglementLevel * 0.7; // Green channel
      colors[i * 3 + 2] = 0.8 + coherenceLevel * 0.2; // Blue channel
    }
    
    return [positions, colors];
  }, [count, quantumData.coherenceTime, quantumData.entanglement]);

  useFrame((state) => {
    if (mesh.current) {
      // Quantum fluctuation animation
      mesh.current.rotation.x = state.clock.elapsedTime * 0.05 * quantumData.entanglement;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1 * quantumData.entanglement;
      
      // Particle position updates for quantum uncertainty
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
      
      // Scale based on interaction state
      const targetScale = isHovered ? 1.2 : isSelected ? 1.5 : 1.0;
      mesh.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    if (light.current) {
      // Pulsing light based on quantum fidelity
      light.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * quantumData.fidelity * 0.5;
      
      // Color shift based on entanglement
      const hue = (state.clock.elapsedTime * 0.1 + quantumData.entanglement) % 1;
      light.current.color.setHSL(hue, 0.8, 0.6);
    }
  });

  return (
    <Interactive
      onHover={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onSelect={() => {
        setIsSelected(!isSelected);
        onInteraction?.('particle_select');
      }}
    >
      <group>
        <Points ref={mesh} positions={positions} colors={colors}>
          <PointMaterial
            size={isHovered ? 0.08 : 0.05}
            vertexColors
            blending={AdditiveBlending}
            sizeAttenuation={true}
            transparent
            opacity={isSelected ? 0.9 : 0.8}
          />
        </Points>
        <pointLight 
          ref={light} 
          position={[0, 0, 0]} 
          color="#8b5cf6" 
          intensity={1}
          distance={20}
          decay={2}
        />
      </group>
    </Interactive>
  );
};

// Interactive Bloch Sphere with XR Controls
const InteractiveBlochSphere: React.FC<{ 
  quantumData: QuantumState;
  onStateChange?: (newState: Partial<QuantumState>) => void;
}> = ({ quantumData, onStateChange }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const vectorRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [vectorPosition, setVectorPosition] = useState(new Vector3(0, 0, 0.5));

  useFrame((state) => {
    if (sphereRef.current && !isDragging) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    if (vectorRef.current) {
      if (!isDragging) {
        // Animate quantum state vector based on coherence
        const coherence = quantumData.coherenceTime / 1000;
        vectorRef.current.position.x = Math.cos(state.clock.elapsedTime) * coherence;
        vectorRef.current.position.z = Math.sin(state.clock.elapsedTime) * coherence;
        vectorRef.current.position.y = quantumData.fidelity - 0.5;
      } else {
        vectorRef.current.position.copy(vectorPosition);
      }
    }
  });

  const handleVectorDrag = useCallback((event: any) => {
    if (event.point) {
      const newPos = event.point.clone().normalize();
      setVectorPosition(newPos);
      
      // Update quantum state based on vector position
      const newFidelity = (newPos.y + 1) / 2; // Map -1,1 to 0,1
      const newCoherence = Math.sqrt(newPos.x * newPos.x + newPos.z * newPos.z) * 1000;
      
      onStateChange?.({
        fidelity: Math.max(0, Math.min(1, newFidelity)),
        coherenceTime: Math.max(0, Math.min(1000, newCoherence))
      });
    }
  }, [onStateChange]);

  return (
    <group position={[3, 0, 0]}>
      {/* Interactive Bloch Sphere */}
      <Interactive
        onHover={() => sphereRef.current && (sphereRef.current.material.opacity = 0.3)}
        onBlur={() => sphereRef.current && (sphereRef.current.material.opacity = 0.2)}
      >
        <Sphere ref={sphereRef} args={[1, 32, 32]}>
          <meshStandardMaterial 
            color="#4f46e5" 
            transparent 
            opacity={0.2} 
            wireframe 
          />
        </Sphere>
      </Interactive>
      
      {/* Interactive Quantum State Vector */}
      <Interactive
        onSelectStart={() => setIsDragging(true)}
        onSelectEnd={() => setIsDragging(false)}
        onMove={handleVectorDrag}
      >
        <Sphere ref={vectorRef} args={[0.05, 8, 8]} position={vectorPosition}>
          <meshStandardMaterial 
            color={isDragging ? "#06d6a0" : "#06b6d4"} 
            emissive={isDragging ? "#06d6a0" : "#06b6d4"} 
            emissiveIntensity={isDragging ? 0.8 : 0.5} 
          />
        </Sphere>
      </Interactive>
      
      {/* Coordinate axes with labels */}
      <Line points={[[-1, 0, 0], [1, 0, 0]]} color="#ef4444" lineWidth={2} />
      <Line points={[[0, -1, 0], [0, 1, 0]]} color="#10b981" lineWidth={2} />
      <Line points={[[0, 0, -1], [0, 0, 1]]} color="#8b5cf6" lineWidth={2} />
      
      {/* XR-optimized text labels */}
      <Text
        position={[1.2, 0, 0]}
        fontSize={0.1}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        |0⟩
      </Text>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.1}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        |+⟩
      </Text>
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.1}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        |1⟩
      </Text>
    </group>
  );
};

// WebXR Control Panel for Quantum Visualization
const WebXRQuantumControls: React.FC<{
  quantumData: QuantumState;
  isListening: boolean;
  gestureState: string;
  onToggleVoice: () => void;
  onQuantumCommand: (command: string) => void;
}> = ({ quantumData, isListening, gestureState, onToggleVoice, onQuantumCommand }) => {
  return (
    <group position={[0, 2.5, -3]}>
      {/* Floating control panel */}
      <Html
        transform
        occlude
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #8b5cf6',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          minWidth: '320px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#8b5cf6' }}>
            🌌 Quantum Control Center
          </h3>
          
          {/* Quantum Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ color: '#06b6d4', fontWeight: 'bold' }}>Qubits:</div>
              <div>{quantumData.qubits}</div>
            </div>
            <div>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>Fidelity:</div>
              <div>{(quantumData.fidelity * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Coherence:</div>
              <div>{quantumData.coherenceTime.toFixed(0)}μs</div>
            </div>
            <div>
              <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Entanglement:</div>
              <div>{(quantumData.entanglement * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Voice Control Status */}
          <div style={{ 
            marginBottom: '16px',
            padding: '8px',
            background: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '8px',
            border: `1px solid ${isListening ? '#10b981' : '#6b7280'}`
          }}>
            <div style={{ fontWeight: 'bold' }}>
              🎤 Voice Control: {isListening ? 'LISTENING' : 'INACTIVE'}
            </div>
            <button 
              onClick={onToggleVoice}
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: isListening ? '#ef4444' : '#10b981',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {isListening ? 'Stop Listening' : 'Start Voice Control'}
            </button>
          </div>

          {/* Gesture Status */}
          <div style={{ 
            marginBottom: '16px',
            padding: '8px',
            background: gestureState !== 'none' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '8px',
            border: `1px solid ${gestureState !== 'none' ? '#8b5cf6' : '#6b7280'}`
          }}>
            <div style={{ fontWeight: 'bold' }}>
              👋 Gesture: {gestureState.toUpperCase()}
            </div>
          </div>

          {/* Quick Commands */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px' 
          }}>
            <button 
              onClick={() => onQuantumCommand('INCREASE_QUBITS')}
              style={{
                padding: '8px',
                background: '#06b6d4',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              + Qubits
            </button>
            <button 
              onClick={() => onQuantumCommand('DECREASE_QUBITS')}
              style={{
                padding: '8px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              - Qubits
            </button>
            <button 
              onClick={() => onQuantumCommand('TOGGLE_PARTICLES')}
              style={{
                padding: '8px',
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Toggle Particles
            </button>
            <button 
              onClick={() => onQuantumCommand('RESET_QUANTUM')}
              style={{
                padding: '8px',
                background: '#f59e0b',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Reset State
            </button>
          </div>

          {/* Voice Commands Help */}
          <details style={{ marginTop: '16px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#8b5cf6' }}>
              Voice Commands
            </summary>
            <div style={{ fontSize: '11px', marginTop: '8px', color: '#d1d5db' }}>
              • "Increase qubits" / "Decrease qubits"<br/>
              • "Reset quantum state"<br/>
              • "Toggle particle system"<br/>
              • "Zoom in" / "Zoom out"<br/>
              • "Rotate left" / "Rotate right"
            </div>
          </details>
        </div>
      </Html>
    </group>
  );
};

// Main WebXR Quantum Visualization Component
const WebXRQuantumVisualization: React.FC<WebXRQuantumProps> = ({ 
  quantumData: initialQuantumData, 
  onGestureCommand,
  onVoiceCommand 
}) => {
  const { player, isPresenting } = useXR();
  const [quantumData, setQuantumData] = useState(initialQuantumData);
  const [showParticles, setShowParticles] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Voice command integration
  const handleVoiceCommand = useCallback((command: string) => {
    onVoiceCommand?.(command);
    
    switch (command) {
      case 'INCREASE_QUBITS':
        setQuantumData(prev => ({ 
          ...prev, 
          qubits: Math.min(prev.qubits + 5, 100) 
        }));
        break;
      case 'DECREASE_QUBITS':
        setQuantumData(prev => ({ 
          ...prev, 
          qubits: Math.max(prev.qubits - 5, 5) 
        }));
        break;
      case 'RESET_QUANTUM':
        setQuantumData({
          qubits: 50,
          coherenceTime: 500,
          fidelity: 0.95,
          entanglement: 0.5,
          gateErrors: 0.001
        });
        break;
      case 'TOGGLE_PARTICLES':
        setShowParticles(prev => !prev);
        break;
      case 'SHOW_GATES':
        setShowControls(true);
        break;
      case 'HIDE_GATES':
        setShowControls(false);
        break;
    }
  }, [onVoiceCommand]);

  // Gesture command integration
  const handleGestureCommand = useCallback((gesture: string) => {
    onGestureCommand?.(gesture);
    
    switch (gesture) {
      case 'PINCH_GESTURE':
        setQuantumData(prev => ({ 
          ...prev, 
          entanglement: Math.min(prev.entanglement + 0.1, 1.0) 
        }));
        break;
      case 'POINT_GESTURE':
        setShowParticles(prev => !prev);
        break;
      case 'OPEN_HAND_GESTURE':
        setQuantumData(prev => ({ 
          ...prev, 
          fidelity: Math.min(prev.fidelity + 0.05, 1.0) 
        }));
        break;
    }
  }, [onGestureCommand]);

  // Voice command system
  const { isListening, startListening, stopListening } = useVoiceCommands(handleVoiceCommand);
  
  // Gesture recognition system
  const { gestureState, processHandData } = useQuantumGestures(handleGestureCommand);

  // Handle quantum state changes from Bloch sphere interaction
  const handleQuantumStateChange = useCallback((newState: Partial<QuantumState>) => {
    setQuantumData(prev => ({ ...prev, ...newState }));
  }, []);

  // Handle particle interaction
  const handleParticleInteraction = useCallback((type: string) => {
    if (type === 'particle_select') {
      setQuantumData(prev => ({ 
        ...prev, 
        coherenceTime: Math.min(prev.coherenceTime + 50, 1000) 
      }));
    }
  }, []);

  const toggleVoiceControl = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Update quantum data when props change
  useEffect(() => {
    setQuantumData(initialQuantumData);
  }, [initialQuantumData]);

  return (
    <group>
      {/* Interactive Particle System */}
      {showParticles && (
        <InteractiveQuantumParticles 
          count={quantumData.qubits * 4} 
          quantumData={quantumData}
          onInteraction={handleParticleInteraction}
        />
      )}
      
      {/* Interactive Bloch Sphere */}
      <InteractiveBlochSphere 
        quantumData={quantumData}
        onStateChange={handleQuantumStateChange}
      />
      
      {/* WebXR Control Panel */}
      {showControls && (
        <WebXRQuantumControls
          quantumData={quantumData}
          isListening={isListening}
          gestureState={gestureState}
          onToggleVoice={toggleVoiceControl}
          onQuantumCommand={handleVoiceCommand}
        />
      )}

      {/* XR Controllers and Hand Tracking */}
      <Controllers />
      <Hands 
        onHandUpdate={(hand, handData) => processHandData(handData)}
      />

      {/* Ambient lighting for VR/AR */}
      <ambientLight intensity={isPresenting ? 0.2 : 0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={isPresenting ? 0.4 : 0.6} 
        color="#ffffff" 
      />
    </group>
  );
};

export default WebXRQuantumVisualization;
export type { WebXRQuantumProps, QuantumState };