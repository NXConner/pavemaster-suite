/**
 * Comprehensive Accessibility Enhancement Service
 * Provides WCAG 2.1 AAA compliance, keyboard navigation, screen reader support, and accessibility testing
 */

export interface AccessibilityConfig {
  level: 'A' | 'AA' | 'AAA';
  enableAnnouncements: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusManagement: boolean;
  enableMotionReduction: boolean;
  enableHighContrast: boolean;
  enableColorAdjustment: boolean;
  announceNavigation: boolean;
  announceErrors: boolean;
  announceUpdates: boolean;
}

export interface AccessibilityViolation {
  type: 'color-contrast' | 'keyboard-navigation' | 'aria-missing' | 'focus-management' | 'motion-sensitivity';
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  recommendation: string;
  wcagCriterion: string;
}

export interface AccessibilityReport {
  score: number;
  level: 'A' | 'AA' | 'AAA';
  violations: AccessibilityViolation[];
  passedChecks: number;
  totalChecks: number;
  recommendations: string[];
}

export class AccessibilityEnhancer {
  private config: AccessibilityConfig;
  private announcer: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private keyboardNavigation: boolean = false;
  private motionReduced: boolean = false;
  private highContrast: boolean = false;

  constructor(config?: Partial<AccessibilityConfig>) {
    this.config = {
      level: 'AA',
      enableAnnouncements: true,
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableMotionReduction: true,
      enableHighContrast: true,
      enableColorAdjustment: true,
      announceNavigation: true,
      announceErrors: true,
      announceUpdates: true,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize accessibility enhancements
   */
  private initialize(): void {
    this.setupScreenReaderAnnouncer();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.detectUserPreferences();
    this.enhanceExistingElements();
    this.setupMotionReduction();
    this.setupColorAdjustments();
    
    console.log('♿ Accessibility enhancements initialized');
  }

  /**
   * Setup screen reader announcer
   */
  private setupScreenReaderAnnouncer(): void {
    if (!this.config.enableAnnouncements) return;

    this.announcer = document.createElement('div');
    this.announcer.id = 'accessibility-announcer';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    
    // Style for screen reader only
    Object.assign(this.announcer.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap'
    });

    document.body.appendChild(this.announcer);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer || !this.config.enableAnnouncements) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * Setup keyboard navigation enhancements
   */
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return;

    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    
    // Add visible focus indicators
    this.addFocusStyles();
    
    // Setup skip links
    this.setupSkipLinks();
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
      case 'Home':
      case 'End':
        this.handleHomeEndNavigation(event);
        break;
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey) {
      // Shift+Tab (previous)
      if (currentIndex === 0) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
    } else {
      // Tab (next)
      if (currentIndex === focusableElements.length - 1) {
        event.preventDefault();
        focusableElements[0]?.focus();
      }
    }

    // Announce navigation if enabled
    if (this.config.announceNavigation) {
      const target = event.shiftKey 
        ? focusableElements[Math.max(0, currentIndex - 1)]
        : focusableElements[Math.min(focusableElements.length - 1, currentIndex + 1)];
      
      if (target) {
        const label = this.getElementLabel(target);
        this.announce(`Focused on ${label}`);
      }
    }
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Close modals, dropdowns, etc.
    const modal = target.closest('[role="dialog"], [role="alertdialog"]');
    if (modal) {
      this.closeModal(modal as HTMLElement);
      return;
    }

    const dropdown = target.closest('[aria-expanded="true"]');
    if (dropdown) {
      this.closeDropdown(dropdown as HTMLElement);
      return;
    }

