import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Mock component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Mock the reload function
const originalLocation = window.location;

beforeEach(() => {
  // Reset window.location
  delete (window as any).location;
  window.location = { ...originalLocation, reload: vi.fn() };
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. An unexpected error has occurred.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );

    consoleSpy.mockRestore();
  });

  it('navigates home when go home button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalHref = window.location.href;
    
    // Mock window.location.href setter
    delete (window as any).location;
    window.location = { ...originalLocation, href: originalHref } as any;
    
    const hrefSetter = vi.fn();
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => originalHref
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText('Go Home'));
    expect(hrefSetter).toHaveBeenCalledWith('/');

    consoleSpy.mockRestore();
  });

  it('resets error state when try again button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a stateful component that can stop throwing
    let shouldThrow = true;
    function ConditionalThrowError() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Stop the component from throwing
    shouldThrow = false;

    // Click the Try Again button - this calls resetError internally
    fireEvent.click(screen.getByText('Try Again'));

    // After clicking Try Again, the error boundary should reset and show children again
    expect(screen.getByText('No error')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});