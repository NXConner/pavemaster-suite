import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  isOnline: boolean;
  isStandalone: boolean;
  hasCamera: boolean;
  hasGeolocation: boolean;
  canVibrate: boolean;
  platform: string;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => { mql.removeEventListener('change', onChange); };
  }, []);

  return !!isMobile;
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    orientation: 'landscape',
    screenSize: { width: 0, height: 0 },
    devicePixelRatio: 1,
    isOnline: true,
    isStandalone: false,
    hasCamera: false,
    hasGeolocation: false,
    canVibrate: false,
    platform: 'unknown'
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isDesktop = width >= TABLET_BREAKPOINT;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Check for standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;

      // Check device capabilities
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
      const hasGeolocation = 'geolocation' in navigator;
      const canVibrate = 'vibrate' in navigator;

      // Detect platform
      const userAgent = navigator.userAgent.toLowerCase();
      let platform = 'unknown';
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        platform = 'ios';
      } else if (userAgent.includes('android')) {
        platform = 'android';
      } else if (userAgent.includes('windows')) {
        platform = 'windows';
      } else if (userAgent.includes('macintosh')) {
        platform = 'macos';
      } else if (userAgent.includes('linux')) {
        platform = 'linux';
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        orientation,
        screenSize: { width, height },
        devicePixelRatio: window.devicePixelRatio || 1,
        isOnline: navigator.onLine,
        isStandalone,
        hasCamera,
        hasGeolocation,
        canVibrate,
        platform
      });
    };

    // Initial check
    updateDeviceInfo();

    // Listen for resize events
    const resizeHandler = () => updateDeviceInfo();
    window.addEventListener('resize', resizeHandler);

    // Listen for orientation changes
    const orientationHandler = () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };
    window.addEventListener('orientationchange', orientationHandler);

    // Listen for online/offline status
    const onlineHandler = () => updateDeviceInfo();
    const offlineHandler = () => updateDeviceInfo();
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('orientationchange', orientationHandler);
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  return deviceInfo;
}

export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateOrientation, 100);
    });

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

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

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useViewportHeight() {
  const [vh, setVh] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const updateVh = () => {
      setVh(window.innerHeight);
      // Update CSS custom property for mobile viewport height
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    updateVh();
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateVh, 100);
    });

    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, []);

  return vh;
}

// Hook for detecting safe area insets (iPhone X+)
export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0
      });
    };

    updateSafeArea();
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSafeArea, 100);
    });

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}
