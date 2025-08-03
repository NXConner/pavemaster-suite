// Bundle Optimization System
// Handles dynamic imports, tree shaking, code splitting, and image optimization

export interface OptimizationConfig {
  enableDynamicImports: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enablePrefetching: boolean;
  chunkSizeLimit: number;
  compressionThreshold: number;
  imageQuality: number;
  supportedFormats: string[];
}

export interface BundleMetrics {
  bundleSize: number;
  chunkCount: number;
  compressionRatio: number;
  loadTime: number;
  imagesOptimized: number;
  dynamicImports: number;
}

// Dynamic Import Manager
export class DynamicImportManager {
  private importCache = new Map<string, Promise<any>>();
  private loadingStates = new Map<string, boolean>();
  private errorStates = new Map<string, Error>();
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  constructor(private config: OptimizationConfig) {}

  // Dynamic import with caching and retry logic
  async import<T = any>(
    moduleId: string,
    factory: () => Promise<T>,
    options: {
      preload?: boolean;
      retry?: boolean;
      timeout?: number;
      fallback?: () => T;
    } = {}
  ): Promise<T> {
    const {
      preload = false,
      retry = true,
      timeout = 30000,
      fallback
    } = options;

    // Return cached import if available
    if (this.importCache.has(moduleId)) {
      try {
        return await this.importCache.get(moduleId)!;
      } catch (error) {
        if (!retry) throw error;
        this.importCache.delete(moduleId);
      }
    }

    // Check if already loading
    if (this.loadingStates.get(moduleId)) {
      return await this.importCache.get(moduleId)!;
    }

    // Start import with timeout and retry logic
    const importPromise = this.executeImport(moduleId, factory, timeout, retry, fallback);
    this.importCache.set(moduleId, importPromise);
    this.loadingStates.set(moduleId, true);

    try {
      const result = await importPromise;
      this.loadingStates.set(moduleId, false);
      this.errorStates.delete(moduleId);
      this.retryAttempts.delete(moduleId);
      return result;
    } catch (error) {
      this.loadingStates.set(moduleId, false);
      this.errorStates.set(moduleId, error as Error);
      this.importCache.delete(moduleId);
      throw error;
    }
  }

