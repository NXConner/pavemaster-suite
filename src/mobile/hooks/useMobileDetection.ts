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
  pixelRatio: number;
  isHighResolution: boolean;
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
        pixelRatio: 1,
        isHighResolution: false,
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
    const pixelRatio = window.devicePixelRatio || 1;
    const isHighResolution = pixelRatio > 1.5;

    // Screen size based detection
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;

    // User agent based detection for more accuracy
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|Android(?=.*\bTablet\b)/i;
    const iPhoneRegex = /iPhone/i;
    const iPadRegex = /iPad/i;
    
    const isUserAgentMobile = (mobileRegex.test(userAgent) && !tabletRegex.test(userAgent)) || iPhoneRegex.test(userAgent);
    const isUserAgentTablet = tabletRegex.test(userAgent) || iPadRegex.test(userAgent);

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
      pixelRatio,
      isHighResolution,
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

    // Also listen for devicePixelRatio changes (rare but possible)
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addListener(handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQuery.removeListener(handleResize);
    };
  }, []);

  return detection;
}

// Hook for responsive breakpoints
export function useResponsiveBreakpoint() {
  const { screenWidth, deviceType } = useMobileDetection();

  return {
    xs: screenWidth < 480,      // Extra small phones
    sm: screenWidth >= 480 && screenWidth < 768,   // Small phones
    md: screenWidth >= 768 && screenWidth < 1024,  // Tablets
    lg: screenWidth >= 1024 && screenWidth < 1280, // Small laptops
    xl: screenWidth >= 1280 && screenWidth < 1536, // Laptops
    '2xl': screenWidth >= 1536, // Large desktops
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    screenWidth,
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
    isLongPress: false,
    tapCount: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;
    let startScale = 1;
    let longPressTimer: NodeJS.Timeout | null = null;
    let lastTapTime = 0;
    let tapTimeout: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - swipe and tap detection
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        
        // Long press detection
        longPressTimer = setTimeout(() => {
          setGestureState(prev => ({ ...prev, isLongPress: true }));
          // Provide haptic feedback for long press
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, 500);

      } else if (e.touches.length === 2) {
        // Multi-touch - pinch detection
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        startDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setGestureState(prev => ({ ...prev, isPinching: true }));
        
        // Clear long press timer for multi-touch
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

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
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (e.changedTouches.length === 1 && !gestureState.isPinching && !gestureState.isLongPress) {
        // Swipe and tap detection
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        const maxTapDistance = 10;

        // Check if it's a swipe or tap
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < maxTapDistance) {
          // It's a tap - check for double tap
          const currentTime = Date.now();
          const timeDifference = currentTime - lastTapTime;
          
          if (timeDifference < 300) {
            // Double tap detected
            setGestureState(prev => ({ ...prev, tapCount: 2 }));
            if (tapTimeout) clearTimeout(tapTimeout);
          } else {
            // Single tap
            setGestureState(prev => ({ ...prev, tapCount: 1 }));
            // Wait to see if there's a second tap
            tapTimeout = setTimeout(() => {
              setGestureState(prev => ({ ...prev, tapCount: 0 }));
            }, 300);
          }
          
          lastTapTime = currentTime;
          
        } else if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
          // It's a swipe
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
        }

        // Reset gesture state after a short delay
        setTimeout(() => {
          setGestureState(prev => ({
            ...prev,
            isSwipeLeft: false,
            isSwipeRight: false,
            isSwipeUp: false,
            isSwipeDown: false,
            isLongPress: false,
            tapCount: 0,
          }));
        }, 100);
      }

      if (e.touches.length < 2) {
        setGestureState(prev => ({ ...prev, isPinching: false }));
        startScale = gestureState.scale;
      }
    };

    // Prevent default touch behaviors that might interfere
    const handleTouchCancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (tapTimeout) {
        clearTimeout(tapTimeout);
        tapTimeout = null;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      if (tapTimeout) clearTimeout(tapTimeout);
      
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [elementRef, gestureState.isPinching, gestureState.scale, gestureState.isLongPress]);

  return gestureState;
}

// Hook for safe area support (for devices with notches)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      if ('CSS' in window && 'supports' in window.CSS) {
        const root = document.documentElement;
        
        // Check if safe-area-inset is supported
        if (window.CSS.supports('padding-top: env(safe-area-inset-top)')) {
          const computedStyle = getComputedStyle(root);
          
          setSafeArea({
            top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
            right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
            bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
            left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
          });
        }
      }
    };

    // Set CSS custom properties for safe area
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }
    `;
    document.head.appendChild(style);

    updateSafeArea();

    // Listen for orientation changes that might affect safe area
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
      document.head.removeChild(style);
    };
  }, []);

  return safeArea;
}

// Hook for viewport height that accounts for mobile browser bars
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    const updateHeight = () => {
      // Use visual viewport if available (better for mobile)
      if ('visualViewport' in window) {
        setViewportHeight(window.visualViewport!.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    updateHeight();

    // Listen for changes
    if ('visualViewport' in window) {
      window.visualViewport!.addEventListener('resize', updateHeight);
      return () => window.visualViewport!.removeEventListener('resize', updateHeight);
    } else {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  return viewportHeight;
}