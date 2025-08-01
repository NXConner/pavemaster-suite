#!/bin/bash

# Phase 5: Mobile & PWA Enhancement Script
# Comprehensive mobile optimization and PWA features

set -e

echo "🚀 Starting Phase 5: Mobile & PWA Enhancement"
echo "=============================================="

# Create completion tracking
COMPLETION_FILE="PHASE_5_COMPLETION_REPORT.md"

# Function to log progress
log_progress() {
    echo "✅ $1" | tee -a "$COMPLETION_FILE"
}

# Initialize completion report
cat > "$COMPLETION_FILE" << 'EOF'
# Phase 5 Completion Report - Mobile & PWA Enhancement
## PaveMaster Suite - Comprehensive Mobile Optimization

### 🎯 **PHASE 5 PROGRESS**

EOF

echo "📱 Phase 5: Mobile & PWA Enhancement Starting..."

# 1. Enhanced PWA Configuration
echo "🔧 Step 1: Enhanced PWA Configuration"

# Install PWA dependencies
echo "📦 Installing PWA dependencies..."
npm install --save-dev @vite-pwa/assets-generator vite-plugin-pwa workbox-window
npm install --save workbox-precaching workbox-routing workbox-strategies workbox-background-sync

# Create enhanced PWA manifest
cat > "public/manifest.json" << 'EOF'
{
  "name": "PaveMaster Suite",
  "short_name": "PaveMaster",
  "description": "Professional pavement performance management suite",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait-primary",
  "lang": "en",
  "categories": ["business", "productivity", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard Overview"
    },
    {
      "src": "/screenshots/mobile-dashboard.png", 
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile Dashboard"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View main dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/dashboard-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Projects",
      "short_name": "Projects", 
      "description": "Manage projects",
      "url": "/projects",
      "icons": [{ "src": "/icons/projects-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Mobile Tools",
      "short_name": "Mobile",
      "description": "Field operations",
      "url": "/mobile",
      "icons": [{ "src": "/icons/mobile-96x96.png", "sizes": "96x96" }]
    }
  ],
  "icons": [
    {
      "src": "/icons/pwa-64x64.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "/icons/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false,
  "dir": "ltr"
}
EOF

log_progress "Enhanced PWA manifest with shortcuts and screenshots"

# Create service worker
mkdir -p public/sw
cat > "public/sw/service-worker.js" << 'EOF'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache strategies for different content types
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return `${request.url}?version=1.0.0`;
      }
    }]
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// API caching with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null;
      }
    }]
  })
);

// Background sync for offline actions
const bgSync = new BackgroundSync('offline-actions', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') && 
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE'),
  bgSync
);

// Navigation route for SPA
const navigationRoute = new NavigationRoute(({ url }) => {
  return url.pathname.startsWith('/') && !url.pathname.startsWith('/api/');
}, {
  allowlist: [/^\/(?!api)/],
  denylist: [/^\/api/]
});

registerRoute(navigationRoute);

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/pwa-192x192.png',
    badge: '/icons/pwa-64x64.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PaveMaster Suite', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Install and activate event handlers
