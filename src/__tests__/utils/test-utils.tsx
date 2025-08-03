import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { AuthProvider } from '../../hooks/useAuth';
import { JargonProvider } from '../../contexts/JargonContext';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient for each test to avoid state leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <JargonProvider>
            {children}
          </JargonProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  role: 'user' as const,
};

export const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  description: 'A test project for unit testing',
  status: 'active' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  user_id: 'test-user-id',
};

export const mockEquipment = {
  id: 'test-equipment-id',
  name: 'Test Equipment',
  type: 'paver' as const,
  status: 'available' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Utility functions for common test scenarios
export const createMockFetch = (data: any, ok = true) => {
  return vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(data),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  });
};

export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Mock file for file upload tests
export const createMockFile = (
  name = 'test-file.jpg',
  _size = 1024, // Prefix with underscore to indicate intentionally unused
  type = 'image/jpeg'
) => {
  return new File(['test content'], name, { type, lastModified: Date.now() });
};

// Mock ImageData for computer vision tests
export const createMockImageData = (width = 224, height = 224) => {
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with some test pattern
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128;     // R
    data[i + 1] = 128; // G
    data[i + 2] = 128; // B
    data[i + 3] = 255; // A
  }
  return { data, width, height, colorSpace: 'srgb' as PredefinedColorSpace };
};

// Wait for async operations in tests
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to trigger and wait for useEffect
export const act = async (fn: () => Promise<void> | void) => {
  const { act: rtlAct } = await import('@testing-library/react');
  await rtlAct(async () => {
    await fn();
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };