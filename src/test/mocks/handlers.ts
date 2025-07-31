// MSW Request Handlers
// Mock API responses for testing

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      },
      token: 'mock-jwt-token'
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: {
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        role: 'user'
      },
      token: 'mock-jwt-token'
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      token: 'new-mock-jwt-token'
    });
  }),

  // Projects endpoints
  http.get('/api/projects', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Project 1',
        description: 'A test project',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Test Project 2',
        description: 'Another test project',
        status: 'completed',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]);
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: `Test Project ${id}`,
      description: 'A test project',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  }),

  http.post('/api/projects', async ({ request }) => {
    const newProject = await request.json();
    return HttpResponse.json({
      id: 'new-project-id',
      ...newProject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 });
  }),

  // Equipment endpoints
  http.get('/api/equipment', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Excavator 1',
        type: 'excavator',
        status: 'available',
        location: { latitude: 40.7128, longitude: -74.0060 }
      },
      {
        id: '2',
        name: 'Truck 1',
        type: 'truck',
        status: 'in-use',
        location: { latitude: 40.7130, longitude: -74.0058 }
      }
    ]);
  }),

  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 123456,
      version: '1.0.0',
      checks: {
        database: true,
        memory: true,
        disk: true
      }
    });
  }),

  // Error simulation endpoints for testing error handling
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }),

  http.get('/api/error/401', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),
];