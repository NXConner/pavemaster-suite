/**
 * Comprehensive Test Setup - 95%+ Coverage Target
 * Sets up testing infrastructure for unit, integration, E2E, and performance tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { performanceMonitor } from '@/lib/performance';

// Mock global objects for testing environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
  writable: true,
});

// Mock performance API
global.performance = {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Canvas for image processing tests
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 100,
      height: 100,
    })),
    putImageData: vi.fn(),
  })),
  width: 100,
  height: 100,
};

global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
global.CanvasRenderingContext2D = vi.fn();

// Mock URL for file handling
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as any;

// Mock File API
global.File = vi.fn((data, name, options) => ({
  name,
  size: data.length,
  type: options?.type || 'application/octet-stream',
  lastModified: Date.now(),
  data,
})) as any;

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  result: null,
  error: null,
  onload: null,
  onerror: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null,
  abort: vi.fn(),
  DONE: 2,
  EMPTY: 0,
  LOADING: 1,
  readyState: 0,
})) as any;

// Mock fetch for API testing
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    clone: vi.fn(),
    headers: new Map(),
  })
) as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock Capacitor plugins for mobile testing
vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(() => Promise.resolve({
      webPath: 'blob:mock-photo',
      format: 'jpeg',
      saved: false,
    })),
    requestPermissions: vi.fn(() => Promise.resolve({ camera: 'granted' })),
  },
  CameraResultType: {
    Uri: 'uri',
    Base64: 'base64',
    DataUrl: 'dataUrl',
  },
  CameraSource: {
    Camera: 'camera',
    Photos: 'photos',
  },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: vi.fn(() => Promise.resolve({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })),
    watchPosition: vi.fn(() => Promise.resolve('mock-watch-id')),
    clearWatch: vi.fn(() => Promise.resolve()),
    requestPermissions: vi.fn(() => Promise.resolve({ location: 'granted' })),
  },
}));

vi.mock('@capacitor/device', () => ({
  Device: {
    getInfo: vi.fn(() => Promise.resolve({
      platform: 'web',
      model: 'MockDevice',
      operatingSystem: 'web',
      osVersion: '1.0.0',
      manufacturer: 'Mock',
      isVirtual: false,
      memUsed: 100,
      diskFree: 1000,
      diskTotal: 2000,
      realDiskFree: 1000,
      realDiskTotal: 2000,
      webViewVersion: '1.0.0',
    })),
    getId: vi.fn(() => Promise.resolve({ uuid: 'mock-device-id' })),
    getBatteryInfo: vi.fn(() => Promise.resolve({
      batteryLevel: 0.8,
      isCharging: false,
    })),
    getLanguageCode: vi.fn(() => Promise.resolve({ value: 'en' })),
  },
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn(() => Promise.resolve({
      connected: true,
      connectionType: 'wifi',
    })),
    addListener: vi.fn(() => Promise.resolve()),
    removeAllListeners: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve({ value: null })),
    remove: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
    keys: vi.fn(() => Promise.resolve({ keys: [] })),
  },
}));

vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    requestPermissions: vi.fn(() => Promise.resolve({ receive: 'granted' })),
    register: vi.fn(() => Promise.resolve()),
    addListener: vi.fn(() => Promise.resolve()),
    removeAllListeners: vi.fn(() => Promise.resolve()),
    getDeliveredNotifications: vi.fn(() => Promise.resolve({ notifications: [] })),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(() => Promise.resolve()),
    vibrate: vi.fn(() => Promise.resolve()),
    selectionStart: vi.fn(() => Promise.resolve()),
    selectionChanged: vi.fn(() => Promise.resolve()),
    selectionEnd: vi.fn(() => Promise.resolve()),
  },
  ImpactStyle: {
    Heavy: 'HEAVY',
    Medium: 'MEDIUM',
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/motion', () => ({
  Motion: {
    addListener: vi.fn(() => Promise.resolve('mock-listener-id')),
    removeAllListeners: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: vi.fn(() => Promise.resolve()),
    setBackgroundColor: vi.fn(() => Promise.resolve()),
    getInfo: vi.fn(() => Promise.resolve({
      visible: true,
      style: 'DEFAULT',
      color: '#ffffff',
      overlays: false,
    })),
    show: vi.fn(() => Promise.resolve()),
    hide: vi.fn(() => Promise.resolve()),
  },
  Style: {
    Dark: 'DARK',
    Light: 'LIGHT',
    Default: 'DEFAULT',
  },
}));

vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: {
    show: vi.fn(() => Promise.resolve()),
    hide: vi.fn(() => Promise.resolve()),
  },
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => Promise.resolve('SUBSCRIBED')),
      send: vi.fn(() => Promise.resolve('ok')),
      unsubscribe: vi.fn(() => Promise.resolve('ok')),
    })),
    removeChannel: vi.fn(() => Promise.resolve('ok')),
    realtime: {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
}));

// Mock TensorFlow.js for AI testing
vi.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: vi.fn(() => Promise.resolve({
    predict: vi.fn(() => ({
      dataSync: vi.fn(() => [0.95, 0.03, 0.02]),
      dispose: vi.fn(),
    })),
    dispose: vi.fn(),
  })),
  tensor: vi.fn(() => ({
    dataSync: vi.fn(() => [1, 2, 3, 4]),
    dispose: vi.fn(),
  })),
  dispose: vi.fn(),
  ready: vi.fn(() => Promise.resolve()),
}));

// Mock React Window for virtual scrolling tests
vi.mock('react-window', () => ({
  FixedSizeList: vi.fn(({ children, itemCount, itemSize }) => {
    // Mock virtual list rendering first few items
    const items = [];
    const visibleCount = Math.min(itemCount, 10);
    
    for (let i = 0; i < visibleCount; i++) {
      items.push(
        children({
          index: i,
          style: { height: itemSize, top: i * itemSize },
        })
      );
    }
    
    return items;
  }),
}));

// Mock Recharts for chart testing
vi.mock('recharts', () => ({
  LineChart: vi.fn(({ children }) => children),
  Line: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
  BarChart: vi.fn(({ children }) => children),
  Bar: vi.fn(() => null),
  PieChart: vi.fn(({ children }) => children),
  Pie: vi.fn(() => null),
  Cell: vi.fn(() => null),
}));

// Test utilities
export const createMockFile = (name: string, size: number = 1024, type: string = 'image/jpeg'): File => {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
};

export const createMockGeolocation = () => ({
  coords: {
    latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
    accuracy: Math.random() * 10 + 5,
    altitude: null,
    altitudeAccuracy: null,
    heading: Math.random() * 360,
    speed: Math.random() * 10,
  },
  timestamp: Date.now(),
});

export const createMockSensorData = () => ({
  accelerometer: {
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 20,
    z: 9.8 + (Math.random() - 0.5) * 2,
  },
  gyroscope: {
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 10,
  },
  magnetometer: {
    x: (Math.random() - 0.5) * 100,
    y: (Math.random() - 0.5) * 100,
    z: (Math.random() - 0.5) * 100,
  },
  timestamp: Date.now(),
  accuracy: 1.0,
});

export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockPerformanceEntry = (name: string, duration: number = 100) => ({
  name,
  entryType: 'measure',
  startTime: performance.now(),
  duration,
});

// Initialize performance monitoring for tests
performanceMonitor.recordMetric('test_setup_complete', performance.now(), 'ms');

console.log('🧪 Comprehensive test setup completed with 95%+ coverage target');

// Setup cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Global test configuration
export const testConfig = {
  timeout: 10000, // 10 second timeout for async tests
  retries: 2, // Retry flaky tests twice
  coverage: {
    target: 95, // 95% coverage target
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95,
  },
  performance: {
    maxExecutionTime: 100, // Max 100ms for performance tests
    memoryLeakThreshold: 10, // Max 10MB memory increase
  },
};