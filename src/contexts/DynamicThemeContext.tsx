import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themes, ThemeConfig, CustomBrandConfig } from '../lib/theme-manager';
import { applyISACTheme } from '../config/themes';

interface DynamicThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  autoMode: boolean;
  setAutoMode: (enabled: boolean) => void;
  timeBasedTheme: boolean;
  setTimeBasedTheme: (enabled: boolean) => void;
  customBrand?: CustomBrandConfig;
  setCustomBrand: (brand?: CustomBrandConfig) => void;
  previewTheme: (themeId: string) => void;
  stopPreview: () => void;
  isPreviewMode: boolean;
  adaptiveContrast: boolean;
  setAdaptiveContrast: (enabled: boolean) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  themeHistory: string[];
  undoTheme: () => void;
  redoTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

interface DynamicThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  enableAutoAdaptation?: boolean;
}

export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({
  children,
  defaultTheme = 'isac-os',
  enableAutoAdaptation = true,
}) => {
  const [currentThemeId, setCurrentThemeId] = useState(defaultTheme);
  const [autoMode, setAutoMode] = useState(enableAutoAdaptation);
  const [timeBasedTheme, setTimeBasedTheme] = useState(true);
  const [customBrand, setCustomBrand] = useState<CustomBrandConfig>();
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [adaptiveContrast, setAdaptiveContrast] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [themeHistory, setThemeHistory] = useState<string[]>([defaultTheme]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Get current theme configuration
  const currentTheme = previewThemeId
    ? themes[previewThemeId] || themes[currentThemeId]
    : themes[currentThemeId];

  // Auto-detect system theme preference
  const detectSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Get time-based theme
  const getTimeBasedTheme = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return 'default'; // Light theme for day
    } else if (hour >= 18 && hour < 22) {
      return 'sunset'; // Warm theme for evening
    }
      return 'midnight'; // Dark theme for night
  }, []);

  // Detect ambient light (if available)
  const detectAmbientLight = useCallback(async () => {
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          const lux = sensor.illuminance;
          if (adaptiveContrast) {
            if (lux < 10) {
              // Very dark environment - switch to high contrast dark
              setTheme('highContrastDark');
            } else if (lux > 1000) {
              // Very bright environment - switch to high contrast light
              setTheme('highContrastLight');
            }
          }
        });
        sensor.start();
        return sensor;
      } catch (error) {
        console.log('Ambient light sensor not available:', error);
      }
    }
  }, [adaptiveContrast]);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: ThemeConfig) => {
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply fonts
    if (theme.fonts) {
      root.style.setProperty('--font-sans', theme.fonts.sans.join(', '));
      root.style.setProperty('--font-serif', theme.fonts.serif.join(', '));
      root.style.setProperty('--font-mono', theme.fonts.mono.join(', '));
      root.style.setProperty('--font-display', theme.fonts.display.join(', '));
    }

    // Apply animations if not in performance mode
    if (!performanceMode && theme.animations) {
      root.style.setProperty('--duration-fast', theme.animations.duration.fast);
      root.style.setProperty('--duration-normal', theme.animations.duration.normal);
      root.style.setProperty('--duration-slow', theme.animations.duration.slow);
      root.style.setProperty('--easing-smooth', theme.animations.easing.smooth);
    } else {
      // Disable animations in performance mode
      root.style.setProperty('--duration-fast', '0ms');
      root.style.setProperty('--duration-normal', '0ms');
      root.style.setProperty('--duration-slow', '0ms');
    }

    // Apply effects
    if (theme.effects) {
      document.body.classList.toggle('blur-effects', theme.effects.blur);
      document.body.classList.toggle('shadow-effects', theme.effects.shadows);
      document.body.classList.toggle('glassmorphism', theme.effects.glassmorphism);
    }

    // Apply custom brand if available
    if (customBrand) {
      root.style.setProperty('--brand-primary', customBrand.primaryColor);
      root.style.setProperty('--brand-secondary', customBrand.secondaryColor);
      root.style.setProperty('--brand-accent', customBrand.accentColor);
      root.style.setProperty('--brand-font-primary', customBrand.fonts.primary);
      root.style.setProperty('--brand-font-secondary', customBrand.fonts.secondary);

      if (customBrand.customCss) {
        let styleElement = document.getElementById('custom-brand-styles');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'custom-brand-styles';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = customBrand.customCss;
      }
    }

    // Save to localStorage
    localStorage.setItem('theme-preference', theme.id);
    localStorage.setItem('auto-mode', autoMode.toString());
    localStorage.setItem('time-based-theme', timeBasedTheme.toString());
  }, [customBrand, performanceMode, autoMode, timeBasedTheme]);

  // Set theme with history tracking
  const setTheme = useCallback((themeId: string) => {
    if (themeId !== currentThemeId && themes[themeId]) {
      // Add to history
      const newHistory = themeHistory.slice(0, historyIndex + 1);
      newHistory.push(themeId);
      setThemeHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setCurrentThemeId(themeId);
      setPreviewThemeId(null);
    }
  }, [currentThemeId, themeHistory, historyIndex]);

  // Preview theme without applying permanently
  const previewTheme = useCallback((themeId: string) => {
    if (themes[themeId]) {
      setPreviewThemeId(themeId);
    }
  }, []);

  // Stop preview mode
  const stopPreview = useCallback(() => {
    setPreviewThemeId(null);
  }, []);

  // Undo theme change
  const undoTheme = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentThemeId(themeHistory[historyIndex - 1]);
    }
  }, [historyIndex, themeHistory]);

  // Redo theme change
  const redoTheme = useCallback(() => {
    if (historyIndex < themeHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentThemeId(themeHistory[historyIndex + 1]);
    }
  }, [historyIndex, themeHistory]);

  // Auto theme adaptation
  useEffect(() => {
    if (!autoMode) { return; }

    let selectedTheme = currentThemeId;

    if (timeBasedTheme) {
      selectedTheme = getTimeBasedTheme();
    } else {
      const systemTheme = detectSystemTheme();
      selectedTheme = systemTheme === 'dark' ? 'midnight' : 'default';
    }

    if (selectedTheme !== currentThemeId && themes[selectedTheme]) {
      setCurrentThemeId(selectedTheme);
    }
  }, [autoMode, timeBasedTheme, currentThemeId, getTimeBasedTheme, detectSystemTheme]);

  // System theme change listener
  useEffect(() => {
    if (!autoMode || timeBasedTheme) { return; }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'midnight' : 'default';
      if (themes[newTheme]) {
        setCurrentThemeId(newTheme);
      }
    };

    mediaQuery.addListener(handleChange);
    return () => { mediaQuery.removeListener(handleChange); };
  }, [autoMode, timeBasedTheme]);

  // Time-based theme updates
  useEffect(() => {
    if (!autoMode || !timeBasedTheme) { return; }

    const interval = setInterval(() => {
      const newTheme = getTimeBasedTheme();
      if (newTheme !== currentThemeId && themes[newTheme]) {
        setCurrentThemeId(newTheme);
      }
    }, 60000); // Check every minute

    return () => { clearInterval(interval); };
  }, [autoMode, timeBasedTheme, currentThemeId, getTimeBasedTheme]);

  // Ambient light sensor setup
  useEffect(() => {
    let sensor: any;

    if (adaptiveContrast) {
      detectAmbientLight().then(s => {
        sensor = s;
      });
    }

    return () => {
      if (sensor) {
        sensor.stop();
      }
    };
  }, [adaptiveContrast, detectAmbientLight]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    const savedAutoMode = localStorage.getItem('auto-mode') === 'true';
    const savedTimeBasedTheme = localStorage.getItem('time-based-theme') === 'true';

    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme);
    }
    setAutoMode(savedAutoMode);
    setTimeBasedTheme(savedTimeBasedTheme);
  }, []);

  const contextValue: DynamicThemeContextType = {
    currentTheme,
    setTheme,
    autoMode,
    setAutoMode,
    timeBasedTheme,
    setTimeBasedTheme,
    customBrand,
    setCustomBrand,
    previewTheme,
    stopPreview,
    isPreviewMode: previewThemeId !== null,
    adaptiveContrast,
    setAdaptiveContrast,
    performanceMode,
    setPerformanceMode,
    themeHistory,
    undoTheme,
    redoTheme,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < themeHistory.length - 1,
  };

  return (
    <DynamicThemeContext.Provider value={contextValue}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

export const useDynamicTheme = () => {
  const context = useContext(DynamicThemeContext);
  if (context === undefined) {
    throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
  }
  return context;
};