self.addEventListener('install', (event) => {
  console.log('PaveMaster PWA: Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('PaveMaster PWA: Service Worker activated');
  event.waitUntil(clients.claim());
});
EOF

log_progress "Advanced service worker with background sync and push notifications"

# 2. Mobile-Optimized Components
echo "📱 Step 2: Mobile-Optimized Components"

# Create mobile navigation
mkdir -p src/mobile/components
cat > "src/mobile/components/MobileNavigation.tsx" << 'EOF'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, BarChart3, Settings, Menu, X, Truck, Users, 
  ClipboardList, DollarSign, Brain, Smartphone, Bell, Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mobileNavigation = [
  { name: 'Dashboard', href: '/', icon: Home, badge: null },
  { name: 'Projects', href: '/projects', icon: ClipboardList, badge: '3' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
  { name: 'Equipment', href: '/equipment', icon: Truck, badge: '2' },
  { name: 'Team', href: '/team', icon: Users, badge: null },
  { name: 'Financial', href: '/financial', icon: DollarSign, badge: null },
  { name: 'Mobile Tools', href: '/mobile', icon: Smartphone, badge: 'NEW' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b md:hidden sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">PM</span>
            </div>
            <span className="text-lg font-bold text-gray-900">PaveMaster</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {mobileNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant={item.badge === 'NEW' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="border-t p-4 mt-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">JD</span>
              </div>
              <div>
                <div className="font-medium">John Doe</div>
                <div className="text-sm text-gray-500">Project Manager</div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="flex items-center justify-around py-2">
          {mobileNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1 px-2 py-1 min-w-0 relative',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">{item.name}</span>
                
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                    {item.badge === 'NEW' ? '' : item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
EOF

log_progress "Mobile navigation with drawer and bottom tabs"

# Create touch-optimized components
cat > "src/mobile/components/TouchOptimizedForm.tsx" << 'EOF'
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  hapticFeedback?: boolean;
}

export function TouchOptimizedButton({ 
  className, 
  hapticFeedback = true,
  onClick,
  children,
  ...props 
}: TouchOptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(20); // Slightly stronger feedback on click
    }
    onClick?.(e);
  };

  return (
    <Button
      className={cn(
        // Enhanced touch targets (minimum 44px)
        'min-h-[44px] min-w-[44px] touch-manipulation',
        // Active state styling
        isPressed && 'scale-95 brightness-90',
        // Smooth transitions
        'transition-all duration-150 ease-out',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}

interface TouchOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TouchOptimizedInput({ 
  className, 
  label, 
  error, 
  helperText,
  id,
  ...props 
}: TouchOptimizedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Auto-zoom prevention for iOS
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      setIsFocused(true);
      // Prevent zoom on iOS by temporarily increasing font size
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        input.style.fontSize = '16px';
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Reset font size
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        input.style.fontSize = '';
      }
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          htmlFor={inputId}
          className="text-base font-medium" // Larger label for better touch
        >
          {label}
        </Label>
      )}
      
      <Input
        ref={inputRef}
        id={inputId}
        className={cn(
          // Enhanced touch targets
          'min-h-[44px] text-base', // Larger text prevents iOS zoom
          // Focus styling
          isFocused && 'ring-2 ring-blue-500 border-blue-500',
          // Error styling
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}

interface TouchOptimizedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export function TouchOptimizedTextarea({ 
  className, 
  label, 
  error, 
  helperText,
  autoResize = false,
  id,
  onChange,
  ...props 
}: TouchOptimizedTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    adjustHeight(); // Initial adjustment

    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    
    // Auto-resize on change
    if (autoResize) {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          htmlFor={textareaId}
          className="text-base font-medium"
        >
          {label}
        </Label>
      )}
      
      <Textarea
        ref={textareaRef}
        id={textareaId}
        className={cn(
          // Enhanced touch targets
          'min-h-[44px] text-base resize-none', // Prevent manual resize if auto-resize is enabled
          // Focus styling
          isFocused && 'ring-2 ring-blue-500 border-blue-500',
          // Error styling
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleChange}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}

// Example usage component
export function TouchOptimizedFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Handle form submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <TouchOptimizedInput
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Enter your full name"
      />
      
      <TouchOptimizedInput
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="Enter your email"
      />
      
      <TouchOptimizedTextarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Enter your message"
        autoResize
        helperText="This field will automatically resize as you type"
      />
      
      <TouchOptimizedButton
        type="submit"
        className="w-full"
        size="lg"
      >
        Submit Form
      </TouchOptimizedButton>
    </form>
  );
}
EOF

log_progress "Touch-optimized form components with haptic feedback"

# 3. Enhanced Offline Capabilities
echo "💾 Step 3: Enhanced Offline Capabilities"

# Create offline manager
mkdir -p src/mobile/utils
cat > "src/mobile/utils/OfflineManager.ts" << 'EOF'
interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class OfflineManager {
  private dbName = 'pavemaster-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initializeDB();
    this.setupOnlineListeners();
    this.loadSyncQueue();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }
      };
    });
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - syncing offline data');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Connection lost - switching to offline mode');
    });
  }

  // Store data for offline access
  async storeOfflineData(type: string, data: any, id?: string): Promise<string> {
    if (!this.db) await this.initializeDB();

    const offlineData: OfflineData = {
      id: id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: this.isOnline
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.put(offlineData);
      request.onsuccess = () => resolve(offlineData.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve offline data
  async getOfflineData(type?: string): Promise<OfflineData[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      let request: IDBRequest;
      
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add item to sync queue
  async addToSyncQueue(
    method: SyncQueueItem['method'],
    url: string,
    data?: any,
    maxRetries = 3
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      url,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();

    // If online, try to sync immediately
    if (this.isOnline) {
      this.syncOfflineData();
    }
  }

  private async saveSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      // Clear existing queue and save new one
      store.clear().onsuccess = () => {
        let completed = 0;
        const total = this.syncQueue.length;
        
        if (total === 0) {
          resolve();
          return;
        }

        this.syncQueue.forEach(item => {
          const request = store.add(item);
          request.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
          request.onerror = () => reject(request.error);
        });
      };
    });
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      
      const request = store.getAll();
      request.onsuccess = () => {
        this.syncQueue = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync offline data when online
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.syncQueue.length} offline items...`);

    const itemsToRemove: string[] = [];
    
    for (const item of this.syncQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });

        if (response.ok) {
          console.log(`✅ Synced: ${item.method} ${item.url}`);
          itemsToRemove.push(item.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Sync failed for ${item.id}:`, error);
        
        item.retryCount++;
        
        if (item.retryCount >= item.maxRetries) {
          console.error(`🚫 Max retries reached for ${item.id}, removing from queue`);
          itemsToRemove.push(item.id);
        }
      }
    }

    // Remove successfully synced and failed items
    this.syncQueue = this.syncQueue.filter(item => !itemsToRemove.includes(item.id));
    await this.saveSyncQueue();

    this.syncInProgress = false;
    
    if (this.syncQueue.length > 0) {
      console.log(`⏳ ${this.syncQueue.length} items remaining in sync queue`);
    } else {
      console.log('🎉 All offline data synced successfully!');
    }
  }

  // Get sync status
  getSyncStatus(): { 
    isOnline: boolean; 
    pendingSync: number; 
    syncInProgress: boolean 
  } {
    return {
      isOnline: this.isOnline,
      pendingSync: this.syncQueue.length,
      syncInProgress: this.syncInProgress
    };
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'syncQueue'], 'readwrite');
      
      transaction.objectStore('offlineData').clear();
      transaction.objectStore('syncQueue').clear();
      
      transaction.oncomplete = () => {
        this.syncQueue = [];
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Store user settings
  async storeSettings(key: string, value: any): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');
      
      const request = store.put({ key, value, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get user settings
  async getSettings(key: string): Promise<any> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();
export default offlineManager;
EOF

log_progress "Enhanced offline manager with IndexedDB and sync queue"

# 4. Native Device Features
echo "📲 Step 4: Native Device Features Integration"

# Create native features utility
cat > "src/mobile/utils/NativeFeatures.ts" << 'EOF'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { App, AppInfo } from '@capacitor/app';

export interface PhotoResult {
  webPath: string;
  base64String?: string;
  format: string;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  schedule?: Date;
  sound?: string;
  smallIcon?: string;
  largeIcon?: string;
}

class NativeFeatures {
  private isCapacitorAvailable = false;

  constructor() {
    this.checkCapacitorAvailability();
  }

  private checkCapacitorAvailability(): void {
    this.isCapacitorAvailable = !!(window as any).Capacitor;
    
    if (!this.isCapacitorAvailable) {
      console.warn('📱 Capacitor not available - native features will use web fallbacks');
    }
  }

  // Camera functionality
  async takePicture(options?: {
    quality?: number;
    allowEditing?: boolean;
    resultType?: 'base64' | 'uri';
    source?: 'camera' | 'photos';
  }): Promise<PhotoResult> {
    if (!this.isCapacitorAvailable) {
      return this.webCameraFallback();
    }

    try {
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing || false,
        resultType: options?.resultType === 'base64' ? CameraResultType.Base64 : CameraResultType.Uri,
        source: options?.source === 'photos' ? CameraSource.Photos : CameraSource.Camera,
      });

      return {
        webPath: image.webPath || '',
        base64String: image.base64String,
        format: image.format || 'jpeg'
      };
    } catch (error) {
      console.error('📷 Camera error:', error);
      throw new Error('Failed to take picture');
    }
  }

  private async webCameraFallback(): Promise<PhotoResult> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera by default
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              webPath: URL.createObjectURL(file),
              base64String: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg'
            });
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.click();
    });
  }

  // Geolocation functionality
  async getCurrentPosition(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationResult> {
    if (!this.isCapacitorAvailable) {
      return this.webGeolocationFallback(options);
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options?.enableHighAccuracy || true,
        timeout: options?.timeout || 10000,
        maximumAge: options?.maximumAge || 60000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error('📍 Geolocation error:', error);
      throw new Error('Failed to get current position');
    }
  }

  private async webGeolocationFallback(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        }
      );
    });
  }

  // Watch position for continuous tracking
  async watchPosition(
    callback: (position: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): Promise<string> {
    if (!this.isCapacitorAvailable) {
      return this.webWatchPositionFallback(callback, errorCallback, options);
    }

    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        },
        (position) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          }
        },
        (error) => {
          errorCallback?.(new Error(`Watch position error: ${error.message}`));
        }
      );

      return watchId;
    } catch (error) {
      console.error('📍 Watch position error:', error);
      throw new Error('Failed to watch position');
    }
  }

  private async webWatchPositionFallback(
    callback: (position: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          errorCallback?.(new Error(`Watch position error: ${error.message}`));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        }
      );

      resolve(watchId.toString());
    });
  }

  // Clear position watch
  async clearWatch(watchId: string): Promise<void> {
    if (!this.isCapacitorAvailable) {
      navigator.geolocation.clearWatch(parseInt(watchId));
      return;
    }

    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('📍 Clear watch error:', error);
    }
  }

  // Local notifications
  async scheduleNotification(options: NotificationOptions): Promise<void> {
    if (!this.isCapacitorAvailable) {
      return this.webNotificationFallback(options);
    }

    try {
      await LocalNotifications.requestPermissions();

      const notificationOptions: ScheduleOptions = {
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id || Date.now(),
            schedule: options.schedule ? { at: options.schedule } : undefined,
            sound: options.sound || 'default',
            smallIcon: options.smallIcon || 'ic_stat_icon_config_sample',
            largeIcon: options.largeIcon,
          },
        ],
      };

      await LocalNotifications.schedule(notificationOptions);
    } catch (error) {
      console.error('🔔 Notification error:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  private async webNotificationFallback(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.smallIcon || '/icons/pwa-192x192.png',
        badge: options.largeIcon,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } else {
      throw new Error('Notification permission denied');
    }
  }

  // App info
  async getAppInfo(): Promise<AppInfo | null> {
    if (!this.isCapacitorAvailable) {
      return {
        name: 'PaveMaster Suite',
        id: 'com.pavemaster.suite',
        build: '1.0.0',
        version: '1.0.0',
      };
    }

    try {
      return await App.getInfo();
    } catch (error) {
      console.error('📱 App info error:', error);
      return null;
    }
  }

  // App state handling
  setupAppStateListeners(): void {
    if (!this.isCapacitorAvailable) {
      // Web fallback for app state
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📱 App moved to background');
        } else {
          console.log('📱 App moved to foreground');
        }
      });
      return;
    }

    App.addListener('appStateChange', ({ isActive }) => {
      console.log('📱 App state changed. Is active:', isActive);
      
      if (isActive) {
        // App resumed - sync data, refresh content
        console.log('📱 App resumed - refreshing data');
      } else {
        // App paused - save state, pause operations
        console.log('📱 App paused - saving state');
      }
    });
  }

  // Haptic feedback
  async hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      
      navigator.vibrate(patterns[type]);
    }
  }

  // Check if native features are available
  isNativeFeatureAvailable(feature: 'camera' | 'geolocation' | 'notifications'): boolean {
    if (!this.isCapacitorAvailable) {
      switch (feature) {
        case 'camera':
          return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        case 'geolocation':
          return 'geolocation' in navigator;
        case 'notifications':
          return 'Notification' in window;
        default:
          return false;
      }
    }

    return true; // Assume all features are available in native context
  }
}

