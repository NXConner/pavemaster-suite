import { Device } from '@capacitor/device';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { mobileService } from './mobileService';

// Types and Interfaces
export interface ScanPoint {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  normal: {
    x: number;
    y: number;
    z: number;
  };
  confidence: number;
  timestamp: number;
}

export interface PhotoMetadata {
  id: string;
  path: string;
  position: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  orientation: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  timestamp: number;
  quality: number;
  resolution: {
    width: number;
    height: number;
  };
}

export interface ScanSession {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  photos: PhotoMetadata[];
  scanPoints: ScanPoint[];
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  quality: 'low' | 'medium' | 'high' | 'ultra';
  status: 'active' | 'processing' | 'completed' | 'failed';
  estimatedArea: number; // square meters
  estimatedVolume?: number; // cubic meters for defects
}

export interface DefectDetection {
  id: string;
  type: 'transverse_crack' | 'longitudinal_crack' | 'block_crack' | 'alligator_crack' | 'pothole' | 'edge_crack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dimensions: {
    length?: number;
    width?: number;
    depth?: number;
    area?: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  photoId: string;
  scanSessionId: string;
}

export interface ScanGuidance {
  type: 'distance' | 'movement' | 'lighting' | 'coverage' | 'stability';
  level: 'info' | 'warning' | 'error';
  message: string;
  icon: string;
  vibration?: 'light' | 'medium' | 'heavy';
}

interface ARCapabilities {
  hasARCore: boolean;
  hasARKit: boolean;
  hasDepthAPI: boolean;
  hasPlaneDetection: boolean;
  hasEnvironmentalUnderstanding: boolean;
  hasLiDAR: boolean;
  supportsPhotogrammetry: boolean;
}

class AR3DScanningService {
  private scanSessions: Map<string, ScanSession> = new Map();
  private activeScanSession: ScanSession | null = null;
  private arCapabilities: ARCapabilities | null = null;
  private isScanning = false;
  private scanningParams = {
    minPhotos: 20,
    maxPhotos: 100,
    optimalDistance: 1.5, // meters from surface
    minOverlap: 0.7, // 70% overlap between photos
    maxDeviation: 0.3, // maximum allowed distance deviation
  };

  constructor() {
    this.initializeARCapabilities();
  }

  private async initializeARCapabilities(): Promise<void> {
    try {
      const deviceInfo = await Device.getInfo();
      const platform = deviceInfo.platform;

      // Check AR capabilities based on platform and device
      this.arCapabilities = {
        hasARCore: platform === 'android' && await this.checkARCoreSupport(),
        hasARKit: platform === 'ios' && await this.checkARKitSupport(),
        hasDepthAPI: await this.checkDepthAPISupport(),
        hasPlaneDetection: true, // Most modern devices support basic plane detection
        hasEnvironmentalUnderstanding: platform === 'android',
        hasLiDAR: platform === 'ios' && await this.checkLiDARSupport(),
        supportsPhotogrammetry: true, // Fallback to photogrammetry for all devices
      };

      console.log('AR Capabilities initialized:', this.arCapabilities);
    } catch (error) {
      console.error('Failed to initialize AR capabilities:', error);
      // Fallback to basic photogrammetry
      this.arCapabilities = {
        hasARCore: false,
        hasARKit: false,
        hasDepthAPI: false,
        hasPlaneDetection: false,
        hasEnvironmentalUnderstanding: false,
        hasLiDAR: false,
        supportsPhotogrammetry: true,
      };
    }
  }

  private async checkARCoreSupport(): Promise<boolean> {
    try {
      // In a real implementation, this would check for ARCore availability
      // For now, we'll assume modern Android devices support ARCore
      const deviceInfo = await Device.getInfo();
      const androidVersion = parseInt(deviceInfo.osVersion.split('.')[0]);
      return androidVersion >= 7; // ARCore requires Android 7.0+
    } catch {
      return false;
    }
  }

