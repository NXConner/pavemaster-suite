import { Device } from '@capacitor/device';
import { CapacitorHttp } from '@capacitor/core';

export interface OptimizationOptions {
  targetPolygonCount: number;
  textureAtlasSize: number;
  lodLevels: number;
  memoryBudget: number; // MB
  batteryOptimization: boolean;
  targetFrameRate: number;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  batteryDrain: number;
  renderTime: number;
  triangleCount: number;
  drawCalls: number;
}

export interface LODLevel {
  distance: number;
  polygonReduction: number;
  textureResolution: number;
  shaderComplexity: 'low' | 'medium' | 'high';
}

export interface OptimizedMesh {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
  uvs: Float32Array;
  triangleCount: number;
  boundingBox: BoundingBox;
  lodLevels: LODLevel[];
}

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
  center: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
}

export interface TextureAtlas {
  canvas: HTMLCanvasElement;
  uvMappings: Map<string, UVMapping>;
  size: number;
  utilization: number;
}

export interface UVMapping {
  x: number;
  y: number;
  width: number;
  height: number;
  originalSize: { width: number; height: number };
}

export interface DeviceCapabilities {
  gpu: string;
  maxTextureSize: number;
  supportedExtensions: string[];
  memoryLimit: number;
  isMobile: boolean;
  supportsWebGL2: boolean;
  supportsInstancedRendering: boolean;
}

class Advanced3DOptimizationService {
  private performanceMetrics: PerformanceMetrics;
  private deviceCapabilities: DeviceCapabilities | null = null;
  private optimizationOptions: OptimizationOptions;
  private isInitialized = false;
  private renderStats = {
    frameCount: 0,
    lastFrameTime: 0,
    avgFrameTime: 0,
    memoryPeak: 0
  };

  constructor() {
    this.performanceMetrics = this.initializeMetrics();
    this.optimizationOptions = this.getDefaultOptions();
  }

  async initialize(): Promise<void> {
    this.deviceCapabilities = await this.detectDeviceCapabilities();
    this.optimizeForDevice();
    this.setupPerformanceMonitoring();
    this.isInitialized = true;
  }

