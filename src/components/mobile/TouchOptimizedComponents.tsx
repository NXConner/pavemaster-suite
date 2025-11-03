import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Smartphone,
  Hand,
  Navigation,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  Battery,
} from 'lucide-react';

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  target: HTMLElement;
}

interface HapticFeedback {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  duration?: number;
}

// Touch-optimized button with haptic feedback
const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  haptic?: HapticFeedback['type'];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
}> = ({ children, onClick, haptic = 'light', size = 'md', variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const triggerHaptic = useCallback((type: HapticFeedback['type']) => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [30],
        heavy: [50],
        success: [10, 20, 10],
        warning: [30, 10, 30],
        error: [50, 20, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = () => {
    setIsPressed(true);
    triggerHaptic(haptic);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    onClick?.();
  };

  const sizeClasses = {
    sm: 'h-10 px-3 text-sm min-w-[44px]',
    md: 'h-12 px-4 text-base min-w-[48px]',
    lg: 'h-14 px-6 text-lg min-w-[56px]',
    xl: 'h-16 px-8 text-xl min-w-[64px]',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground active:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground active:bg-secondary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/90',
    destructive: 'bg-destructive text-destructive-foreground active:bg-destructive/90',
  };

  return (
    <button
      className={`
        relative rounded-lg font-medium transition-all duration-200 
        select-none touch-manipulation hover:scale-105 active:scale-95
        ${sizeClasses[size]} ${variantClasses[variant]}
        ${isPressed ? 'shadow-inner' : 'shadow-lg'}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => { setIsPressed(true); }}
      onMouseUp={() => { setIsPressed(false); }}
      onMouseLeave={() => { setIsPressed(false); }}
    >
      {children}
    </button>
  );
};

// Swipeable card component
const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}> = ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setIsDragging(true);
      startPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) {
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;
      setPosition({ x: deltaX, y: deltaY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;

    if (Math.abs(position.x) > threshold) {
      if (position.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (Math.abs(position.y) > threshold) {
      if (position.y > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
      }}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <Card className="select-none">
        {children}
      </Card>
    </div>
  );
};

// Touch-optimized data table
const MobileDataTable: React.FC<{
  data: any[];
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[];
  onRowSelect?: (row: any) => void;
}> = ({ data, columns, onRowSelect }) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const handleRowPress = (index: number, row: any) => {
    setSelectedRow(index);
    onRowSelect?.(row);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }
  };

  return (
    <div className="space-y-2">
      {data.map((row, index) => (
        <div
          key={index}
          className={`
            p-4 rounded-lg border cursor-pointer min-h-[56px] transition-all active:scale-98
            ${selectedRow === index ? 'bg-primary/10 border-primary' : 'bg-card'}
          `}
          onTouchEnd={() => { handleRowPress(index, row); }}
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            animation: `fadeInUp 0.3s ease forwards ${index * 0.05}s`,
          }}
        >
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {column.label}
                </span>
                <span className="text-sm font-semibold">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Gesture recognition hook
const useGestureRecognition = () => {
  const [gestures, setGestures] = useState<TouchGesture[]>([]);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Long press detection
    longPressTimeoutRef.current = setTimeout(() => {
      const gesture: TouchGesture = {
        type: 'long-press',
        duration: 500,
        target: event.target as HTMLElement,
      };
      setGestures(prev => [...prev, gesture]);

      // Haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate([30]);
      }
    }, 500);
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) { return; }

    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 10 && deltaTime < 300) {
      // Tap gesture
      const gesture: TouchGesture = {
        type: 'tap',
        duration: deltaTime,
        target: event.target as HTMLElement,
      };
      setGestures(prev => [...prev, gesture]);
    } else if (distance > 50) {
      // Swipe gesture
      const direction = Math.abs(deltaX) > Math.abs(deltaY)
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up');

      const gesture: TouchGesture = {
        type: 'swipe',
        direction,
        distance,
        duration: deltaTime,
        target: event.target as HTMLElement,
      };
      setGestures(prev => [...prev, gesture]);
    }

    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { gestures, clearGestures: () => { setGestures([]); } };
};

// Mobile navigation with gestures
const MobileNavigation: React.FC<{
  items: { id: string; label: string; icon: React.ReactNode; href?: string }[];
  activeItem?: string;
  onItemSelect?: (id: string) => void;
}> = ({ items, activeItem, onItemSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 animate-in slide-in-from-bottom"
      style={{ animation: 'slideUp 0.3s ease' }}
    >
      {/* Main navigation bar */}
      <div className="flex items-center justify-around px-4 py-2 min-h-[60px]">
        {items.slice(0, 4).map((item) => (
          <TouchButton
            key={item.id}
            onClick={() => onItemSelect?.(item.id)}
            variant={activeItem === item.id ? 'primary' : 'ghost'}
            size="md"
            haptic="light"
          >
            <div className="flex flex-col items-center space-y-1">
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </div>
          </TouchButton>
        ))}

        {items.length > 4 && (
          <TouchButton
            onClick={() => { setIsExpanded(!isExpanded); }}
            variant="ghost"
            size="md"
            haptic="medium"
          >
            <div className="flex flex-col items-center space-y-1">
              <Navigation className="h-5 w-5" />
              <span className="text-xs">More</span>
            </div>
          </TouchButton>
        )}
      </div>

      {/* Expanded menu */}
      {isExpanded && items.length > 4 && (
        <div
          className="bg-card border-t p-4 transition-all"
          style={{
            maxHeight: isExpanded ? '400px' : '0',
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {items.slice(4).map((item) => (
              <TouchButton
                key={item.id}
                onClick={() => {
                  onItemSelect?.(item.id);
                  setIsExpanded(false);
                }}
                variant={activeItem === item.id ? 'primary' : 'ghost'}
                size="lg"
                haptic="light"
              >
                <div className="flex flex-col items-center space-y-2">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              </TouchButton>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Mobile form with touch optimization
const TouchOptimizedForm: React.FC<{
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'switch' | 'slider';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
  }[];
  onSubmit?: (data: Record<string, any>) => void;
}> = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = () => {
    onSubmit?.(formData);

    // Success haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {fields.map((field, idx) => (
        <div
          key={field.id}
          className="space-y-2"
          style={{
            opacity: 0,
            animation: `fadeIn 0.3s ease forwards ${idx * 0.1}s`,
          }}
        >
          <Label htmlFor={field.id} className="text-base font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'number' ? (
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData(prev => ({ ...prev, [field.id]: e.target.value })); }}
              className="h-12 text-base" // Larger touch target
              placeholder={field.label}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => { setFormData(prev => ({ ...prev, [field.id]: e.target.value })); }}
              className="w-full h-12 px-3 text-base border rounded-lg"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'switch' ? (
            <div className="flex items-center space-x-3">
              <Switch
                id={field.id}
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => { setFormData(prev => ({ ...prev, [field.id]: checked })); }}
              />
              <Label htmlFor={field.id} className="text-sm">
                {formData[field.id] ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          ) : field.type === 'slider' ? (
            <div className="space-y-2">
              <Slider
                value={[formData[field.id] || field.min || 0]}
                onValueChange={([value]) => { setFormData(prev => ({ ...prev, [field.id]: value })); }}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-center">
                {formData[field.id] || field.min || 0}
              </div>
            </div>
          ) : null}
        </div>
      ))}
      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>

      <TouchButton
        onClick={handleSubmit}
        variant="primary"
        size="xl"
        haptic="success"
      >
        Submit Form
      </TouchButton>
    </div>
  );
};

// Device status bar
const DeviceStatusBar: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    battery: 100,
    network: 'wifi',
    signal: 4,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setDeviceInfo(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }, 60000);

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setDeviceInfo(prev => ({
          ...prev,
          battery: Math.round(battery.level * 100),
        }));
      });
    }

    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setDeviceInfo(prev => ({
        ...prev,
        network: connection.type || 'wifi',
      }));
    }

    return () => { clearInterval(interval); };
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b text-sm">
      <div className="flex items-center space-x-2">
        <span className="font-medium">{deviceInfo.time}</span>
      </div>

      <div className="flex items-center space-x-2">
        {deviceInfo.network === 'wifi' ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}

        <div className="flex items-center space-x-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-3 rounded-full ${
                i < deviceInfo.signal ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-1">
          <Battery className="h-4 w-4" />
          <span>{deviceInfo.battery}%</span>
        </div>
      </div>
    </div>
  );
};

// Main touch-optimized showcase
const TouchOptimizedDemo: React.FC = () => {
  const { gestures, clearGestures } = useGestureRecognition();
  const [activeTab, setActiveTab] = useState('buttons');

  const sampleData = [
    { id: 1, name: 'Project Alpha', status: 'Active', progress: 75 },
    { id: 2, name: 'Project Beta', status: 'Pending', progress: 30 },
    { id: 3, name: 'Project Gamma', status: 'Complete', progress: 100 },
  ];

  const tableColumns = [
    { key: 'name', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress', render: (value: number) => `${value}%` },
  ];

  const formFields = [
    { id: 'name', label: 'Project Name', type: 'text' as const, required: true },
    { id: 'priority', label: 'Priority', type: 'select' as const, options: ['Low', 'Medium', 'High'] },
    { id: 'notifications', label: 'Enable Notifications', type: 'switch' as const },
    { id: 'budget', label: 'Budget', type: 'slider' as const, min: 1000, max: 100000, step: 1000 },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: <Smartphone className="h-5 w-5" /> },
    { id: 'projects', label: 'Projects', icon: <Navigation className="h-5 w-5" /> },
    { id: 'camera', label: 'Camera', icon: <Camera className="h-5 w-5" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-card">
      <DeviceStatusBar />

      <div className="pb-20"> {/* Space for bottom navigation */}
        <div className="p-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5" />
                Touch-Optimized Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Touch Buttons</h3>
                  <div className="flex flex-wrap gap-2">
                    <TouchButton haptic="light" size="sm">Light</TouchButton>
                    <TouchButton haptic="medium" size="md">Medium</TouchButton>
                    <TouchButton haptic="heavy" size="lg" variant="secondary">Heavy</TouchButton>
                    <TouchButton haptic="success" size="xl" variant="primary">Success</TouchButton>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Swipeable Cards</h3>
                  <SwipeableCard
                    onSwipeLeft={() => { console.log('Swiped left'); }}
                    onSwipeRight={() => { console.log('Swiped right'); }}
                  >
                    <CardContent className="p-4">
                      <p className="text-center">Swipe me in any direction!</p>
                    </CardContent>
                  </SwipeableCard>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Mobile Data Table</h3>
                  <MobileDataTable
                    data={sampleData}
                    columns={tableColumns}
                    onRowSelect={(row) => { console.log('Selected:', row); }}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Touch-Optimized Form</h3>
                  <TouchOptimizedForm
                    fields={formFields}
                    onSubmit={(data) => { console.log('Form data:', data); }}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Recent Gestures</h3>
                  <div className="space-y-2">
                    {gestures.slice(-5).map((gesture, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {gesture.type} {gesture.direction && `(${gesture.direction})`} - {gesture.duration}ms
                      </div>
                    ))}
                    <TouchButton onClick={clearGestures} size="sm" variant="ghost">
                      Clear Gestures
                    </TouchButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNavigation
        items={navItems}
        activeItem={activeTab}
        onItemSelect={setActiveTab}
      />
    </div>
  );
};

export {
  TouchButton,
  SwipeableCard,
  MobileDataTable,
  TouchOptimizedForm,
  MobileNavigation,
  DeviceStatusBar,
  TouchOptimizedDemo,
  useGestureRecognition,
};

export default TouchOptimizedDemo;