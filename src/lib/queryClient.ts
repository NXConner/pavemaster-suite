import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { performanceMonitor } from '@/lib/performance';
// Note: logSecurityEvent function will be implemented when security module is complete

// Enhanced error handling for queries
function handleQueryError(error: unknown, query: any) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

  console.error('Query failed:', {
    queryKey: query.queryKey,
    error: errorMessage,
    meta: query.meta,
  });

  // Log security events for authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    // logSecurityEvent('unauthorized_api_access', 'query', String(query.queryKey[0]));
    console.warn('Unauthorized API access attempt:', query.queryKey);
  }

  // Track API failures
  performanceMonitor.recordMetric('api_error', 1, 'count', {
    queryKey: query.queryKey,
    error: errorMessage,
  });

  // Show user-friendly error messages
  if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
    toast({
      variant: 'destructive',
      title: 'Connection Error',
      description: 'Please check your internet connection and try again.',
    });
  } else if (errorMessage.includes('401')) {
    toast({
      variant: 'destructive',
      title: 'Authentication Required',
      description: 'Please sign in to continue.',
    });
  } else if (!errorMessage.includes('AbortError')) {
    // Don't show errors for cancelled requests
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Something went wrong. Please try again.',
    });
  }
}

// Enhanced mutation error handling
function handleMutationError(error: unknown, variables: unknown, _context: unknown, mutation: any) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

  console.error('Mutation failed:', {
    mutationKey: mutation.options.mutationKey,
    error: errorMessage,
    variables,
  });

  // Track mutation failures
  performanceMonitor.recordMetric('mutation_error', 1, 'count', {
    mutationKey: mutation.options.mutationKey,
    error: errorMessage,
  });

  // Show user-friendly error messages
  toast({
    variant: 'destructive',
    title: 'Operation Failed',
    description: errorMessage.includes('Network Error')
      ? 'Please check your connection and try again.'
      : 'The operation could not be completed. Please try again.',
  });
}

// Create query cache with error handling
const queryCache = new QueryCache({
  onError: handleQueryError,
  onSuccess: (_data, query) => {
    // Track successful queries
    performanceMonitor.recordMetric('api_success', 1, 'count', {
      queryKey: query.queryKey,
    });
  },
});

// Create mutation cache with error handling
const mutationCache = new MutationCache({
  onError: handleMutationError,
  onSuccess: (_data, _variables, _context, mutation) => {
    // Track successful mutations
    performanceMonitor.recordMetric('mutation_success', 1, 'count', {
      mutationKey: mutation.options.mutationKey,
    });
  },
});

// Query client configuration
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: Data stays in cache for 10 minutes after component unmount
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for important data
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Use network mode for better offline support
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Use network mode for mutations
      networkMode: 'online',
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // User data
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userSettings: (userId: string) => ['user', 'settings', userId] as const,

  // Projects
  projects: ['projects'] as const,
  projectsList: (filters?: Record<string, any>) => ['projects', 'list', filters] as const,
  project: (id: string) => ['projects', 'detail', id] as const,
  projectTasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,

  // Estimates
  estimates: ['estimates'] as const,
  estimatesList: (filters?: Record<string, any>) => ['estimates', 'list', filters] as const,
  estimate: (id: string) => ['estimates', 'detail', id] as const,

  // Invoices
  invoices: ['invoices'] as const,
  invoicesList: (filters?: Record<string, any>) => ['invoices', 'list', filters] as const,
  invoice: (id: string) => ['invoices', 'detail', id] as const,

  // Clients
  clients: ['clients'] as const,
  clientsList: (filters?: Record<string, any>) => ['clients', 'list', filters] as const,
  client: (id: string) => ['clients', 'detail', id] as const,

  // Inventory
  inventory: ['inventory'] as const,
  inventoryItems: (filters?: Record<string, any>) => ['inventory', 'items', filters] as const,
  inventoryItem: (id: string) => ['inventory', 'item', id] as const,

  // Analytics
  analytics: ['analytics'] as const,
  analyticsRevenue: (period: string) => ['analytics', 'revenue', period] as const,
  analyticsProjects: (period: string) => ['analytics', 'projects', period] as const,

  // System
  settings: ['settings'] as const,
  themes: ['themes'] as const,
  notifications: ['notifications'] as const,
} as const;

// Cache management utilities
export const cacheUtils = {
  // Invalidate all data for a specific entity
  invalidateEntity: (entity: keyof typeof queryKeys) => {
    return queryClient.invalidateQueries({
      queryKey: [entity],
    });
  },

  // Remove all cached data for an entity
  removeEntity: (entity: keyof typeof queryKeys) => {
    queryClient.removeQueries({
      queryKey: [entity],
    });
  },

  // Prefetch data
  prefetch: async (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  // Set query data manually
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get cached data
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },

  // Optimistic updates helper
  optimisticUpdate: async <T>(
    queryKey: readonly unknown[],
    updateFn: (oldData: T | undefined) => T,
    mutationFn: () => Promise<any>,
  ) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData<T>(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, updateFn(previousData));

    try {
      await mutationFn();
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);
      throw error;
    }
  },

  // Clear all cache
  clearCache: () => {
    queryClient.clear();
  },

  // Get cache stats
  getCacheStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();

    return {
      queriesCount: queries.length,
      mutationsCount: mutations.length,
      queries: queries.map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
      })),
    };
  },
};

// Persistence layer for offline support
export const persistenceUtils = {
  // Save critical data to localStorage for offline access
  persistCriticalData: () => {
    try {
      const criticalQueries = queryClient.getQueryCache().getAll().filter(query => {
        const key = query.queryKey[0];
        return ['user', 'projects', 'clients'].includes(key as string);
      });

      const persistData = criticalQueries.reduce<Record<string, any>>((acc, query) => {
        if (query.state.data) {
          acc[JSON.stringify(query.queryKey)] = {
            data: query.state.data,
            dataUpdatedAt: query.state.dataUpdatedAt,
          };
        }
        return acc;
      }, {});

      localStorage.setItem('pavemaster-cache', JSON.stringify(persistData));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  },

  // Restore data from localStorage
  restorePersistedData: () => {
    try {
      const persistedData = localStorage.getItem('pavemaster-cache');
      if (persistedData) {
        const data = JSON.parse(persistedData);
        Object.entries(data).forEach(([keyStr, value]: [string, any]) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, value.data);
        });
      }
    } catch (error) {
      console.warn('Failed to restore cache:', error);
    }
  },
};

// Auto-persist cache on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', persistenceUtils.persistCriticalData);

  // Restore cache on app start
  persistenceUtils.restorePersistedData();
}