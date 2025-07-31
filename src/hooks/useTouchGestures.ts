// PHASE 10: Advanced Touch Gesture Hook
// Comprehensive touch interaction system for mobile optimization
import { useEffect, useRef, useState, useCallback } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: number;
}

export interface GestureState {
  isActive: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  endPoint: TouchPoint | null;
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  duration: number;
}

export interface PinchState {
  isActive: boolean;
  scale: number;
  initialDistance: number;
  currentDistance: number;
  center: { x: number; y: number };
}

export interface SwipeConfig {
  threshold: number;
  velocityThreshold: number;
  timeThreshold: number;
  directional: boolean;
  preventDefault: boolean;
}

export interface PinchConfig {
  threshold: number;
  minScale: number;
  maxScale: number;
  preventDefault: boolean;
}

export interface TouchGestureCallbacks {
  onSwipeLeft?: (gesture: GestureState) => void;
  onSwipeRight?: (gesture: GestureState) => void;
  onSwipeUp?: (gesture: GestureState) => void;
  onSwipeDown?: (gesture: GestureState) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinchStart?: (pinch: PinchState) => void;
  onPinchMove?: (pinch: PinchState) => void;
  onPinchEnd?: (pinch: PinchState) => void;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
  onRotate?: (angle: number) => void;
}

const DEFAULT_SWIPE_CONFIG: SwipeConfig = {
  threshold: 50,
  velocityThreshold: 0.3,
  timeThreshold: 500,
  directional: true,
  preventDefault: true
};

const DEFAULT_PINCH_CONFIG: PinchConfig = {
  threshold: 10,
  minScale: 0.5,
  maxScale: 3,
  preventDefault: true
};

export const useTouchGestures = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: TouchGestureCallbacks = {},
  swipeConfig: Partial<SwipeConfig> = {},
  pinchConfig: Partial<PinchConfig> = {}
) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    endPoint: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    velocity: 0,
    direction: null,
    duration: 0
  });

  const [pinchState, setPinchState] = useState<PinchState>({
    isActive: false,
    scale: 1,
    initialDistance: 0,
    currentDistance: 0,
    center: { x: 0, y: 0 }
  });

  const swipeConfigRef = useRef({ ...DEFAULT_SWIPE_CONFIG, ...swipeConfig });
  const pinchConfigRef = useRef({ ...DEFAULT_PINCH_CONFIG, ...pinchConfig });
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const velocityTrackerRef = useRef<TouchPoint[]>([]);

  // Update configs when props change
  useEffect(() => {
    swipeConfigRef.current = { ...DEFAULT_SWIPE_CONFIG, ...swipeConfig };
    pinchConfigRef.current = { ...DEFAULT_PINCH_CONFIG, ...pinchConfig };
  }, [swipeConfig, pinchConfig]);

  // Utility functions
  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
    identifier: touch.identifier
  });

  const calculateDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateVelocity = (points: TouchPoint[]): number => {
    if (points.length < 2) return 0;
    
    const recent = points.slice(-3); // Use last 3 points for smoother velocity
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const distance = calculateDistance(first, last);
    const time = last.timestamp - first.timestamp;
    
    return time > 0 ? distance / time : 0;
  };

  const getDirection = (start: TouchPoint, end: TouchPoint): 'left' | 'right' | 'up' | 'down' | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  const calculatePinchDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    return calculateDistance(touch1, touch2);
  };

  const calculatePinchCenter = (touch1: TouchPoint, touch2: TouchPoint): { x: number; y: number } => {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2
    };
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const updateVelocityTracker = (point: TouchPoint) => {
    velocityTrackerRef.current.push(point);
    // Keep only last 5 points for velocity calculation
    if (velocityTrackerRef.current.length > 5) {
      velocityTrackerRef.current.shift();
    }
  };

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.touches).map(getTouchPoint);
    
    // Update touches map
    touches.forEach(touch => {
      touchesRef.current.set(touch.identifier, touch);
    });

    if (touches.length === 1) {
      // Single touch - start gesture tracking
      const touch = touches[0];
      
      setGestureState(prev => ({
        ...prev,
        isActive: true,
        startPoint: touch,
        currentPoint: touch,
        endPoint: null,
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        velocity: 0,
        direction: null,
        duration: 0
      }));

      // Reset velocity tracker
      velocityTrackerRef.current = [touch];
      
      // Handle tap counting for double tap
      const now = touch.timestamp;
      if (now - lastTapTimeRef.current < 300) {
        tapCountRef.current++;
      } else {
        tapCountRef.current = 1;
      }
      lastTapTimeRef.current = now;

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (callbacks.onLongPress) {
          callbacks.onLongPress(touch);
        }
      }, 500);

      if (callbacks.onTouchStart) {
        callbacks.onTouchStart(touch);
      }

    } else if (touches.length === 2) {
      // Two touches - start pinch
      clearLongPressTimer();
      
      const [touch1, touch2] = touches;
      const distance = calculatePinchDistance(touch1, touch2);
      const center = calculatePinchCenter(touch1, touch2);
      
      setPinchState({
        isActive: true,
        scale: 1,
        initialDistance: distance,
        currentDistance: distance,
        center
      });

      if (callbacks.onPinchStart) {
        callbacks.onPinchStart({
          isActive: true,
          scale: 1,
          initialDistance: distance,
          currentDistance: distance,
          center
        });
      }
    }

    if (swipeConfigRef.current.preventDefault || pinchConfigRef.current.preventDefault) {
      event.preventDefault();
    }
  }, [callbacks]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.touches).map(getTouchPoint);
    
    if (touches.length === 1 && gestureState.isActive) {
      // Single touch movement
      const touch = touches[0];
      const { startPoint } = gestureState;
      
      if (startPoint) {
        const deltaX = touch.x - startPoint.x;
        const deltaY = touch.y - startPoint.y;
        const distance = calculateDistance(startPoint, touch);
        const duration = touch.timestamp - startPoint.timestamp;
        
        updateVelocityTracker(touch);
        const velocity = calculateVelocity(velocityTrackerRef.current);
        
        setGestureState(prev => ({
          ...prev,
          currentPoint: touch,
          deltaX,
          deltaY,
          distance,
          velocity,
          duration
        }));

        // Cancel long press if moved too much
        if (distance > 10) {
          clearLongPressTimer();
        }

        if (callbacks.onTouchMove) {
          callbacks.onTouchMove(touch);
        }
      }

    } else if (touches.length === 2 && pinchState.isActive) {
      // Two touch pinch/zoom
      const [touch1, touch2] = touches;
      const distance = calculatePinchDistance(touch1, touch2);
      const center = calculatePinchCenter(touch1, touch2);
      const scale = distance / pinchState.initialDistance;
      
      // Clamp scale to min/max values
      const clampedScale = Math.max(
        pinchConfigRef.current.minScale,
        Math.min(pinchConfigRef.current.maxScale, scale)
      );
      
      setPinchState(prev => ({
        ...prev,
        currentDistance: distance,
        scale: clampedScale,
        center
      }));

      if (callbacks.onPinchMove) {
        callbacks.onPinchMove({
          isActive: true,
          scale: clampedScale,
          initialDistance: pinchState.initialDistance,
          currentDistance: distance,
          center
        });
      }
    }

    if (swipeConfigRef.current.preventDefault || pinchConfigRef.current.preventDefault) {
      event.preventDefault();
    }
  }, [gestureState, pinchState, callbacks]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const remainingTouches = Array.from(event.touches);
    
    // Remove ended touches from map
    const allTouchIds = new Set(remainingTouches.map(t => t.identifier));
    for (const [id] of touchesRef.current) {
      if (!allTouchIds.has(id)) {
        touchesRef.current.delete(id);
      }
    }

    if (remainingTouches.length === 0) {
      // All touches ended
      clearLongPressTimer();
      
      if (gestureState.isActive && gestureState.startPoint && gestureState.currentPoint) {
        const { startPoint, currentPoint } = gestureState;
        const distance = calculateDistance(startPoint, currentPoint);
        const velocity = calculateVelocity(velocityTrackerRef.current);
        const duration = currentPoint.timestamp - startPoint.timestamp;
        const direction = getDirection(startPoint, currentPoint);
        
        const finalState: GestureState = {
          ...gestureState,
          endPoint: currentPoint,
          distance,
          velocity,
          direction,
          duration,
          isActive: false
        };
        
        setGestureState(finalState);

        // Check for swipe gestures
        const config = swipeConfigRef.current;
        if (distance >= config.threshold && 
            velocity >= config.velocityThreshold && 
            duration <= config.timeThreshold) {
          
          switch (direction) {
            case 'left':
              if (callbacks.onSwipeLeft) callbacks.onSwipeLeft(finalState);
              break;
            case 'right':
              if (callbacks.onSwipeRight) callbacks.onSwipeRight(finalState);
              break;
            case 'up':
              if (callbacks.onSwipeUp) callbacks.onSwipeUp(finalState);
              break;
            case 'down':
              if (callbacks.onSwipeDown) callbacks.onSwipeDown(finalState);
              break;
          }
        }
        
        // Check for tap gestures
        if (distance < 10 && duration < 300) {
          if (tapCountRef.current === 1) {
            // Single tap - delay to check for double tap
            setTimeout(() => {
              if (tapCountRef.current === 1 && callbacks.onTap) {
                callbacks.onTap(currentPoint);
              }
              tapCountRef.current = 0;
            }, 300);
          } else if (tapCountRef.current === 2 && callbacks.onDoubleTap) {
            callbacks.onDoubleTap(currentPoint);
            tapCountRef.current = 0;
          }
        }

        if (callbacks.onTouchEnd) {
          callbacks.onTouchEnd(currentPoint);
        }
      }

      // End pinch gesture
      if (pinchState.isActive) {
        setPinchState(prev => ({ ...prev, isActive: false }));
        
        if (callbacks.onPinchEnd) {
          callbacks.onPinchEnd(pinchState);
        }
      }

    } else if (remainingTouches.length === 1 && pinchState.isActive) {
      // Transition from pinch to single touch
      setPinchState(prev => ({ ...prev, isActive: false }));
      
      if (callbacks.onPinchEnd) {
        callbacks.onPinchEnd(pinchState);
      }
    }

    if (swipeConfigRef.current.preventDefault || pinchConfigRef.current.preventDefault) {
      event.preventDefault();
    }
  }, [gestureState, pinchState, callbacks]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive: false for preventDefault to work
    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
      velocityTrackerRef.current = [];
      touchesRef.current.clear();
    };
  }, []);

  return {
    gestureState,
    pinchState,
    isGestureActive: gestureState.isActive,
    isPinchActive: pinchState.isActive,
    touchCount: touchesRef.current.size
  };
};

