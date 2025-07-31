import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Html,
  Box,
  Cylinder,
  Plane,
  Sphere,
  useTexture,
  Grid,
  Environment,
  ContactShadows
} from '@react-three/drei';
import { 
  Vector3, 
  Color,
  MathUtils 
} from 'three';
import * as THREE from 'three';

interface Asset {
  id: string;
  type: 'vehicle' | 'personnel' | 'equipment' | 'sensor';
  position: [number, number, number];
  status: 'active' | 'inactive' | 'maintenance' | 'alert';
  name: string;
  data?: any;
}

interface Facility {
  id: string;
  type: 'building' | 'zone' | 'checkpoint' | 'restricted';
  position: [number, number, number];
  size: [number, number, number];
  name: string;
  color?: string;
}

interface SpatialMapping3DProps {
  assets: Asset[];
  facilities: Facility[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showShadows?: boolean;
}

// Asset visualization component
const Asset3D: React.FC<{ asset: Asset; onClick?: (asset: Asset) => void }> = ({ 
  asset, 
  onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = asset.position[1] + Math.sin(state.clock.elapsedTime + asset.position[0]) * 0.1;
      
      // Rotation based on asset type
      if (asset.type === 'vehicle') {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      }
    }
  });

  const getAssetColor = () => {
    switch (asset.status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      case 'alert': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  const getAssetGeometry = () => {
    switch (asset.type) {
      case 'vehicle':
        return <Box args={[0.6, 0.3, 1.2]} />;
      case 'personnel':
        return <Cylinder args={[0.2, 0.2, 0.8]} />;
      case 'equipment':
        return <Box args={[0.4, 0.4, 0.4]} />;
      case 'sensor':
        return <Sphere args={[0.15]} />;
      default:
        return <Box args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <group
      position={asset.position}
      onClick={() => onClick?.(asset)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef} scale={hovered ? 1.2 : 1}>
        {getAssetGeometry()}
        <meshStandardMaterial 
          color={getAssetColor()}
          emissive={getAssetColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={asset.status === 'inactive' ? 0.5 : 1}
        />
      </mesh>
      
      {/* Status indicator */}
      {asset.status === 'alert' && (
        <Sphere args={[0.05]} position={[0, 0.6, 0]}>
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444" 
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
      
      {/* Asset label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        visible={hovered}
      >
        {asset.name}
      </Text>
      
      {/* Asset details HUD */}
      {hovered && (
        <Html
          position={[0, 1.2, 0]}
          center
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '8px',
            borderRadius: '4px',
            border: `1px solid ${getAssetColor()}`,
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '10px',
            minWidth: '120px',
            pointerEvents: 'none'
          }}
        >
          <div>
            <div style={{ color: getAssetColor(), fontWeight: 'bold' }}>
              {asset.type.toUpperCase()}
            </div>
            <div>ID: {asset.id}</div>
            <div>Status: {asset.status}</div>
            <div>Position: ({asset.position.map(p => p.toFixed(1)).join(', ')})</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Facility visualization component
const Facility3D: React.FC<{ facility: Facility }> = ({ facility }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const getFacilityColor = () => {
    switch (facility.type) {
      case 'building': return '#4f46e5';
      case 'zone': return '#059669';
      case 'checkpoint': return '#dc2626';
      case 'restricted': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getFacilityOpacity = () => {
    switch (facility.type) {
      case 'building': return 0.7;
      case 'zone': return 0.2;
      case 'checkpoint': return 0.4;
      case 'restricted': return 0.3;
      default: return 0.5;
    }
  };

  return (
    <group position={facility.position}>
      <Box args={facility.size} ref={meshRef}>
        <meshStandardMaterial 
          color={facility.color || getFacilityColor()}
          transparent
          opacity={getFacilityOpacity()}
          wireframe={facility.type === 'zone'}
        />
      </Box>
      
      {/* Facility label */}
      <Text
        position={[0, facility.size[1] / 2 + 0.3, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {facility.name}
      </Text>
      
      {/* Facility type indicator */}
      <Text
        position={[0, facility.size[1] / 2 + 0.6, 0]}
        fontSize={0.12}
        color={getFacilityColor()}
        anchorX="center"
        anchorY="middle"
      >
        {facility.type.toUpperCase()}
      </Text>
    </group>
  );
};

// Ground plane with grid
const GroundPlane: React.FC<{ showGrid: boolean; size?: number }> = ({ 
  showGrid, 
  size = 20 
}) => {
  return (
    <group>
      {/* Ground plane */}
      <Plane 
        args={[size, size]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
      >
        <meshStandardMaterial 
          color="#1f2937" 
          transparent 
          opacity={0.8}
        />
      </Plane>
      
      {/* Grid overlay */}
      {showGrid && (
        <Grid
          args={[size, size]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#374151"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}
    </group>
  );
};

// Minimap component
const Minimap: React.FC<{ assets: Asset[]; facilities: Facility[] }> = ({ 
  assets, 
  facilities 
}) => {
  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '150px',
        height: '150px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #4b5563',
        borderRadius: '8px',
        padding: '8px'
      }}
    >
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        background: 'radial-gradient(circle, #1f2937 0%, #111827 100%)'
      }}>
        {/* Minimap title */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          color: '#ffffff',
          fontSize: '10px',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}>
          TACTICAL MAP
        </div>
        
        {/* Asset dots on minimap */}
        {assets.map((asset) => (
          <div
            key={asset.id}
            style={{
              position: 'absolute',
              left: `${((asset.position[0] + 10) / 20) * 100}%`,
              top: `${((10 - asset.position[2]) / 20) * 100}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: asset.status === 'active' ? '#10b981' : 
                             asset.status === 'alert' ? '#ef4444' : '#6b7280',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Facility outlines on minimap */}
        {facilities.map((facility) => (
          <div
            key={facility.id}
            style={{
              position: 'absolute',
              left: `${((facility.position[0] + 10 - facility.size[0] / 2) / 20) * 100}%`,
              top: `${((10 - facility.position[2] - facility.size[2] / 2) / 20) * 100}%`,
              width: `${(facility.size[0] / 20) * 100}%`,
              height: `${(facility.size[2] / 20) * 100}%`,
              border: '1px solid #4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              transform: 'translate(0, 0)'
            }}
          />
        ))}
      </div>
    </Html>
  );
};

// Asset status panel
const StatusPanel: React.FC<{ assets: Asset[] }> = ({ assets }) => {
  const statusCounts = useMemo(() => {
    return assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [assets]);

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #4b5563',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '180px'
      }}
    >
      <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#8b5cf6' }}>
          ASSET STATUS
        </div>
        
        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#10b981' }}>● Active:</span>
            <span>{statusCounts.active || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ef4444' }}>● Alert:</span>
            <span>{statusCounts.alert || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#f59e0b' }}>● Maintenance:</span>
            <span>{statusCounts.maintenance || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>● Inactive:</span>
            <span>{statusCounts.inactive || 0}</span>
          </div>
        </div>
        
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #4b5563' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total Assets:</span>
            <span>{assets.length}</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

// Main 3D Scene
const SpatialScene: React.FC<{
  assets: Asset[];
  facilities: Facility[];
  showGrid: boolean;
  showShadows: boolean;
  onAssetClick?: (asset: Asset) => void;
}> = ({ assets, facilities, showGrid, showShadows, onAssetClick }) => {
  return (
    <>
      {/* Environment and lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow={showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#8b5cf6" />
      
      {/* Ground plane with grid */}
      <GroundPlane showGrid={showGrid} />
      
      {/* Contact shadows */}
      {showShadows && (
        <ContactShadows
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
          resolution={256}
          color="#000000"
        />
      )}
      
      {/* Facilities */}
      {facilities.map((facility) => (
        <Facility3D key={facility.id} facility={facility} />
      ))}
      
      {/* Assets */}
      {assets.map((asset) => (
        <Asset3D 
          key={asset.id} 
          asset={asset} 
          onClick={onAssetClick}
        />
      ))}
      
      {/* HUD elements */}
      <StatusPanel assets={assets} />
      <Minimap assets={assets} facilities={facilities} />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
      />
    </>
  );
};

// Main Component
const SpatialMapping3D: React.FC<SpatialMapping3DProps> = ({ 
  assets, 
  facilities,
  width = 400, 
  height = 300,
  showGrid = true,
  showShadows = true
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        camera={{ position: [12, 8, 12], fov: 60 }}
        shadows={showShadows}
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' 
        }}
      >
        <SpatialScene 
          assets={assets}
          facilities={facilities}
          showGrid={showGrid}
          showShadows={showShadows}
          onAssetClick={handleAssetClick}
        />
      </Canvas>
      
      {/* Controls indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
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
        3D SPATIAL MAP
      </div>
      
      {/* Controls help */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '9px',
          fontFamily: 'monospace'
        }}
      >
        Click & Drag: Rotate | Scroll: Zoom | Right Click: Pan
      </div>
      
      {/* Asset detail modal */}
      {selectedAsset && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid #8b5cf6',
            borderRadius: '8px',
            padding: '16px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '12px',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#8b5cf6' }}>Asset Details</h3>
            <button
              onClick={() => setSelectedAsset(null)}
              style={{
                background: 'none',
                border: '1px solid #6b7280',
                color: 'white',
                borderRadius: '2px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '6px' }}>
            <div><strong>Name:</strong> {selectedAsset.name}</div>
            <div><strong>Type:</strong> {selectedAsset.type}</div>
            <div><strong>Status:</strong> <span style={{ color: 
              selectedAsset.status === 'active' ? '#10b981' :
              selectedAsset.status === 'alert' ? '#ef4444' :
              selectedAsset.status === 'maintenance' ? '#f59e0b' : '#6b7280'
            }}>{selectedAsset.status}</span></div>
            <div><strong>Position:</strong> ({selectedAsset.position.map(p => p.toFixed(2)).join(', ')})</div>
            <div><strong>ID:</strong> {selectedAsset.id}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialMapping3D;