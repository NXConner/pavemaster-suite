import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import { 
  OrbitControls, 
  Text, 
  Html,
  Environment,
  Sky,
  Grid
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Eye, 
  Hand, 
  Headphones, 
  Monitor, 
  Settings, 
  Zap,
  Globe,
  Camera,
  Gamepad2,
  Wifi,
  Battery
} from 'lucide-react';

interface WebXRCapabilities {
  vrSupported: boolean;
  arSupported: boolean;
  handTrackingSupported: boolean;
  spatialAudioSupported: boolean;
}

interface XRSession {
  active: boolean;
  type: 'vr' | 'ar' | 'inline';
  handTracking: boolean;
  spatialAudio: boolean;
  frameRate: number;
  batteryLevel?: number;
}

interface WebXRManagerProps {
  children?: React.ReactNode;
  enableVR?: boolean;
  enableAR?: boolean;
  enableHandTracking?: boolean;
  onSessionStart?: (type: 'vr' | 'ar') => void;
  onSessionEnd?: () => void;
}

// WebXR Capability Detection Hook
const useWebXRCapabilities = (): WebXRCapabilities => {
  const [capabilities, setCapabilities] = useState<WebXRCapabilities>({
    vrSupported: false,
    arSupported: false,
    handTrackingSupported: false,
    spatialAudioSupported: false
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      if (!navigator.xr) {
        return;
      }

      try {
        // Check VR support
        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        
        // Check AR support
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        
        // Check hand tracking (requires WebXR Hand Input API)
        const handTrackingSupported = 'XRHand' in window;
        
        // Check spatial audio support
        const spatialAudioSupported = 'AudioContext' in window && 
          'createPanner' in AudioContext.prototype;

        setCapabilities({
          vrSupported,
          arSupported,
          handTrackingSupported,
          spatialAudioSupported
        });
      } catch (error) {
        console.warn('WebXR capability detection failed:', error);
      }
    };

    detectCapabilities();
  }, []);

  return capabilities;
};

// XR Session Monitor Component
const XRSessionMonitor: React.FC<{ onSessionChange: (session: XRSession) => void }> = ({ 
  onSessionChange 
}) => {
  const { gl } = useThree();
  
  useEffect(() => {
    const xrSession = gl.xr.getSession();
    
    if (xrSession) {
      const updateSessionInfo = () => {
        const sessionInfo: XRSession = {
          active: true,
          type: xrSession.mode as 'vr' | 'ar' | 'inline',
          handTracking: false, // Will be updated based on input sources
          spatialAudio: true,
          frameRate: 90, // Default XR frame rate
          batteryLevel: undefined // Would need additional API access
        };

        // Check for hand tracking input sources
        if (xrSession.inputSources) {
          sessionInfo.handTracking = Array.from(xrSession.inputSources).some(
            source => source.hand !== undefined
          );
        }

        onSessionChange(sessionInfo);
      };

      // Update session info initially and on input source changes
      updateSessionInfo();
      xrSession.addEventListener('inputsourceschange', updateSessionInfo);

      return () => {
        xrSession.removeEventListener('inputsourceschange', updateSessionInfo);
      };
    } else {
      onSessionChange({
        active: false,
        type: 'inline',
        handTracking: false,
        spatialAudio: false,
        frameRate: 60
      });
    }
  }, [gl.xr, onSessionChange]);

  return null;
};

