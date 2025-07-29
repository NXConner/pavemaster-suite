import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Global application state types
interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  dismissible: boolean;
  duration?: number;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
}

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  notifications: NotificationState[];
  settings: AppSettings;
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setOperationLoading: (operation: string, loading: boolean) => void;
  clearAllLoading: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sidebarCollapsed: false,
        notifications: [],
        settings: defaultSettings,
        loading: {
          global: false,
          operations: {},
        },

        // Sidebar actions
        toggleSidebar: () =>
          set((state) => ({
            ...state,
            sidebarCollapsed: !state.sidebarCollapsed,
          })),

        setSidebarCollapsed: (collapsed: boolean) =>
          set((state) => ({
            ...state,
            sidebarCollapsed: collapsed,
          })),

        // Notification actions
        addNotification: (notification) =>
          set((state) => {
            const newNotification: NotificationState = {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            };
            
            const updatedNotifications = [...state.notifications, newNotification];

            // Auto-remove notification after duration
            if (notification.duration) {
              setTimeout(() => {
                get().removeNotification(newNotification.id);
              }, notification.duration);
            }

            return {
              ...state,
              notifications: updatedNotifications,
            };
          }),

        removeNotification: (id: string) =>
          set((state) => ({
            ...state,
            notifications: state.notifications.filter(n => n.id !== id),
          })),

        clearNotifications: () =>
          set((state) => ({
            ...state,
            notifications: [],
          })),

        // Settings actions
        updateSettings: (newSettings) =>
          set((state) => ({
            ...state,
            settings: { ...state.settings, ...newSettings },
          })),

        resetSettings: () =>
          set((state) => ({
            ...state,
            settings: { ...defaultSettings },
          })),

        // Loading actions
        setGlobalLoading: (loading: boolean) =>
          set((state) => ({
            ...state,
            loading: { ...state.loading, global: loading },
          })),

        setOperationLoading: (operation: string, loading: boolean) =>
          set((state) => {
            const operations = { ...state.loading.operations };
            if (loading) {
              operations[operation] = true;
            } else {
              delete operations[operation];
            }
            return {
              ...state,
              loading: { ...state.loading, operations },
            };
          }),

        clearAllLoading: () =>
          set((state) => ({
            ...state,
            loading: { global: false, operations: {} },
          })),
      }),
      {
        name: 'pavemaster-app-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'PaveMaster App Store',
    }
  )
);

// Selector hooks for optimized re-renders
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useSettings = () => useAppStore((state) => state.settings);
export const useGlobalLoading = () => useAppStore((state) => state.loading.global);
export const useOperationLoading = (operation: string) => 
  useAppStore((state) => state.loading.operations[operation] ?? false);

// Action hooks
export const useAppActions = () => useAppStore((state) => ({
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  updateSettings: state.updateSettings,
  resetSettings: state.resetSettings,
  setGlobalLoading: state.setGlobalLoading,
  setOperationLoading: state.setOperationLoading,
  clearAllLoading: state.clearAllLoading,
}));