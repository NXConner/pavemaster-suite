/**
 * Comprehensive accessibility utilities and WCAG compliance helpers
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// WCAG color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getRelativeLuminance: (color: string): number => {
    const rgb = colorContrast.hexToRgb(color);
    if (!rgb) { return 0; }

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = colorContrast.getRelativeLuminance(color1);
    const lum2 = colorContrast.getRelativeLuminance(color2);
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (lightest + 0.05) / (darkest + 0.05);
  },

  // Check WCAG compliance levels
  checkWCAGCompliance: (color1: string, color2: string) => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return {
      ratio,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      aaLarge: ratio >= 3,
      aaaLarge: ratio >= 4.5,
    };
  },

  // Find accessible color variant
  findAccessibleColor: (baseColor: string, backgroundColor: string, targetRatio = 4.5): string => {
    let color = baseColor;
    const baseRgb = colorContrast.hexToRgb(color);
    if (!baseRgb) { return color; }

    // Try darkening/lightening the color to meet contrast requirements
    for (let i = 0; i < 100; i++) {
      const currentRatio = colorContrast.getContrastRatio(color, backgroundColor);
      if (currentRatio >= targetRatio) {
        return color;
      }

      // Adjust color
      const adjustment = i * 2.55; // 0-255 range
      const newRgb = {
        r: Math.min(255, Math.max(0, baseRgb.r - adjustment)),
        g: Math.min(255, Math.max(0, baseRgb.g - adjustment)),
        b: Math.min(255, Math.max(0, baseRgb.b - adjustment)),
      };
      color = `#${Math.round(newRgb.r).toString(16).padStart(2, '0')}${Math.round(newRgb.g).toString(16).padStart(2, '0')}${Math.round(newRgb.b).toString(16).padStart(2, '0')}`;
    }

    return color;
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Check if screen reader is active
  isScreenReaderActive: (): boolean => {
    return window.speechSynthesis !== undefined
           || navigator.userAgent.includes('NVDA')
           || navigator.userAgent.includes('JAWS')
           || window.navigator.userAgent.includes('VoiceOver');
  },

  // Get appropriate label for element
  getAccessibleLabel: (element: HTMLElement): string => {
    return element.getAttribute('aria-label')
           || element.getAttribute('aria-labelledby')
           || element.textContent
           || element.getAttribute('title')
           || '';
  },
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') { return; }

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Handle escape key
  onEscape: (callback: () => void) => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    return !element.hasAttribute('disabled')
           && !element.hasAttribute('hidden')
           && element.tabIndex !== -1
           && element.offsetParent !== null;
  },
};

// Focus management hooks
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) { return; }

    const cleanup = keyboardNavigation.trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

export function useAutoFocus(shouldFocus: boolean = true) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [shouldFocus]);

  return elementRef;
}

// ARIA utilities
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Enhanced ARIA attributes
  getExpandedProps: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
    'aria-haspopup': true,
  }),

  getSelectedProps: (isSelected: boolean) => ({
    'aria-selected': isSelected,
    'role': 'option',
  }),

  getCheckedProps: (isChecked: boolean) => ({
    'aria-checked': isChecked,
    'role': 'checkbox',
  }),

  // Live region for dynamic content
  getLiveRegionProps: (priority: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': priority,
    'aria-atomic': true,
  }),

  // Form validation
  getErrorProps: (errorId?: string, hasError?: boolean) => ({
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
  }),

  // Loading states
  getLoadingProps: (isLoading: boolean, label: string = 'Loading') => ({
    'aria-busy': isLoading,
    'aria-label': isLoading ? label : undefined,
  }),
};

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  return isHighContrast;
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  return prefersReducedMotion;
}

// Announcement hook for screen readers
export function useAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.announce(message, priority);
  }, []);

  return announce;
}

// Skip navigation utility
export const skipNavigation = {
  createSkipLink: (targetId: string, label: string = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded';

    return skipLink;
  },

  addSkipLinks: () => {
    const skipLinks = [
      { target: 'main-content', label: 'Skip to main content' },
      { target: 'navigation', label: 'Skip to navigation' },
      { target: 'search', label: 'Skip to search' },
    ];

    const container = document.createElement('div');
    container.className = 'skip-links';

    skipLinks.forEach(({ target, label }) => {
      const targetElement = document.getElementById(target);
      if (targetElement) {
        const skipLink = skipNavigation.createSkipLink(target, label);
        container.appendChild(skipLink);
      }
    });

    document.body.insertBefore(container, document.body.firstChild);
  },
};

// Accessibility testing utilities
export const accessibilityTest = {
  // Check for missing alt text
  checkImages: (): string[] => {
    const images = document.querySelectorAll('img');
    const issues: string[] = [];

    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    return issues;
  },

  // Check for proper heading hierarchy
  checkHeadings: (): string[] => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let lastLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (index === 0 && level !== 1) {
        issues.push('Page should start with h1');
      }

      if (level > lastLevel + 1) {
        issues.push(`Heading level jump from h${lastLevel} to h${level}`);
      }

      lastLevel = level;
    });

    return issues;
  },

  // Check for form labels
  checkFormLabels: (): string[] => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const issues: string[] = [];

    inputs.forEach((input, index) => {
      const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel) {
        issues.push(`Form control ${index + 1} missing label`);
      }
    });

    return issues;
  },

  // Run all accessibility checks
  runFullAudit: () => {
    return {
      images: accessibilityTest.checkImages(),
      headings: accessibilityTest.checkHeadings(),
      formLabels: accessibilityTest.checkFormLabels(),
    };
  },
};

// Initialize accessibility features
export function initializeAccessibility() {
  // Add skip links
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', skipNavigation.addSkipLinks);
  } else {
    skipNavigation.addSkipLinks();
  }

  // Set up global keyboard handlers
  document.addEventListener('keydown', (e) => {
    // Alt + 1: Focus main content
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const main = document.getElementById('main-content') || document.querySelector('main');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    }

    // Alt + 2: Focus navigation
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const nav = document.getElementById('navigation') || document.querySelector('nav');
      if (nav) {
        const firstLink = nav.querySelector('a, button');
        (firstLink as HTMLElement)?.focus();
      }
    }
  });

  // Run accessibility audit in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const audit = accessibilityTest.runFullAudit();
      const totalIssues = Object.values(audit).flat().length;

      if (totalIssues > 0) {
        console.group('♿ Accessibility Audit Results');
        Object.entries(audit).forEach(([category, issues]) => {
          if (issues.length > 0) {
            console.warn(`${category}:`, issues);
          }
        });
        console.groupEnd();
      } else {
        console.log('♿ Accessibility audit passed!');
      }
    }, 1000);
  }
}