  // Execute import with retry logic
  private async executeImport<T>(
    moduleId: string,
    factory: () => Promise<T>,
    timeout: number,
    retry: boolean,
    fallback?: () => T
  ): Promise<T> {
    const attempts = this.retryAttempts.get(moduleId) || 0;

    try {
      return await Promise.race([
        factory(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Import timeout: ${moduleId}`)), timeout)
        )
      ]);
    } catch (error) {
      if (retry && attempts < this.maxRetries) {
        this.retryAttempts.set(moduleId, attempts + 1);
        
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeImport(moduleId, factory, timeout, retry, fallback);
      }

      if (fallback) {
        console.warn(`Import failed for ${moduleId}, using fallback:`, error);
        return fallback();
      }

      throw error;
    }
  }

  // Preload modules
  async preload(moduleConfigs: Array<{
    id: string;
    factory: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
  }>): Promise<void> {
    const sortedConfigs = moduleConfigs.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    const promises = sortedConfigs.map(async ({ id, factory }) => {
      try {
        await this.import(id, factory, { preload: true });
      } catch (error) {
        console.warn(`Preload failed for ${id}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Get import status
  getStatus(moduleId: string) {
    return {
      loading: this.loadingStates.get(moduleId) || false,
      error: this.errorStates.get(moduleId),
      cached: this.importCache.has(moduleId),
      retryCount: this.retryAttempts.get(moduleId) || 0,
    };
  }

  // Clear cache
  clearCache(moduleId?: string): void {
    if (moduleId) {
      this.importCache.delete(moduleId);
      this.loadingStates.delete(moduleId);
      this.errorStates.delete(moduleId);
      this.retryAttempts.delete(moduleId);
    } else {
      this.importCache.clear();
      this.loadingStates.clear();
      this.errorStates.clear();
      this.retryAttempts.clear();
    }
  }
}

// Code Splitting Utilities
export class CodeSplitter {
  private chunkRegistry = new Map<string, Promise<any>>();
  private dependencyGraph = new Map<string, Set<string>>();

  // Register a chunk with its dependencies
  registerChunk(
    chunkId: string,
    dependencies: string[] = [],
    factory: () => Promise<any>
  ): void {
    this.dependencyGraph.set(chunkId, new Set(dependencies));
    this.chunkRegistry.set(chunkId, factory());
  }

  // Load chunk with dependencies
  async loadChunk(chunkId: string): Promise<any> {
    const dependencies = this.dependencyGraph.get(chunkId) || new Set();
    
    // Load dependencies first
    if (dependencies.size > 0) {
      await Promise.all(
        Array.from(dependencies).map(dep => this.loadChunk(dep))
      );
    }

    // Load the chunk itself
    const chunk = this.chunkRegistry.get(chunkId);
    if (!chunk) {
      throw new Error(`Chunk not found: ${chunkId}`);
    }

    return await chunk;
  }

  // Get chunk size estimate
  async getChunkSize(chunkId: string): Promise<number> {
    try {
      const chunk = await this.loadChunk(chunkId);
      return new Blob([JSON.stringify(chunk)]).size;
    } catch {
      return 0;
    }
  }

  // Analyze bundle
  async analyzeBundles(): Promise<{
    chunks: Array<{ id: string; size: number; dependencies: string[] }>;
    totalSize: number;
    dependencyTree: Record<string, string[]>;
  }> {
    const chunks = [];
    let totalSize = 0;
    const dependencyTree: Record<string, string[]> = {};

    for (const [chunkId] of this.chunkRegistry) {
      const size = await this.getChunkSize(chunkId);
      const dependencies = Array.from(this.dependencyGraph.get(chunkId) || []);
      
      chunks.push({ id: chunkId, size, dependencies });
      totalSize += size;
      dependencyTree[chunkId] = dependencies;
    }

    return { chunks, totalSize, dependencyTree };
  }
}

// Image Optimizer
export class ImageOptimizer {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private optimizedCache = new Map<string, string>();

  constructor(private config: OptimizationConfig) {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Optimize image
  async optimizeImage(
    imageUrl: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): Promise<string> {
    const cacheKey = `${imageUrl}-${JSON.stringify(options)}`;
    
    if (this.optimizedCache.has(cacheKey)) {
      return this.optimizedCache.get(cacheKey)!;
    }

    try {
      const optimized = await this.processImage(imageUrl, options);
      this.optimizedCache.set(cacheKey, optimized);
      return optimized;
    } catch (error) {
      console.warn('Image optimization failed:', error);
      return imageUrl; // Return original on failure
    }
  }

  // Process image optimization
  private async processImage(
    imageUrl: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    }
  ): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }

    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = this.config.imageQuality / 100,
      format = 'webp'
    } = options;

    // Load image
    const image = await this.loadImage(imageUrl);
    
    // Calculate new dimensions
    const { width, height } = this.calculateDimensions(
      image.naturalWidth,
      image.naturalHeight,
      maxWidth,
      maxHeight
    );

    // Resize canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw and compress
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image, 0, 0, width, height);

    // Convert to optimized format
    const mimeType = `image/${format}`;
    if (this.canvas.toBlob && this.isFormatSupported(format)) {
      return new Promise((resolve, reject) => {
        this.canvas!.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      });
    } else {
      return this.canvas.toDataURL(mimeType, quality);
    }
  }

  // Load image promise
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Calculate optimal dimensions
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  // Check format support
  private isFormatSupported(format: string): boolean {
    if (!this.canvas) return false;
    
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 1;
    testCanvas.height = 1;
    
    try {
      const dataUrl = testCanvas.toDataURL(`image/${format}`);
      return dataUrl.indexOf(`data:image/${format}`) === 0;
    } catch {
      return false;
    }
  }

  // Batch optimize images
  async optimizeBatch(
    images: Array<{ url: string; options?: any }>,
    concurrency: number = 3
  ): Promise<Array<{ original: string; optimized: string; savings: number }>> {
    const results = [];
    const chunks = this.chunkArray(images, concurrency);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async ({ url, options }) => {
          const optimized = await this.optimizeImage(url, options);
          const originalSize = await this.getImageSize(url);
          const optimizedSize = await this.getImageSize(optimized);
          const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

          return {
            original: url,
            optimized,
            savings
          };
        })
      );