// PHASE 10: Touch optimization utilities
export const useTouchOptimization = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pixelRatio, setPixelRatio] = useState(1);

  useEffect(() => {
    // Detect touch support
    const hasTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 || 
                    (navigator as any).msMaxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    // Get initial values
    setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    setPixelRatio(window.devicePixelRatio || 1);

    // Setup listeners
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    const handleOrientationChange = () => {
      // Delay to get accurate dimensions after orientation change
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const getTouchTargetSize = (baseSize: number) => {
    // Apple recommends 44px minimum, Android recommends 48dp
    const minSize = isTouchDevice ? 44 : baseSize;
    return Math.max(minSize, baseSize);
  };

  const getOptimalFontSize = (baseSize: number) => {
    // Scale font size based on device pixel ratio and screen size
    const scaleFactor = Math.min(screenSize.width / 375, 1.2); // Use iPhone 6 as base
    return Math.max(12, baseSize * scaleFactor);
  };

  const isSmallScreen = screenSize.width < 768;
  const isMediumScreen = screenSize.width >= 768 && screenSize.width < 1024;
  const isLargeScreen = screenSize.width >= 1024;

  return {
    isTouchDevice,
    screenSize,
    orientation,
    pixelRatio,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    getTouchTargetSize,
    getOptimalFontSize
  };
};

export default useTouchGestures;