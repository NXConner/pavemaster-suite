import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TooltipProvider } from '@/shared/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { PerformanceProvider } from './PerformanceProvider';

interface AppProvidersProps {
  children: ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <PerformanceProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <TooltipProvider>
                <AuthProvider>
                  {children}
                  
                  {/* Development tools */}
                  {import.meta.env.DEV && (
                    <ReactQueryDevtools 
                      initialIsOpen={false} 
                      buttonPosition="bottom-right"
                    />
                  )}
                </AuthProvider>
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export { queryClient };