      results.push(...chunkResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
      );
    }

    return results;
  }

  // Get image file size
  private async getImageSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Chunk array utility
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Bundle Analyzer
export class BundleAnalyzer {
  private loadTimes = new Map<string, number>();
  private bundleSizes = new Map<string, number>();
  private observer?: PerformanceObserver;

  constructor() {
    this.setupPerformanceMonitoring();
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordLoadTime('initial', entry.loadEventEnd - entry.loadEventStart);
          } else if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordLoadTime(resourceEntry.name, resourceEntry.responseEnd - resourceEntry.startTime);
            
            if (resourceEntry.transferSize) {
              this.recordBundleSize(resourceEntry.name, resourceEntry.transferSize);
            }
          }
        }
      });

      this.observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  // Record load time
  recordLoadTime(resource: string, time: number): void {
    this.loadTimes.set(resource, time);
  }

  // Record bundle size
  recordBundleSize(resource: string, size: number): void {
    this.bundleSizes.set(resource, size);
  }

  // Get performance metrics
  getMetrics(): BundleMetrics {
    const bundleSize = Array.from(this.bundleSizes.values()).reduce((sum, size) => sum + size, 0);
    const chunkCount = this.bundleSizes.size;
    const avgLoadTime = Array.from(this.loadTimes.values()).reduce((sum, time) => sum + time, 0) / this.loadTimes.size;

    return {
      bundleSize,
      chunkCount,
      compressionRatio: 0, // Would be calculated based on original vs compressed sizes
      loadTime: avgLoadTime || 0,
      imagesOptimized: 0, // Would be tracked by ImageOptimizer
      dynamicImports: 0, // Would be tracked by DynamicImportManager
    };
  }

  // Analyze largest contentful paint
  getLargestContentfulPaint(): Promise<number> {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
        observer.disconnect();
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 10000);
    });
  }

  // Analyze first input delay
  getFirstInputDelay(): Promise<number> {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const firstEntry = entries[0] as any;
          resolve(firstEntry.processingStart - firstEntry.startTime);
        }
        observer.disconnect();
      });

      observer.observe({ entryTypes: ['first-input'] });

      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 10000);
    });
  }

  // Cleanup
  cleanup(): void {
    this.observer?.disconnect();
  }
}

// Tree Shaking Analyzer (for development)
export class TreeShakingAnalyzer {
  private usageMap = new Map<string, Set<string>>();
  private exportMap = new Map<string, Set<string>>();

  // Track usage of imports
  trackUsage(moduleName: string, importedItems: string[]): void {
    if (!this.usageMap.has(moduleName)) {
      this.usageMap.set(moduleName, new Set());
    }
    
    const usage = this.usageMap.get(moduleName)!;
    importedItems.forEach(item => usage.add(item));
  }

  // Track exports
  trackExports(moduleName: string, exportedItems: string[]): void {
    if (!this.exportMap.has(moduleName)) {
      this.exportMap.set(moduleName, new Set());
    }
    
    const exports = this.exportMap.get(moduleName)!;
    exportedItems.forEach(item => exports.add(item));
  }

  // Analyze unused exports
  analyzeUnusedExports(): Record<string, string[]> {
    const unused: Record<string, string[]> = {};

    for (const [moduleName, exports] of this.exportMap) {
      const usage = this.usageMap.get(moduleName) || new Set();
      const unusedExports = Array.from(exports).filter(exp => !usage.has(exp));
      
      if (unusedExports.length > 0) {
        unused[moduleName] = unusedExports;
      }
    }

    return unused;
  }