  private async checkARKitSupport(): Promise<boolean> {
    try {
      // In a real implementation, this would check for ARKit availability
      const deviceInfo = await Device.getInfo();
      const iosVersion = parseFloat(deviceInfo.osVersion);
      return iosVersion >= 11.0; // ARKit requires iOS 11.0+
    } catch {
      return false;
    }
  }

  private async checkDepthAPISupport(): Promise<boolean> {
    try {
      // Check if device has depth sensors or computational depth capability
      const deviceInfo = await Device.getInfo();
      return deviceInfo.model.includes('Pro') || deviceInfo.model.includes('iPad'); // Heuristic for devices with better depth capabilities
    } catch {
      return false;
    }
  }

  private async checkLiDARSupport(): Promise<boolean> {
    try {
      // LiDAR is available on iPhone 12 Pro, iPad Pro (4th gen), and newer
      const deviceInfo = await Device.getInfo();
      const model = deviceInfo.model.toLowerCase();
      return model.includes('pro') && (
        model.includes('iphone') && model.includes('12') ||
        model.includes('13') || model.includes('14') || model.includes('15') ||
        model.includes('ipad')
      );
    } catch {
      return false;
    }
  }

  // Public API Methods

  public async startScanSession(name: string, quality: ScanSession['quality'] = 'medium'): Promise<string> {
    if (this.isScanning) {
      throw new Error('A scan session is already active');
    }

    const sessionId = this.generateId();
    const session: ScanSession = {
      id: sessionId,
      name,
      startTime: Date.now(),
      photos: [],
      scanPoints: [],
      boundingBox: {
        min: { x: Infinity, y: Infinity, z: Infinity },
        max: { x: -Infinity, y: -Infinity, z: -Infinity },
      },
      quality,
      status: 'active',
      estimatedArea: 0,
    };

    this.scanSessions.set(sessionId, session);
    this.activeScanSession = session;
    this.isScanning = true;

    await Toast.show({
      text: `Started 3D scan: ${name}`,
      duration: 'short',
    });

    await Haptics.impact({ style: ImpactStyle.Light });

    // Start motion tracking for guidance
    await this.startMotionTracking();

    return sessionId;
  }

  public async stopScanSession(): Promise<ScanSession | null> {
    if (!this.activeScanSession) {
      return null;
    }

    this.activeScanSession.endTime = Date.now();
    this.activeScanSession.status = 'processing';
    this.isScanning = false;

    await this.stopMotionTracking();

    // Calculate final metrics
    await this.calculateScanMetrics(this.activeScanSession);

    // Start 3D reconstruction process
    await this.process3DReconstruction(this.activeScanSession);

    const completedSession = this.activeScanSession;
    this.activeScanSession = null;

    await Toast.show({
      text: `Scan completed: ${completedSession.photos.length} photos captured`,
      duration: 'long',
    });

    await Haptics.impact({ style: ImpactStyle.Medium });

    return completedSession;
  }

  public async capturePhotoForScan(): Promise<PhotoMetadata | null> {
    if (!this.activeScanSession) {
      throw new Error('No active scan session');
    }

    try {
      // Get current location and orientation
      const location = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
      });

      const orientation = await this.getCurrentOrientation();

      // Capture high-quality photo
      const photo = await Camera.getPhoto({
        quality: this.getScanQuality(this.activeScanSession.quality),
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
        width: 4000, // High resolution for photogrammetry
        height: 3000,
      });

