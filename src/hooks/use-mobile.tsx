// ============================================================================
// ENHANCED MOBILE DETECTION HOOKS - PaveMaster Suite
// ============================================================================

import * as React from "react";
// Device detection utilities moved inline

// Breakpoint constants
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

const MOBILE_BREAKPOINT = BREAKPOINTS.md;

// Enhanced mobile detection hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };
    
    // Set initial value
    onChange();
    
    // Listen for changes
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Enhanced device detection hook
export function useDevice() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    viewport: { width: 0, height: 0 },
    orientation: 'portrait' as 'portrait' | 'landscape',
    breakpoint: 'xs' as keyof typeof BREAKPOINTS
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const viewport = {
        width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      };
      const width = viewport.width;
      
      // Determine breakpoint
      let breakpoint: keyof typeof BREAKPOINTS = 'xs';
      if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
      else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
      else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
      else if (width >= BREAKPOINTS.md) breakpoint = 'md';
      else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';
      
      setDeviceInfo({
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent),
        isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        viewport,
        orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
        breakpoint
      });
    };

    // Initial update
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Responsive breakpoint hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS['2xl']) setBreakpoint('2xl');
      else if (width >= BREAKPOINTS.xl) setBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Media query hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    
    const onChange = () => setMatches(mql.matches);
    
    // Set initial value
    onChange();
    
    // Listen for changes
    mql.addEventListener('change', onChange);
    
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Viewport size hook
export function useViewportSize() {
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateViewport = () => {
      setViewport(device.getViewportSize());
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}

// Browser capabilities hook
export function useBrowserCapabilities() {
  const [capabilities, setCapabilities] = React.useState({
    supportsWebP: false,
    supportsWebGL: false,
    supportsServiceWorker: false,
    supportsNotifications: false,
    supportsGeolocation: false,
    isOnline: true
  });

  React.useEffect(() => {
    setCapabilities({
      supportsWebP: browser.supportsWebP(),
      supportsWebGL: browser.supportsWebGL(),
      supportsServiceWorker: browser.supportsServiceWorker(),
      supportsNotifications: browser.supportsNotifications(),
      supportsGeolocation: browser.supportsGeolocation(),
      isOnline: browser.isOnline()
    });

    const updateOnlineStatus = () => {
      setCapabilities(prev => ({ ...prev, isOnline: browser.isOnline() }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return capabilities;
}

// Touch device detection hook
export function useTouch() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
  }, []);

  return isTouch;
}

// Network information hook (if available)
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = React.useState({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  React.useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      }
    };

    updateNetworkInfo();

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
}

// Screen orientation hook
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<{
    angle: number;
    type: string;
    landscape: boolean;
    portrait: boolean;
  }>({
    angle: 0,
    type: 'portrait-primary',
    landscape: false,
    portrait: true
  });

  React.useEffect(() => {
    const updateOrientation = () => {
      const screen = window.screen as any;
      const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
      
      if (orientation) {
        setOrientation({
          angle: orientation.angle || 0,
          type: orientation.type || 'portrait-primary',
          landscape: orientation.type?.includes('landscape') || false,
          portrait: orientation.type?.includes('portrait') || true
        });
      } else {
        // Fallback based on viewport dimensions
        const { width, height } = device.getViewportSize();
        setOrientation({
          angle: width > height ? 90 : 0,
          type: width > height ? 'landscape-primary' : 'portrait-primary',
          landscape: width > height,
          portrait: height >= width
        });
      }
    };

    updateOrientation();

    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
}

// Performance monitoring hook
export function usePerformance() {
  const [performance, setPerformance] = React.useState({
    memory: null as { used: number; total: number; percentage: number } | null,
    connectionType: 'unknown',
    isSlowConnection: false
  });

  React.useEffect(() => {
    const updatePerformance = () => {
      const memoryUsage = (window.performance as any).memory ? {
        used: (window.performance as any).memory.usedJSHeapSize,
        total: (window.performance as any).memory.totalJSHeapSize,
        percentage: ((window.performance as any).memory.usedJSHeapSize / 
                    (window.performance as any).memory.totalJSHeapSize) * 100
      } : null;

      const connection = (navigator as any).connection;
      const connectionType = connection?.effectiveType || 'unknown';
      const isSlowConnection = ['slow-2g', '2g'].includes(connectionType);

      setPerformance({
        memory: memoryUsage,
        connectionType,
        isSlowConnection
      });
    };

    updatePerformance();

    // Update periodically
    const interval = setInterval(updatePerformance, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return performance;
}

// Visibility state hook
export function useVisibility() {
  const [isVisible, setIsVisible] = React.useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// Prefer reduced motion hook
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const onChange = () => setPrefersReducedMotion(mql.matches);
    
    onChange();
    mql.addEventListener('change', onChange);
    
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast preference hook
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-contrast: high)');
    
    const onChange = () => setPrefersHighContrast(mql.matches);
    
    onChange();
    mql.addEventListener('change', onChange);
    
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersHighContrast;
}

// Color scheme preference hook
export function usePrefersColorScheme() {
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark' | 'no-preference'>('no-preference');

  React.useEffect(() => {
    const darkMql = window.matchMedia('(prefers-color-scheme: dark)');
    const lightMql = window.matchMedia('(prefers-color-scheme: light)');
    
    const onChange = () => {
      if (darkMql.matches) setColorScheme('dark');
      else if (lightMql.matches) setColorScheme('light');
      else setColorScheme('no-preference');
    };
    
    onChange();
    
    darkMql.addEventListener('change', onChange);
    lightMql.addEventListener('change', onChange);
    
    return () => {
      darkMql.removeEventListener('change', onChange);
      lightMql.removeEventListener('change', onChange);
    };
  }, []);

  return colorScheme;
}

// Export all hooks
export default {
  useIsMobile,
  useDevice,
  useBreakpoint,
  useMediaQuery,
  useViewportSize,
  useBrowserCapabilities,
  useTouch,
  useNetworkInfo,
  useOrientation,
  usePerformance,
  useVisibility,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  usePrefersColorScheme
};