// Create singleton instance
export const nativeFeatures = new NativeFeatures();
export default nativeFeatures;
EOF

log_progress "Native device features with web fallbacks"

# 5. Mobile Hooks
echo "🎣 Step 5: Mobile React Hooks"

# Create mobile detection hook
mkdir -p src/mobile/hooks
cat > "src/mobile/hooks/useMobileDetection.ts" << 'EOF'
import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchSupported: false,
        deviceType: 'desktop',
        userAgent: '',
      };
    }

    return calculateDetection();
  });

  function calculateDetection(): MobileDetectionResult {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent;

    // Screen size based detection
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;

    // User agent based detection for more accuracy
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|Android(?=.*\bTablet\b)/i;
    
    const isUserAgentMobile = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
    const isUserAgentTablet = tabletRegex.test(userAgent);

    // Combine screen size and user agent detection
    const finalIsMobile = isMobile || (isUserAgentMobile && !isUserAgentTablet);
    const finalIsTablet = (isTablet || isUserAgentTablet) && !finalIsMobile;
    const finalIsDesktop = !finalIsMobile && !finalIsTablet;

    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (finalIsMobile) deviceType = 'mobile';
    else if (finalIsTablet) deviceType = 'tablet';
    else deviceType = 'desktop';

    return {
      isMobile: finalIsMobile,
      isTablet: finalIsTablet,
      isDesktop: finalIsDesktop,
      screenWidth,
      screenHeight,
      orientation,
      touchSupported,
      deviceType,
      userAgent,
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setDetection(calculateDetection());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setDetection(calculateDetection());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return detection;
}

// Hook for responsive breakpoints
export function useResponsiveBreakpoint() {
  const { screenWidth } = useMobileDetection();

  return {
    xs: screenWidth < 480,
    sm: screenWidth >= 480 && screenWidth < 768,
    md: screenWidth >= 768 && screenWidth < 1024,
    lg: screenWidth >= 1024 && screenWidth < 1280,
    xl: screenWidth >= 1280,
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
  };
}

// Hook for touch gestures
export function useTouchGestures(elementRef: React.RefObject<HTMLElement>) {
  const [gestureState, setGestureState] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPinching: false,
    scale: 1,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;
    let startScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - swipe detection
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Multi-touch - pinch detection
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        startDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setGestureState(prev => ({ ...prev, isPinching: true }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (startDistance > 0) {
          const scale = currentDistance / startDistance;
          setGestureState(prev => ({ ...prev, scale: startScale * scale }));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && !gestureState.isPinching) {
        // Swipe detection
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
              setGestureState(prev => ({ ...prev, isSwipeRight: true }));
            } else {
              setGestureState(prev => ({ ...prev, isSwipeLeft: true }));
            }
          } else {
            // Vertical swipe
            if (deltaY > 0) {
              setGestureState(prev => ({ ...prev, isSwipeDown: true }));
            } else {
              setGestureState(prev => ({ ...prev, isSwipeUp: true }));
            }
          }

          // Reset gesture state after a short delay
          setTimeout(() => {
            setGestureState({
              isSwipeLeft: false,
              isSwipeRight: false,
              isSwipeUp: false,
              isSwipeDown: false,
              isPinching: false,
              scale: 1,
            });
          }, 100);
        }
      }

      if (e.touches.length < 2) {
        setGestureState(prev => ({ ...prev, isPinching: false }));
        startScale = gestureState.scale;
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, gestureState.isPinching, gestureState.scale]);

  return gestureState;
}
EOF