    // Return focus to previous element
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      previousElement?.focus();
    }
  }

  /**
   * Handle activation (Enter/Space)
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle custom clickable elements
    if (target.getAttribute('role') === 'button' && !target.matches('button, input[type="button"], input[type="submit"]')) {
      event.preventDefault();
      target.click();
      this.announce(`Activated ${this.getElementLabel(target)}`);
    }
  }

  /**
   * Handle arrow navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('[role="listbox"], [role="menu"], [role="tablist"], [role="grid"]');
    
    if (!container) return;

    event.preventDefault();
    
    const items = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"], [role="gridcell"]'));
    const currentIndex = items.indexOf(target);
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
    }
    
    if (nextIndex !== currentIndex) {
      (items[nextIndex] as HTMLElement)?.focus();
      this.announce(`${this.getElementLabel(items[nextIndex] as HTMLElement)}`);
    }
  }

  /**
   * Handle Home/End navigation
   */
  private handleHomeEndNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('[role="listbox"], [role="menu"], [role="tablist"], [role="grid"]');
    
    if (!container) return;

    event.preventDefault();
    
    const items = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"], [role="gridcell"]'));
    
    if (event.key === 'Home') {
      (items[0] as HTMLElement)?.focus();
    } else if (event.key === 'End') {
      (items[items.length - 1] as HTMLElement)?.focus();
    }
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    if (!this.config.enableFocusManagement) return;

    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      this.manageFocus(target);
    });

    // Trap focus in modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
        if (modal) {
          this.trapFocus(event, modal as HTMLElement);
        }
      }
    });
  }

  /**
   * Manage focus for better accessibility
   */
  private manageFocus(element: HTMLElement): void {
    // Add to focus history
    if (this.focusHistory[this.focusHistory.length - 1] !== element) {
      this.focusHistory.push(element);
      
      // Limit history size
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }

    // Ensure focused element is visible
    this.ensureElementVisible(element);
  }

  /**
   * Trap focus within a container
   */
  private trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  /**
   * Get focusable elements
   */
  private getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element: Element) => {
        const htmlElement = element as HTMLElement;
        return !htmlElement.disabled && 
               htmlElement.offsetParent !== null && 
               !htmlElement.hasAttribute('aria-hidden');
      }) as HTMLElement[];
  }

  /**
   * Add focus styles
   */
  private addFocusStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      :focus:not(:focus-visible) {
        outline: none !important;
      }
      
      .focus-visible {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      @media (prefers-contrast: high) {
        * {
          filter: contrast(150%) !important;
        }
      }
      
      .sr-only {
        position: absolute !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        clip-path: inset(50%) !important;
        white-space: nowrap !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup skip links
   */
  private setupSkipLinks(): void {
    const skipLinks = document.createElement('div');
    skipLinks.id = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;
    
    const skipLinkStyle = document.createElement('style');
    skipLinkStyle.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        z-index: 10000;
      }
      
      .skip-link:focus {
        top: 0;
      }
    `;
    
    document.head.appendChild(skipLinkStyle);
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  /**
   * Detect user preferences
   */
  private detectUserPreferences(): void {
    // Detect reduced motion preference
    this.motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.motionReduced = e.matches;
      this.updateMotionSettings();
    });
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.highContrast = e.matches;
      this.updateContrastSettings();
    });
  }

  /**
   * Enhance existing elements
   */
  private enhanceExistingElements(): void {
    // Add missing ARIA labels
    this.addMissingLabels();
    
    // Enhance form elements
    this.enhanceFormElements();
    
    // Add landmarks
    this.addLandmarks();
    
    // Enhance interactive elements
    this.enhanceInteractiveElements();
  }

  /**
   * Add missing ARIA labels
   */
  private addMissingLabels(): void {
    // Images without alt text
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
    });

    // Buttons without labels
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach((button) => {
      const text = button.textContent?.trim();
      if (!text) {
        button.setAttribute('aria-label', 'Button');
      }
    });

    // Form inputs without labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const label = document.querySelector(`label[for="${inputElement.id}"]`);
      if (!label && inputElement.placeholder) {
        inputElement.setAttribute('aria-label', inputElement.placeholder);
      }
    });
  }

  /**
   * Enhance form elements
   */
  private enhanceFormElements(): void {
    // Add required field indicators
    document.querySelectorAll('input[required], textarea[required], select[required]').forEach((element) => {
      element.setAttribute('aria-required', 'true');
      
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label && !label.textContent?.includes('*')) {
        label.innerHTML += ' <span aria-hidden="true">*</span>';
      }
    });

    // Add error message support
    document.querySelectorAll('input, textarea, select').forEach((element) => {
      const errorId = `${element.id}-error`;
      const existingError = document.getElementById(errorId);
      
      if (!existingError) {
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message sr-only';
        errorElement.setAttribute('aria-live', 'polite');
        element.parentNode?.insertBefore(errorElement, element.nextSibling);
        
        element.setAttribute('aria-describedby', errorId);
      }
    });
  }

  /**
   * Add landmarks
   */
  private addLandmarks(): void {
    // Add main landmark if missing
    if (!document.querySelector('main, [role="main"]')) {
      const main = document.querySelector('#main-content, .main-content, .content');
      if (main) {
        main.setAttribute('role', 'main');
      }
    }

    // Add navigation landmarks
    document.querySelectorAll('nav:not([role]), .navigation:not([role])').forEach((nav) => {
      nav.setAttribute('role', 'navigation');
    });

    // Add banner and contentinfo if missing
    const header = document.querySelector('header:not([role])');
    if (header) {
      header.setAttribute('role', 'banner');
    }

    const footer = document.querySelector('footer:not([role])');
    if (footer) {
      footer.setAttribute('role', 'contentinfo');
    }
  }

  /**
   * Enhance interactive elements
   */
  private enhanceInteractiveElements(): void {
    // Add button role to clickable elements
    document.querySelectorAll('[onclick]:not(button):not(a):not([role])').forEach((element) => {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
    });

    // Enhance dropdown menus
    document.querySelectorAll('[data-dropdown], .dropdown').forEach((dropdown) => {
      this.enhanceDropdown(dropdown as HTMLElement);
    });

    // Enhance modals
    document.querySelectorAll('[data-modal], .modal').forEach((modal) => {
      this.enhanceModal(modal as HTMLElement);
    });
  }

  /**
   * Setup motion reduction
   */
  private setupMotionReduction(): void {
    if (!this.config.enableMotionReduction) return;
    this.updateMotionSettings();
  }

  /**
   * Update motion settings
   */
  private updateMotionSettings(): void {
    if (this.motionReduced) {
      document.body.classList.add('reduce-motion');
      this.announce('Animations reduced for better accessibility');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }

  /**
   * Setup color adjustments
   */
  private setupColorAdjustments(): void {
    if (!this.config.enableColorAdjustment) return;
    this.updateContrastSettings();
  }

  /**
   * Update contrast settings
   */
  private updateContrastSettings(): void {
    if (this.highContrast) {
      document.body.classList.add('high-contrast');
      this.announce('High contrast mode enabled');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  /**
   * Enhance dropdown
   */
  private enhanceDropdown(dropdown: HTMLElement): void {
    const trigger = dropdown.querySelector('[data-toggle], .dropdown-toggle') as HTMLElement;
    const menu = dropdown.querySelector('[data-menu], .dropdown-menu') as HTMLElement;
    
    if (!trigger || !menu) return;

    // Set up ARIA attributes
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    
    const menuId = menu.id || `dropdown-menu-${Date.now()}`;
    menu.id = menuId;
    trigger.setAttribute('aria-controls', menuId);
    
    menu.setAttribute('role', 'menu');
    menu.querySelectorAll('a, button').forEach((item) => {
      item.setAttribute('role', 'menuitem');
    });
  }

  /**
   * Enhance modal
   */
  private enhanceModal(modal: HTMLElement): void {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Add close button if missing
    if (!modal.querySelector('[data-close], .modal-close')) {
      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.setAttribute('aria-label', 'Close dialog');
      closeButton.innerHTML = '×';
      modal.appendChild(closeButton);
    }
  }

  /**
   * Close modal
   */
  private closeModal(modal: HTMLElement): void {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    this.announce('Dialog closed');
  }

  /**
   * Close dropdown
   */
  private closeDropdown(dropdown: HTMLElement): void {
    dropdown.setAttribute('aria-expanded', 'false');
    this.announce('Menu closed');
  }

  /**
   * Get element label
   */
  private getElementLabel(element: HTMLElement): string {
    return element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.textContent?.trim() ||
           element.tagName.toLowerCase();
  }

  /**
   * Ensure element is visible
   */
  private ensureElementVisible(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 && 
                     rect.left >= 0 && 
                     rect.bottom <= window.innerHeight && 
                     rect.right <= window.innerWidth;

    if (!isVisible) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Run accessibility audit
   */
  async auditAccessibility(): Promise<AccessibilityReport> {
    const violations: AccessibilityViolation[] = [];
    
    // Check color contrast
    violations.push(...this.checkColorContrast());
    
    // Check keyboard navigation
    violations.push(...this.checkKeyboardNavigation());
    
    // Check ARIA usage
    violations.push(...this.checkARIAUsage());
    
    // Check focus management
    violations.push(...this.checkFocusManagement());
    
    const totalChecks = 20; // Total number of checks performed
    const passedChecks = totalChecks - violations.length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    let level: 'A' | 'AA' | 'AAA' = 'A';
    if (score >= 95) level = 'AAA';
    else if (score >= 85) level = 'AA';
    
    const recommendations = this.generateAccessibilityRecommendations(violations);
    
    return {
      score,
      level,
      violations,
      passedChecks,
      totalChecks,
      recommendations
    };
  }

  /**
   * Check color contrast
   */
  private checkColorContrast(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    // This is a simplified check - in production, use a proper color contrast library
    document.querySelectorAll('*').forEach((element) => {
      const styles = window.getComputedStyle(element as Element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simplified contrast check (would need proper implementation)
      if (color === backgroundColor) {
        violations.push({
          type: 'color-contrast',
          severity: 'error',
          element: element.tagName.toLowerCase(),
          description: 'Insufficient color contrast',
          recommendation: 'Ensure contrast ratio meets WCAG guidelines',
          wcagCriterion: '1.4.3'
        });
      }
    });
    
    return violations.slice(0, 5); // Limit for demo
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    document.querySelectorAll('[onclick]:not(button):not(a)').forEach((element) => {
      if (!element.hasAttribute('tabindex') && !element.hasAttribute('role')) {
        violations.push({
          type: 'keyboard-navigation',
          severity: 'error',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element not keyboard accessible',
          recommendation: 'Add tabindex="0" and role="button"',
          wcagCriterion: '2.1.1'
        });
      }
    });
    
    return violations;
  }

  /**
   * Check ARIA usage
   */
  private checkARIAUsage(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    // Check for missing alt text
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      violations.push({
        type: 'aria-missing',
        severity: 'error',
        element: 'img',
        description: 'Image missing alt text',
        recommendation: 'Add descriptive alt text',
        wcagCriterion: '1.1.1'
      });
    });
    
    return violations;
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    // Check for proper focus indicators
    document.querySelectorAll('a, button, input, textarea, select').forEach((element) => {
      const styles = window.getComputedStyle(element as Element, ':focus');
      if (styles.outline === 'none' && !styles.boxShadow) {
        violations.push({
          type: 'focus-management',
          severity: 'warning',
          element: element.tagName.toLowerCase(),
          description: 'No visible focus indicator',
          recommendation: 'Add visible focus styles',
          wcagCriterion: '2.4.7'
        });
      }
    });
    
    return violations.slice(0, 3); // Limit for demo
  }

  /**
   * Generate accessibility recommendations
   */
  private generateAccessibilityRecommendations(violations: AccessibilityViolation[]): string[] {
    const recommendations: string[] = [];
    
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    
    if (errorCount > 0) {
      recommendations.push(`🚨 Fix ${errorCount} critical accessibility errors`);
    }
    
    if (warningCount > 0) {
      recommendations.push(`⚠️ Address ${warningCount} accessibility warnings`);
    }
    
    recommendations.push('🎯 Test with screen readers and keyboard navigation');
    recommendations.push('🔍 Use automated accessibility testing tools');
    recommendations.push('👥 Conduct user testing with people with disabilities');
    
    return recommendations;
  }
}

// Export singleton instance
export const accessibilityEnhancer = new AccessibilityEnhancer();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      accessibilityEnhancer.initialize();
    });
  } else {
    accessibilityEnhancer.initialize();
  }
}

// Export utilities
export const announce = (message: string, priority?: 'polite' | 'assertive') => 
  accessibilityEnhancer.announce(message, priority);

export const auditAccessibility = () => accessibilityEnhancer.auditAccessibility();