// Immersive Environment Component
const ImmersiveEnvironment: React.FC = () => {
  return (
    <>
      {/* Sky and Environment */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.49}
        azimuth={0.25}
      />
      <Environment preset="night" />
      
      {/* Ambient lighting for VR */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.6} 
        castShadow
      />
      
      {/* 3D Grid for spatial reference */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#4a5568"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#718096"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Floating UI panels in 3D space */}
      <Text
        position={[0, 3, -5]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        OverWatch TOSS - Immersive Command Center
      </Text>
      
      {/* VR/AR Controllers */}
      <Controllers />
      
      {/* Hand Tracking */}
      <Hands />
    </>
  );
};

// WebXR Control Panel Component
const WebXRControlPanel: React.FC<{
  capabilities: WebXRCapabilities;
  session: XRSession;
  onVRStart: () => void;
  onARStart: () => void;
  onSessionEnd: () => void;
}> = ({ capabilities, session, onVRStart, onARStart, onSessionEnd }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="bg-black/80 backdrop-blur-sm border-purple-500/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-400" />
            WebXR Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Session Status:</span>
            <Badge variant={session.active ? "default" : "secondary"}>
              {session.active ? `${session.type.toUpperCase()} Active` : 'Inactive'}
            </Badge>
          </div>

          {/* Frame Rate */}
          {session.active && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Frame Rate:</span>
              <span className="text-sm text-green-400">{session.frameRate} FPS</span>
            </div>
          )}

          {/* Hand Tracking Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center gap-1">
              <Hand className="h-4 w-4" />
              Hand Tracking:
            </span>
            <Badge variant={session.handTracking ? "default" : "secondary"}>
              {session.handTracking ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* VR Controls */}
          {!session.active && (
            <div className="space-y-2">
              {capabilities.vrSupported && (
                <Button
                  onClick={onVRStart}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Enter VR Mode
                </Button>
              )}
              
              {capabilities.arSupported && (
                <Button
                  onClick={onARStart}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Enter AR Mode
                </Button>
              )}
            </div>
          )}

          {/* Exit Session */}
          {session.active && (
            <Button
              onClick={onSessionEnd}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              Exit {session.type.toUpperCase()} Session
            </Button>
          )}

          {/* Capabilities Status */}
          <div className="border-t border-gray-600 pt-3 space-y-2">
            <div className="text-xs text-gray-400">Device Capabilities:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${capabilities.vrSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                VR Ready
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${capabilities.arSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                AR Ready
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${capabilities.handTrackingSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                Hand Track
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${capabilities.spatialAudioSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                3D Audio
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main WebXR Manager Component
const WebXRManager: React.FC<WebXRManagerProps> = ({
  children,
  enableVR = true,
  enableAR = true,
  enableHandTracking = true,
  onSessionStart,
  onSessionEnd
}) => {
  const capabilities = useWebXRCapabilities();
  const [session, setSession] = useState<XRSession>({
    active: false,
    type: 'inline',
    handTracking: false,
    spatialAudio: false,
    frameRate: 60
  });

  const handleSessionStart = useCallback((type: 'vr' | 'ar') => {
    onSessionStart?.(type);
  }, [onSessionStart]);

  const handleSessionEnd = useCallback(() => {
    setSession(prev => ({ ...prev, active: false }));
    onSessionEnd?.();
  }, [onSessionEnd]);

  const handleVRStart = useCallback(() => {
    handleSessionStart('vr');
  }, [handleSessionStart]);

  const handleARStart = useCallback(() => {
    handleSessionStart('ar');
  }, [handleSessionStart]);

  return (
    <div className="relative w-full h-full">
      {/* WebXR Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ 
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' 
        }}
      >
        {/* XR Provider */}
        <XR>
          <XRSessionMonitor onSessionChange={setSession} />
          
          {/* Immersive Environment */}
          <ImmersiveEnvironment />
          
          {/* User Content */}
          {children}
          
          {/* Non-XR Controls */}
          {!session.active && (
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              target={[0, 1.6, 0]}
            />
          )}
        </XR>
      </Canvas>

      {/* WebXR Control Panel */}
      <WebXRControlPanel
        capabilities={capabilities}
        session={session}
        onVRStart={handleVRStart}
        onARStart={handleARStart}
        onSessionEnd={handleSessionEnd}
      />

      {/* WebXR Entry Buttons (React XR provides these) */}
      {!session.active && capabilities.vrSupported && enableVR && (
        <div className="fixed bottom-4 left-4 z-50">
          <VRButton />
        </div>
      )}
      
      {!session.active && capabilities.arSupported && enableAR && (
        <div className="fixed bottom-4 left-20 z-50">
          <ARButton />
        </div>
      )}

      {/* Device Not Supported Message */}
      {!capabilities.vrSupported && !capabilities.arSupported && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-yellow-500/20 border-yellow-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-200">
                <Monitor className="h-5 w-5" />
                <span className="text-sm">
                  WebXR not supported on this device. 3D view available with mouse/touch controls.
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default WebXRManager;
export type { WebXRManagerProps, WebXRCapabilities, XRSession };