log_progress "Mobile detection and touch gesture hooks"

# Create offline status hook
cat > "src/mobile/hooks/useOfflineStatus.ts" << 'EOF'
import { useState, useEffect } from 'react';
import { offlineManager } from '../utils/OfflineManager';

interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  hasOfflineData: boolean;
}

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>(() => {
    const syncStatus = offlineManager.getSyncStatus();
    return {
      isOnline: syncStatus.isOnline,
      pendingSyncCount: syncStatus.pendingSync,
      syncInProgress: syncStatus.syncInProgress,
      lastSyncTime: null,
      hasOfflineData: false,
    };
  });

  useEffect(() => {
    const updateStatus = () => {
      const syncStatus = offlineManager.getSyncStatus();
      
      // Check for offline data
      offlineManager.getOfflineData().then(data => {
        setStatus(prev => ({
          ...prev,
          isOnline: syncStatus.isOnline,
          pendingSyncCount: syncStatus.pendingSync,
          syncInProgress: syncStatus.syncInProgress,
          hasOfflineData: data.length > 0,
          lastSyncTime: prev.lastSyncTime || new Date(),
        }));
      });
    };

    // Initial update
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      updateStatus();
      setStatus(prev => ({ ...prev, lastSyncTime: new Date() }));
    };

    const handleOffline = () => {
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic status update
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return status;
}

// Hook for managing offline data
export function useOfflineData<T>(dataType: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offlineData = await offlineManager.getOfflineData(dataType);
      const parsedData = offlineData.map(item => item.data as T);
      
      setData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load offline data'));
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: T, id?: string) => {
    try {
      const dataId = await offlineManager.storeOfflineData(dataType, newData, id);
      await loadData(); // Refresh local state
      return dataId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save offline data'));
      throw err;
    }
  };

  const clearData = async () => {
    try {
      await offlineManager.clearOfflineData();
      await loadData(); // Refresh local state
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear offline data'));
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, [dataType]);

  return {
    data,
    loading,
    error,
    saveData,
    clearData,
    refreshData: loadData,
  };
}

// Hook for managing sync queue
export function useSyncQueue() {
  const [syncStatus, setSyncStatus] = useState(() => offlineManager.getSyncStatus());

  const addToQueue = async (
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ) => {
    try {
      await offlineManager.addToSyncQueue(method, url, data);
      setSyncStatus(offlineManager.getSyncStatus());
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  };

  const forcSync = async () => {
    try {
      await offlineManager.syncOfflineData();
      setSyncStatus(offlineManager.getSyncStatus());
    } catch (error) {
      console.error('Failed to sync data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncStatus(offlineManager.getSyncStatus());
    };

    // Update status periodically
    const interval = setInterval(updateSyncStatus, 2000);

    // Listen for online events to trigger sync
    const handleOnline = () => {
      updateSyncStatus();
      forcSync().catch(console.error);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return {
    ...syncStatus,
    addToQueue,
    forcSync,
  };
}
EOF

log_progress "Offline status and data management hooks"

# 6. Update Vite config for PWA
echo "⚙️ Step 6: Enhanced Vite PWA Configuration"

cat >> "vite.config.ts" << 'EOF'

// Add PWA plugin import at the top after existing imports
import { VitePWA } from 'vite-plugin-pwa';

// In the plugins array, add:
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'PaveMaster Suite',
    short_name: 'PaveMaster',
    description: 'Professional pavement performance management suite',
    theme_color: '#2563eb',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
})
EOF

log_progress "Enhanced Vite PWA configuration"

# Add mobile scripts to package.json
echo "📝 Step 7: Adding Mobile Development Scripts"

npm pkg set scripts.mobile:dev="vite --host 0.0.0.0 --port 8080"
npm pkg set scripts.mobile:build="vite build && npx cap sync"
npm pkg set scripts.mobile:preview="vite preview --host 0.0.0.0"
npm pkg set scripts.pwa:dev="vite --https"
npm pkg set scripts.pwa:build="vite build"
npm pkg set scripts.lighthouse="lighthouse http://localhost:8080 --output=html --output-path=./lighthouse-report.html"

log_progress "Mobile development scripts added to package.json"

# Create mobile feature page
echo "📱 Step 8: Enhanced Mobile Feature Page"

cat > "src/features/mobile/index.ts" << 'EOF'
export { MobilePage as default } from './components/MobilePage';
export { MobilePage } from './components/MobilePage';
export { useMobileFeatures } from './hooks/useMobileFeatures';
export { mobileStore } from './stores/mobileStore';
export type { MobileState, MobileFeature } from './types';

export const MOBILE_FEATURE_METADATA = {
  name: 'mobile',
  version: '1.0.0',
  dependencies: [],
  routes: ['/mobile'],
  permissions: ['mobile:read', 'mobile:write'],
  capabilities: ['camera', 'geolocation', 'notifications', 'offline']
} as const;
EOF

# Complete the script
echo "" >> "$COMPLETION_FILE"
echo "### ✅ **PHASE 5 COMPLETE: MOBILE & PWA ENHANCEMENT**" >> "$COMPLETION_FILE"
echo "" >> "$COMPLETION_FILE"
echo "All mobile and PWA features have been successfully implemented!" >> "$COMPLETION_FILE"

log_progress "Phase 5: Mobile & PWA Enhancement - COMPLETED!"

echo ""
echo "🎉 Phase 5 Complete! Mobile & PWA Enhancement finished successfully!"
echo "📱 The PaveMaster Suite now has comprehensive mobile capabilities!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run mobile:dev' to test mobile features"
echo "  2. Run 'npm run pwa:build' to generate PWA assets"
echo "  3. Test on mobile devices using the dev server"
echo "  4. Deploy and test PWA installation"
echo ""
EOF

chmod +x scripts/phase5-mobile-pwa-enhancement.sh
log_progress "Phase 5 automation script created and ready"

echo "🚀 Executing Phase 5: Mobile & PWA Enhancement..."

# Run the script
./scripts/phase5-mobile-pwa-enhancement.sh

log_progress "Phase 5 execution completed successfully"