  private async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const deviceInfo = await Device.getInfo();
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      throw new Error('WebGL not supported');
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    
    return {
      gpu: gpu,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      supportedExtensions: gl.getSupportedExtensions() || [],
      memoryLimit: this.estimateGPUMemory(deviceInfo.platform),
      isMobile: deviceInfo.platform === 'ios' || deviceInfo.platform === 'android',
      supportsWebGL2: !!canvas.getContext('webgl2'),
      supportsInstancedRendering: !!gl.getExtension('ANGLE_instanced_arrays')
    };
  }

  private estimateGPUMemory(platform: string): number {
    // Estimate GPU memory based on platform (in MB)
    switch (platform) {
      case 'ios':
        return 3072; // Modern iOS devices typically have 3GB+ GPU memory
      case 'android':
        return 2048; // Android varies, conservative estimate
      default:
        return 4096; // Desktop/web
    }
  }

  private optimizeForDevice(): void {
    if (!this.deviceCapabilities) return;

    // Adjust optimization options based on device capabilities
    if (this.deviceCapabilities.isMobile) {
      this.optimizationOptions.targetPolygonCount = Math.min(50000, this.optimizationOptions.targetPolygonCount);
      this.optimizationOptions.textureAtlasSize = Math.min(2048, this.optimizationOptions.textureAtlasSize);
      this.optimizationOptions.memoryBudget = Math.min(512, this.optimizationOptions.memoryBudget);
      this.optimizationOptions.batteryOptimization = true;
      this.optimizationOptions.targetFrameRate = 30;
    }

    // Adjust for lower-end devices
    if (this.deviceCapabilities.memoryLimit < 2048) {
      this.optimizationOptions.lodLevels = Math.max(3, this.optimizationOptions.lodLevels);
      this.optimizationOptions.targetPolygonCount *= 0.5;
    }
  }

  async optimizeMesh(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array
  ): Promise<OptimizedMesh> {
    // 1. Calculate bounding box
    const boundingBox = this.calculateBoundingBox(vertices);

    // 2. Apply polygon reduction
    const { reducedVertices, reducedIndices, reducedNormals, reducedUVs } = 
      await this.reducePolygons(vertices, indices, normals, uvs);

    // 3. Generate LOD levels
    const lodLevels = await this.generateLODLevels(
      reducedVertices, reducedIndices, reducedNormals, reducedUVs
    );

    // 4. Optimize vertex layout for GPU
    const optimizedGeometry = this.optimizeVertexLayout(
      reducedVertices, reducedIndices, reducedNormals, reducedUVs
    );

    return {
      vertices: optimizedGeometry.vertices,
      indices: optimizedGeometry.indices,
      normals: optimizedGeometry.normals,
      uvs: optimizedGeometry.uvs,
      triangleCount: reducedIndices.length / 3,
      boundingBox,
      lodLevels
    };
  }

  private async reducePolygons(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array
  ): Promise<{
    reducedVertices: Float32Array;
    reducedIndices: Uint16Array;
    reducedNormals: Float32Array;
    reducedUVs: Float32Array;
  }> {
    const targetCount = this.optimizationOptions.targetPolygonCount;
    const currentCount = indices.length / 3;
    
    if (currentCount <= targetCount) {
      return {
        reducedVertices: vertices,
        reducedIndices: indices,
        reducedNormals: normals,
        reducedUVs: uvs
      };
    }

    // Implement edge collapse decimation algorithm
    const reductionRatio = targetCount / currentCount;
    return this.edgeCollapseDecimation(vertices, indices, normals, uvs, reductionRatio);
  }

  private edgeCollapseDecimation(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array,
    targetRatio: number
  ): {
    reducedVertices: Float32Array;
    reducedIndices: Uint16Array;
    reducedNormals: Float32Array;
    reducedUVs: Float32Array;
  } {
    // Simplified decimation algorithm
    // In production, this would use libraries like meshoptimizer or custom implementation
    
    const targetVertexCount = Math.floor(vertices.length / 3 * targetRatio);
    const stride = Math.ceil((vertices.length / 3) / targetVertexCount);
    
    const reducedVertices: number[] = [];
    const reducedNormals: number[] = [];
    const reducedUVs: number[] = [];
    const vertexMap = new Map<number, number>();
    
    for (let i = 0; i < vertices.length / 3; i += stride) {
      const vertexIndex = i * 3;
      reducedVertices.push(vertices[vertexIndex], vertices[vertexIndex + 1], vertices[vertexIndex + 2]);
      reducedNormals.push(normals[vertexIndex], normals[vertexIndex + 1], normals[vertexIndex + 2]);
      
      const uvIndex = i * 2;
      reducedUVs.push(uvs[uvIndex], uvs[uvIndex + 1]);
      
      vertexMap.set(i, reducedVertices.length / 3 - 1);
    }
    
    // Rebuild indices
    const reducedIndices: number[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const v1 = Math.floor(indices[i] / stride) * stride;
      const v2 = Math.floor(indices[i + 1] / stride) * stride;
      const v3 = Math.floor(indices[i + 2] / stride) * stride;
      
      const mappedV1 = vertexMap.get(v1);
      const mappedV2 = vertexMap.get(v2);
      const mappedV3 = vertexMap.get(v3);
      
      if (mappedV1 !== undefined && mappedV2 !== undefined && mappedV3 !== undefined &&
          mappedV1 !== mappedV2 && mappedV2 !== mappedV3 && mappedV3 !== mappedV1) {
        reducedIndices.push(mappedV1, mappedV2, mappedV3);
      }
    }
    
    return {
      reducedVertices: new Float32Array(reducedVertices),
      reducedIndices: new Uint16Array(reducedIndices),
      reducedNormals: new Float32Array(reducedNormals),
      reducedUVs: new Float32Array(reducedUVs)
    };
  }

  private async generateLODLevels(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array
  ): Promise<LODLevel[]> {
    const lodLevels: LODLevel[] = [];
    const numLevels = this.optimizationOptions.lodLevels;
    
    for (let i = 0; i < numLevels; i++) {
      const distance = Math.pow(2, i) * 10; // Exponential distance scaling
      const reductionFactor = Math.pow(0.5, i); // 50% reduction per level
      const textureRes = Math.max(256, 2048 >> i); // Texture resolution scaling
      
      lodLevels.push({
        distance,
        polygonReduction: 1 - reductionFactor,
        textureResolution: textureRes,
        shaderComplexity: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
      });
    }
    
    return lodLevels;
  }

  async createTextureAtlas(textures: HTMLImageElement[]): Promise<TextureAtlas> {
    const atlasSize = this.optimizationOptions.textureAtlasSize;
    const canvas = document.createElement('canvas');
    canvas.width = atlasSize;
    canvas.height = atlasSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    
    const uvMappings = new Map<string, UVMapping>();
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    
    for (let i = 0; i < textures.length; i++) {
      const texture = textures[i];
      const scaleFactor = Math.min(1, Math.min(
        (atlasSize - currentX) / texture.width,
        (atlasSize - currentY) / texture.height
      ));
      
      const scaledWidth = texture.width * scaleFactor;
      const scaledHeight = texture.height * scaleFactor;
      
      // Check if texture fits in current row
      if (currentX + scaledWidth > atlasSize) {
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }
      
      // Check if texture fits in atlas
      if (currentY + scaledHeight > atlasSize) {
        console.warn(`Texture ${i} doesn't fit in atlas, skipping`);
        continue;
      }
      
      // Draw texture to atlas
      ctx.drawImage(texture, currentX, currentY, scaledWidth, scaledHeight);
      
      // Store UV mapping
      uvMappings.set(`texture_${i}`, {
        x: currentX / atlasSize,
        y: currentY / atlasSize,
        width: scaledWidth / atlasSize,
        height: scaledHeight / atlasSize,
        originalSize: { width: texture.width, height: texture.height }
      });
      
      currentX += scaledWidth;
      rowHeight = Math.max(rowHeight, scaledHeight);
    }
    
    const utilization = this.calculateAtlasUtilization(uvMappings, atlasSize);
    
    return {
      canvas,
      uvMappings,
      size: atlasSize,
      utilization
    };
  }

  private calculateAtlasUtilization(mappings: Map<string, UVMapping>, atlasSize: number): number {
    let usedArea = 0;
    mappings.forEach(mapping => {
      usedArea += (mapping.width * atlasSize) * (mapping.height * atlasSize);
    });
    return usedArea / (atlasSize * atlasSize);
  }

  selectLODLevel(distance: number, lodLevels: LODLevel[]): LODLevel {
    for (let i = lodLevels.length - 1; i >= 0; i--) {
      if (distance >= lodLevels[i].distance) {
        return lodLevels[i];
      }
    }
    return lodLevels[0];
  }

  private calculateBoundingBox(vertices: Float32Array): BoundingBox {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
    
    const center = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2
    };
    
    const size = {
      x: maxX - minX,
      y: maxY - minY,
      z: maxZ - minZ
    };
    
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center,
      size
    };
  }

  private optimizeVertexLayout(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array
  ): {
    vertices: Float32Array;
    indices: Uint16Array;
    normals: Float32Array;
    uvs: Float32Array;
  } {
    // Interleave vertex data for better GPU cache performance
    // Format: [position(3), normal(3), uv(2)] per vertex
    const interleavedData: number[] = [];
    const vertexCount = vertices.length / 3;
    
    for (let i = 0; i < vertexCount; i++) {
      // Position
      interleavedData.push(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
      // Normal
      interleavedData.push(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
      // UV
      interleavedData.push(uvs[i * 2], uvs[i * 2 + 1]);
    }
    
    // For this implementation, return separate arrays for compatibility
    return { vertices, indices, normals, uvs };
  }

  private setupPerformanceMonitoring(): void {
    // Monitor frame rate
    const measureFrame = () => {
      const now = performance.now();
      if (this.renderStats.lastFrameTime > 0) {
        const deltaTime = now - this.renderStats.lastFrameTime;
        this.renderStats.avgFrameTime = (this.renderStats.avgFrameTime * 0.9) + (deltaTime * 0.1);
        this.performanceMetrics.fps = 1000 / this.renderStats.avgFrameTime;
      }
      this.renderStats.lastFrameTime = now;
      this.renderStats.frameCount++;
      
      requestAnimationFrame(measureFrame);
    };
    requestAnimationFrame(measureFrame);
    
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.performanceMetrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024);
        this.renderStats.memoryPeak = Math.max(this.renderStats.memoryPeak, this.performanceMetrics.memoryUsage);
      }
    }, 1000);
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  updateOptimizationOptions(options: Partial<OptimizationOptions>): void {
    this.optimizationOptions = { ...this.optimizationOptions, ...options };
    if (this.isInitialized) {
      this.optimizeForDevice();
    }
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      memoryUsage: 0,
      batteryDrain: 0,
      renderTime: 0,
      triangleCount: 0,
      drawCalls: 0
    };
  }

  private getDefaultOptions(): OptimizationOptions {
    return {
      targetPolygonCount: 100000,
      textureAtlasSize: 4096,
      lodLevels: 4,
      memoryBudget: 1024,
      batteryOptimization: false,
      targetFrameRate: 60
    };
  }

  // Occlusion culling implementation
  performOcclusionCulling(
    objects: Array<{ boundingBox: BoundingBox; visible: boolean }>,
    cameraPosition: { x: number; y: number; z: number },
    cameraDirection: { x: number; y: number; z: number }
  ): void {
    objects.forEach(obj => {
      // Simple frustum culling (in production would use proper occlusion queries)
      const dirToObject = {
        x: obj.boundingBox.center.x - cameraPosition.x,
        y: obj.boundingBox.center.y - cameraPosition.y,
        z: obj.boundingBox.center.z - cameraPosition.z
      };
      
      const dot = dirToObject.x * cameraDirection.x + 
                  dirToObject.y * cameraDirection.y + 
                  dirToObject.z * cameraDirection.z;
      
      obj.visible = dot > 0;
    });
  }

  // GPU memory management
  estimateVRAMUsage(mesh: OptimizedMesh, textureAtlas: TextureAtlas): number {
    const vertexData = mesh.vertices.byteLength + mesh.indices.byteLength + 
                      mesh.normals.byteLength + mesh.uvs.byteLength;
    const textureData = textureAtlas.size * textureAtlas.size * 4; // RGBA
    return (vertexData + textureData) / (1024 * 1024); // Convert to MB
  }
}

export default new Advanced3DOptimizationService();