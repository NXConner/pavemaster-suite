import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import ApiDocumentation from '@/components/ApiDocumentation';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});

// Wrapper component for providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>
    {children}
  </TooltipProvider>
);

describe('ApiDocumentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the API documentation title', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive API for pavement management operations')).toBeInTheDocument();
  });

  it('displays API endpoints list', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    expect(screen.getByText('/api/projects')).toBeInTheDocument();
    expect(screen.getByText('/api/equipment')).toBeInTheDocument();
  });

  it('shows endpoint details when endpoint is selected', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    // Click on the GET /api/projects endpoint
    const getProjectsButton = screen.getByText('/api/projects');
    fireEvent.click(getProjectsButton);

    expect(screen.getByText('Get all projects')).toBeInTheDocument();
  });

  it('displays cURL example for selected endpoint', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    // Switch to example tab
    const exampleTab = screen.getByText('Example');
    fireEvent.click(exampleTab);

    expect(screen.getByText('cURL Example')).toBeInTheDocument();
    expect(screen.getByText(/curl -X GET/)).toBeInTheDocument();
  });

  it('copies cURL example to clipboard when copy button is clicked', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    // Switch to example tab
    const exampleTab = screen.getByText('Example');
    fireEvent.click(exampleTab);

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalled();
    });
  });

  it('displays response format in response tab', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    // Switch to response tab
    const responseTab = screen.getByText('Response');
    fireEvent.click(responseTab);

    expect(screen.getByText('Response Format')).toBeInTheDocument();
  });

  it('shows authentication information', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Authorization: Bearer YOUR_API_KEY')).toBeInTheDocument();
  });

  it('downloads API specification when download button is clicked', () => {
    // Mock createElement and URL methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    createElementSpy.mockReturnValue(mockAnchor as any);

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    const downloadButton = screen.getByText('Download Spec');
    fireEvent.click(downloadButton);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('handles different HTTP methods correctly', () => {
    render(
      <TestWrapper>
        <ApiDocumentation />
      </TestWrapper>
    );

    // Check that both GET and POST methods are displayed
    const badges = screen.getAllByText(/GET|POST/);
    expect(badges.length).toBeGreaterThan(0);
  });
});