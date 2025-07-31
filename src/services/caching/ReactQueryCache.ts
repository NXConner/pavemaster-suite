// React Query Cache Integration
// Enhances React Query with persistent caching

import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { cacheManager } from './CacheManager';

// Create persistent storage
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key: string) => {
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  },
  key: 'pavemaster-query-cache',
});

// Enhanced Query Client with caching
export const createEnhancedQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });

  // Add cache interceptor
  queryClient.setMutationDefaults(['projects', 'create'], {
    mutationFn: async (data: any) => {
      // Custom cache invalidation logic
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      return data;
    },
  });

  return queryClient;
};

// Initialize persistent cache
export const initializePersistentCache = async (queryClient: QueryClient): Promise<void> => {
  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // Only persist successful queries
          return query.state.status === 'success';
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize persistent cache:', error);
  }
};

// Cache utilities for API calls
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; persistent?: boolean } = {}
): Promise<T> => {
  // Try cache first
  const cached = await cacheManager.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  await cacheManager.set(key, data, {
    ttl: options.ttl || 5 * 60 * 1000,
    persistent: options.persistent || false,
  });

  return data;
};