  // Generate tree shaking report
  generateReport(): {
    totalExports: number;
    usedExports: number;
    unusedExports: number;
    efficiency: number;
    modules: Array<{
      name: string;
      exports: number;
      used: number;
      unused: string[];
    }>;
  } {
    let totalExports = 0;
    let usedExports = 0;
    const modules = [];

    for (const [moduleName, exports] of this.exportMap) {
      const usage = this.usageMap.get(moduleName) || new Set();
      const used = Array.from(exports).filter(exp => usage.has(exp));
      const unused = Array.from(exports).filter(exp => !usage.has(exp));

      totalExports += exports.size;
      usedExports += used.length;

      modules.push({
        name: moduleName,
        exports: exports.size,
        used: used.length,
        unused,
      });
    }

    const efficiency = totalExports > 0 ? (usedExports / totalExports) * 100 : 0;

    return {
      totalExports,
      usedExports,
      unusedExports: totalExports - usedExports,
      efficiency: Math.round(efficiency),
      modules,
    };
  }
}

// Create singleton instances
const defaultConfig: OptimizationConfig = {
  enableDynamicImports: true,
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enablePrefetching: true,
  chunkSizeLimit: 250 * 1024, // 250KB
  compressionThreshold: 1024, // 1KB
  imageQuality: 85,
  supportedFormats: ['webp', 'jpeg', 'png'],
};

export const dynamicImportManager = new DynamicImportManager(defaultConfig);
export const codeSplitter = new CodeSplitter();
export const imageOptimizer = new ImageOptimizer(defaultConfig);
export const bundleAnalyzer = new BundleAnalyzer();
export const treeShakingAnalyzer = new TreeShakingAnalyzer();

// Main bundle optimization interface
export class BundleOptimizer {
  constructor(
    private config: OptimizationConfig = defaultConfig,
    private importManager = dynamicImportManager,
    private splitter = codeSplitter,
    private imageOpt = imageOptimizer,
    private analyzer = bundleAnalyzer
  ) {}

  // Initialize optimization
  async initialize(): Promise<void> {
    // Preload critical chunks
    if (this.config.enablePrefetching) {
      await this.preloadCriticalChunks();
    }

    // Setup image optimization
    if (this.config.enableImageOptimization) {
      this.setupImageOptimization();
    }

    console.log('Bundle optimizer initialized');
  }

  // Preload critical chunks
  private async preloadCriticalChunks(): Promise<void> {
    const criticalModules = [
      {
        id: 'core-ui',
        factory: () => import('../components/ui'),
        priority: 'high' as const,
      },
      {
        id: 'router',
        factory: () => import('react-router-dom'),
        priority: 'high' as const,
      },
      {
        id: 'utils',
        factory: () => import('../lib/utils'),
        priority: 'medium' as const,
      },
    ];

    await this.importManager.preload(criticalModules);
  }

  // Setup image optimization
  private setupImageOptimization(): void {
    // Optimize images on page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.optimizePageImages();
      });
    }
  }

  // Optimize images on current page
  private async optimizePageImages(): Promise<void> {
    const images = document.querySelectorAll('img[src]');
    const imageUrls = Array.from(images)
      .map(img => (img as HTMLImageElement).src)
      .filter(src => src && !src.startsWith('data:'));

    if (imageUrls.length > 0) {
      const optimizationPromises = imageUrls.map(url => ({
        url,
        options: { quality: this.config.imageQuality }
      }));

      try {
        await this.imageOpt.optimizeBatch(optimizationPromises);
      } catch (error) {
        console.warn('Batch image optimization failed:', error);
      }
    }
  }

  // Get optimization metrics
  getMetrics(): BundleMetrics {
    return this.analyzer.getMetrics();
  }

  // Cleanup resources
  cleanup(): void {
    this.analyzer.cleanup();
  }
}

export const bundleOptimizer = new BundleOptimizer();