      if (!photo.path) {
        throw new Error('Failed to capture photo');
      }

      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: this.generateId(),
        path: photo.path,
        position: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || undefined,
        },
        orientation,
        timestamp: Date.now(),
        quality: this.getScanQuality(this.activeScanSession.quality),
        resolution: {
          width: 4000,
          height: 3000,
        },
      };

      // Add to active session
      this.activeScanSession.photos.push(photoMetadata);

      // Provide real-time guidance
      const guidance = this.generateScanGuidance(this.activeScanSession);
      await this.provideScanGuidance(guidance);

      // Haptic feedback for successful capture
      await Haptics.impact({ style: ImpactStyle.Light });

      console.log(`Photo captured for scan: ${photoMetadata.id}`);
      return photoMetadata;

    } catch (error) {
      console.error('Failed to capture photo for scan:', error);
      await Toast.show({
        text: 'Failed to capture photo',
        duration: 'short',
      });
      return null;
    }
  }

  private getScanQuality(quality: ScanSession['quality']): number {
    switch (quality) {
      case 'low': return 70;
      case 'medium': return 85;
      case 'high': return 95;
      case 'ultra': return 100;
      default: return 85;
    }
  }

  private async getCurrentOrientation(): Promise<{ pitch: number; yaw: number; roll: number }> {
    try {
      // In a real implementation, this would use device orientation sensors
      // For now, we'll simulate or use motion data
      return {
        pitch: 0,
        yaw: 0,
        roll: 0,
      };
    } catch {
      return { pitch: 0, yaw: 0, roll: 0 };
    }
  }

  private generateScanGuidance(session: ScanSession): ScanGuidance[] {
    const guidance: ScanGuidance[] = [];
    const photoCount = session.photos.length;

    // Photo count guidance
    if (photoCount < this.scanningParams.minPhotos) {
      guidance.push({
        type: 'coverage',
        level: 'info',
        message: `Capture ${this.scanningParams.minPhotos - photoCount} more photos for minimum coverage`,
        icon: 'camera',
      });
    } else if (photoCount > this.scanningParams.maxPhotos) {
      guidance.push({
        type: 'coverage',
        level: 'warning',
        message: 'Consider stopping - you have captured enough photos',
        icon: 'check-circle',
      });
    }

    // Movement guidance
    if (photoCount > 3) {
      guidance.push({
        type: 'movement',
        level: 'info',
        message: 'Move in gentle arcs, maintain consistent distance',
        icon: 'move',
      });
    }

    // Distance guidance (simulated)
    guidance.push({
      type: 'distance',
      level: 'info',
      message: `Maintain ${this.scanningParams.optimalDistance}m distance from surface`,
      icon: 'target',
    });

    // Lighting guidance
    guidance.push({
      type: 'lighting',
      level: 'info',
      message: 'Ensure even lighting, avoid shadows',
      icon: 'sun',
    });

    return guidance;
  }

  private async provideScanGuidance(guidance: ScanGuidance[]): Promise<void> {
    for (const guide of guidance) {
      if (guide.level === 'warning' || guide.level === 'error') {
        await Toast.show({
          text: guide.message,
          duration: 'short',
        });

        if (guide.vibration) {
          const style = guide.vibration === 'light' ? ImpactStyle.Light :
                       guide.vibration === 'medium' ? ImpactStyle.Medium :
                       ImpactStyle.Heavy;
          await Haptics.impact({ style });
        }
      }
    }
  }

  private async startMotionTracking(): Promise<void> {
    try {
      if (mobileService.hasCapability('motion')) {
        await Motion.addListener('accel', (event) => {
          // Monitor device stability during scanning
          this.processMotionData(event);
        });
      }
    } catch (error) {
      console.error('Failed to start motion tracking:', error);
    }
  }

  private async stopMotionTracking(): Promise<void> {
    try {
      await Motion.removeAllListeners();
    } catch (error) {
      console.error('Failed to stop motion tracking:', error);
    }
  }

  private processMotionData(event: any): void {
    // Analyze motion for stability guidance
    const acceleration = Math.sqrt(
      event.acceleration.x ** 2 +
      event.acceleration.y ** 2 +
      event.acceleration.z ** 2
    );

    // If device is too shaky, provide guidance
    if (acceleration > 2.0) { // Threshold for excessive movement
      this.provideScanGuidance([{
        type: 'stability',
        level: 'warning',
        message: 'Hold device steady for better scan quality',
        icon: 'alert-triangle',
        vibration: 'light',
      }]);
    }
  }

  private async calculateScanMetrics(session: ScanSession): Promise<void> {
    // Calculate estimated surface area from GPS coordinates
    if (session.photos.length >= 2) {
      const positions = session.photos.map(p => p.position);
      session.estimatedArea = this.calculatePolygonArea(positions);
    }

    // Update bounding box
    session.photos.forEach(photo => {
      // Convert GPS to local coordinates (simplified)
      const localPos = this.gpsToLocal(photo.position);
      
      session.boundingBox.min.x = Math.min(session.boundingBox.min.x, localPos.x);
      session.boundingBox.min.y = Math.min(session.boundingBox.min.y, localPos.y);
      session.boundingBox.min.z = Math.min(session.boundingBox.min.z, localPos.z);
      
      session.boundingBox.max.x = Math.max(session.boundingBox.max.x, localPos.x);
      session.boundingBox.max.y = Math.max(session.boundingBox.max.y, localPos.y);
      session.boundingBox.max.z = Math.max(session.boundingBox.max.z, localPos.z);
    });
  }

  private calculatePolygonArea(positions: Array<{ latitude: number; longitude: number }>): number {
    if (positions.length < 3) return 0;

    // Simplified area calculation using shoelace formula
    let area = 0;
    for (let i = 0; i < positions.length; i++) {
      const j = (i + 1) % positions.length;
      area += positions[i].latitude * positions[j].longitude;
      area -= positions[j].latitude * positions[i].longitude;
    }
    return Math.abs(area) / 2 * 111000 * 111000; // Rough conversion to square meters
  }

  private gpsToLocal(position: { latitude: number; longitude: number; altitude?: number }): { x: number; y: number; z: number } {
    // Simplified GPS to local coordinate conversion
    return {
      x: position.longitude * 111000, // Rough meters per degree
      y: position.latitude * 111000,
      z: position.altitude || 0,
    };
  }

  private async process3DReconstruction(session: ScanSession): Promise<void> {
    try {
      session.status = 'processing';

      // In a real implementation, this would:
      // 1. Run photogrammetry algorithms
      // 2. Generate point cloud
      // 3. Create mesh
      // 4. Optimize for mobile display

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock scan points for demonstration
      session.scanPoints = this.generateMockScanPoints(session);

      session.status = 'completed';
      
      console.log(`3D reconstruction completed for session: ${session.id}`);
    } catch (error) {
      console.error('3D reconstruction failed:', error);
      session.status = 'failed';
    }
  }

  private generateMockScanPoints(session: ScanSession): ScanPoint[] {
    const points: ScanPoint[] = [];
    const numPoints = Math.min(session.photos.length * 100, 10000); // Up to 10k points

    for (let i = 0; i < numPoints; i++) {
      points.push({
        id: this.generateId(),
        position: {
          x: (Math.random() - 0.5) * 10, // 10m spread
          y: (Math.random() - 0.5) * 10,
          z: Math.random() * 0.5, // Up to 50cm height variation
        },
        normal: {
          x: 0,
          y: 0,
          z: 1, // Pointing up (pavement surface)
        },
        confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
        timestamp: Date.now(),
      });
    }

    return points;
  }

  // Public getters and utility methods

  public getActiveScanSession(): ScanSession | null {
    return this.activeScanSession;
  }

  public getAllScanSessions(): ScanSession[] {
    return Array.from(this.scanSessions.values());
  }

  public getScanSession(id: string): ScanSession | null {
    return this.scanSessions.get(id) || null;
  }

  public getARCapabilities(): ARCapabilities | null {
    return this.arCapabilities;
  }

  public isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  public async exportScanSession(sessionId: string, format: 'obj' | 'ply' | 'stl' = 'obj'): Promise<string> {
    const session = this.scanSessions.get(sessionId);
    if (!session) {
      throw new Error('Scan session not found');
    }

    if (session.status !== 'completed') {
      throw new Error('Scan session not completed');
    }

    // Generate 3D model file content
    const modelContent = this.generate3DModelFile(session, format);
    
    // Save to device
    const fileName = `scan_${session.name}_${sessionId}.${format}`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data: modelContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    return result.uri;
  }

  private generate3DModelFile(session: ScanSession, format: string): string {
    switch (format) {
      case 'obj':
        return this.generateOBJFile(session);
      case 'ply':
        return this.generatePLYFile(session);
      case 'stl':
        return this.generateSTLFile(session);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateOBJFile(session: ScanSession): string {
    let obj = `# 3D Scan Export - ${session.name}\n`;
    obj += `# Generated by PaveMaster Suite\n`;
    obj += `# Points: ${session.scanPoints.length}\n\n`;

    // Add vertices
    session.scanPoints.forEach(point => {
      obj += `v ${point.position.x.toFixed(6)} ${point.position.y.toFixed(6)} ${point.position.z.toFixed(6)}\n`;
    });

    // Add normals
    obj += '\n';
    session.scanPoints.forEach(point => {
      obj += `vn ${point.normal.x.toFixed(6)} ${point.normal.y.toFixed(6)} ${point.normal.z.toFixed(6)}\n`;
    });

    return obj;
  }

  private generatePLYFile(session: ScanSession): string {
    let ply = 'ply\n';
    ply += 'format ascii 1.0\n';
    ply += `element vertex ${session.scanPoints.length}\n`;
    ply += 'property float x\n';
    ply += 'property float y\n';
    ply += 'property float z\n';
    ply += 'property float nx\n';
    ply += 'property float ny\n';
    ply += 'property float nz\n';
    ply += 'property float confidence\n';
    ply += 'end_header\n';

    session.scanPoints.forEach(point => {
      ply += `${point.position.x} ${point.position.y} ${point.position.z} `;
      ply += `${point.normal.x} ${point.normal.y} ${point.normal.z} `;
      ply += `${point.confidence}\n`;
    });

    return ply;
  }

  private generateSTLFile(session: ScanSession): string {
    // STL requires triangular faces, so this is a simplified version
    let stl = `solid ${session.name.replace(/\s+/g, '_')}\n`;
    
    // For demonstration, create triangles from consecutive points
    for (let i = 0; i < session.scanPoints.length - 2; i += 3) {
      const p1 = session.scanPoints[i];
      const p2 = session.scanPoints[i + 1];
      const p3 = session.scanPoints[i + 2];

      stl += `  facet normal ${p1.normal.x} ${p1.normal.y} ${p1.normal.z}\n`;
      stl += `    outer loop\n`;
      stl += `      vertex ${p1.position.x} ${p1.position.y} ${p1.position.z}\n`;
      stl += `      vertex ${p2.position.x} ${p2.position.y} ${p2.position.z}\n`;
      stl += `      vertex ${p3.position.x} ${p3.position.y} ${p3.position.z}\n`;
      stl += `    endloop\n`;
      stl += `  endfacet\n`;
    }

    stl += `endsolid ${session.name.replace(/\s+/g, '_')}\n`;
    return stl;
  }

  public async deleteScanSession(sessionId: string): Promise<void> {
    const session = this.scanSessions.get(sessionId);
    if (session) {
      // Clean up photos and data
      for (const photo of session.photos) {
        try {
          await Filesystem.deleteFile({
            path: photo.path,
          });
        } catch (error) {
          console.warn('Failed to delete photo file:', photo.path);
        }
      }

      this.scanSessions.delete(sessionId);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Export singleton instance
export const ar3dScanningService = new AR3DScanningService();
export default ar3dScanningService;