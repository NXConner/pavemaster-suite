import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  measurementUnit: 'metric' | 'imperial';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    categories: {
      projects: boolean;
      equipment: boolean;
      safety: boolean;
      finance: boolean;
      weather: boolean;
    };
  };
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: 'overview' | 'recent' | 'analytics';
    refreshInterval: number;
  };
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  lastSync: string | null;
  settings: {
    companyName: string;
    companyLogo?: string;
    businessHours: {
      start: string;
      end: string;
      workdays: number[];
    };
    location: {
      address: string;
      coordinates: [number, number] | null;
    };
    features: {
      gpsTracking: boolean;
      weatherIntegration: boolean;
      photoReports: boolean;
      voiceCommands: boolean;
      offlineMode: boolean;
    };
  };
  cache: {
    projects: any[];
    equipment: any[];
    team: any[];
    lastUpdated: Record<string, string>;
  };
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'SET_CACHE'; payload: { key: string; data: any[] } }
  | { type: 'SET_LAST_SYNC'; payload: string }
  | { type: 'RESET_APP' };

const initialState: AppState = {
  user: null,
  isLoading: false,
  isOnline: navigator.onLine,
  lastSync: null,
  settings: {
    companyName: 'PaveMaster Suite',
    businessHours: {
      start: '08:00',
      end: '17:00',
      workdays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    location: {
      address: '',
      coordinates: null
    },
    features: {
      gpsTracking: true,
      weatherIntegration: true,
      photoReports: true,
      voiceCommands: false,
      offlineMode: true
    }
  },
  cache: {
    projects: [],
    equipment: [],
    team: [],
    lastUpdated: {}
  }
};

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD',
  measurementUnit: 'imperial',
  notifications: {
    email: true,
    push: true,
    inApp: true,
    categories: {
      projects: true,
      equipment: true,
      safety: true,
      finance: true,
      weather: true
    }
  },
  dashboard: {
    layout: 'grid',
    defaultView: 'overview',
    refreshInterval: 300000 // 5 minutes
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...action.payload,
          preferences: { ...defaultPreferences, ...action.payload.preferences }
        }
      };
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        cache: initialState.cache
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ONLINE':
      return {
        ...state,
        isOnline: action.payload
      };
    
    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload
          }
        }
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    
    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload.data,
          lastUpdated: {
            ...state.cache.lastUpdated,
            [action.payload.key]: new Date().toISOString()
          }
        }
      };
    
    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload
      };
    
    case 'RESET_APP':
      return initialState;
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  actions: {
    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    updateSettings: (settings: Partial<AppState['settings']>) => void;
    setCache: (key: string, data: any[]) => void;
    syncData: () => Promise<void>;
    exportData: () => void;
    importData: (data: any) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true });
      toast({
        title: "Connection restored",
        description: "You're back online. Syncing data...",
      });
      actions.syncData();
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false });
      toast({
        title: "Connection lost",
        description: "You're now offline. Changes will sync when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Persist data when state changes
  useEffect(() => {
    persistData();
  }, [state.user, state.settings, state.cache]);

  const loadPersistedData = () => {
    try {
      const persistedUser = localStorage.getItem('pavemaster_user');
      const persistedSettings = localStorage.getItem('pavemaster_settings');
      const persistedCache = localStorage.getItem('pavemaster_cache');

      if (persistedUser) {
        const user = JSON.parse(persistedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }

      if (persistedSettings) {
        const settings = JSON.parse(persistedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }

      if (persistedCache) {
        const cache = JSON.parse(persistedCache);
        Object.entries(cache).forEach(([key, data]) => {
          if (Array.isArray(data)) {
            dispatch({ type: 'SET_CACHE', payload: { key, data } });
          }
        });
      }
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  };

  const persistData = () => {
    try {
      if (state.user) {
        localStorage.setItem('pavemaster_user', JSON.stringify(state.user));
      }
      localStorage.setItem('pavemaster_settings', JSON.stringify(state.settings));
      localStorage.setItem('pavemaster_cache', JSON.stringify({
        projects: state.cache.projects,
        equipment: state.cache.equipment,
        team: state.cache.team
      }));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  };

  const actions: AppContextType['actions'] = {
    setUser: (user: User) => {
      dispatch({ type: 'SET_USER', payload: user });
    },

    clearUser: () => {
      dispatch({ type: 'CLEAR_USER' });
      localStorage.removeItem('pavemaster_user');
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    updatePreferences: (preferences: Partial<UserPreferences>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
      toast({
        title: "Preferences updated",
        description: "Your settings have been saved.",
      });
    },

    updateSettings: (settings: Partial<AppState['settings']>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      toast({
        title: "Settings updated",
        description: "Application settings have been saved.",
      });
    },

    setCache: (key: string, data: any[]) => {
      dispatch({ type: 'SET_CACHE', payload: { key, data } });
    },

    syncData: async () => {
      if (!state.isOnline) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // In a real app, this would sync with your backend
        // For now, we'll simulate a sync operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const timestamp = new Date().toISOString();
        dispatch({ type: 'SET_LAST_SYNC', payload: timestamp });
        
        toast({
          title: "Data synced",
          description: "All data has been synchronized successfully.",
        });
      } catch (error) {
        console.error('Sync failed:', error);
        toast({
          title: "Sync failed",
          description: "Unable to sync data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    exportData: () => {
      try {
        const exportData = {
          user: state.user,
          settings: state.settings,
          cache: state.cache,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `pavemaster-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Data exported",
          description: "Your data has been exported successfully.",
        });
      } catch (error) {
        console.error('Export failed:', error);
        toast({
          title: "Export failed",
          description: "Unable to export data. Please try again.",
          variant: "destructive",
        });
      }
    },

    importData: (data: any) => {
      try {
        if (data.user) {
          dispatch({ type: 'SET_USER', payload: data.user });
        }
        if (data.settings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: data.settings });
        }
        if (data.cache) {
          Object.entries(data.cache).forEach(([key, cacheData]) => {
            if (Array.isArray(cacheData)) {
              dispatch({ type: 'SET_CACHE', payload: { key, data: cacheData } });
            }
          });
        }

        toast({
          title: "Data imported",
          description: "Your data has been imported successfully.",
        });
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: "Import failed",
          description: "Unable to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export type { User, UserPreferences, AppState };