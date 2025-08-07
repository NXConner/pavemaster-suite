// Advanced Theme Management System
// Handles multiple themes, real-time switching, and custom branding

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'tactical' | 'brand' | 'accessibility';
  preview: string;
  colors: {
    // Base colors
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    popover: string;
    popoverForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;

    // Primary colors
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;

    // Status colors
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;

    // Interactive elements
    ring: string;
    radius: string;

    // Custom properties
    sidebar: string;
    sidebarForeground: string;
    header: string;
    headerForeground: string;

    // Gradients
    gradientStart: string;
    gradientEnd: string;

    // Special effects
    shadow: string;
    glow: string;
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
    display: string[];
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      smooth: string;
      bounce: string;
      elastic: string;
    };
  };
  effects: {
    blur: boolean;
    shadows: boolean;
    animations: boolean;
    transitions: boolean;
    glassmorphism: boolean;
  };
}

export interface CustomBrandConfig {
  logo: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fonts: {
    primary: string;
    secondary: string;
  };
  customCss?: string;
}

// Predefined Themes
export const themes: Record<string, ThemeConfig> = {
  // Light Themes
  default: {
    id: 'default',
    name: 'Professional Light',
    description: 'Clean and professional light theme for business use',
    category: 'light',
    preview: '#ffffff',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 72.2% 50.6%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '210 40% 98%',
      info: '199.2 89.1% 48%',
      infoForeground: '210 40% 98%',
      ring: '221.2 83.2% 53.3%',
      radius: '0.5rem',
      sidebar: '210 40% 98%',
      sidebarForeground: '222.2 84% 4.9%',
      header: '0 0% 100%',
      headerForeground: '222.2 84% 4.9%',
      gradientStart: '221.2 83.2% 53.3%',
      gradientEnd: '199.2 89.1% 48%',
      shadow: '0 0% 0%',
      glow: '221.2 83.2% 53.3%',
    },
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      display: ['Inter', 'sans-serif'],
    },
    animations: {
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { smooth: 'ease-out', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
    effects: {
      blur: true,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: false,
    },
  },

  dark: {
    id: 'dark',
    name: 'Professional Dark',
    description: 'Elegant dark theme for reduced eye strain',
    category: 'dark',
    preview: '#09090b',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 84% 4.9%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 72.2% 50.6%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '210 40% 98%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '222.2 84% 4.9%',
      info: '199.2 89.1% 48%',
      infoForeground: '210 40% 98%',
      ring: '217.2 91.2% 59.8%',
      radius: '0.5rem',
      sidebar: '217.2 32.6% 17.5%',
      sidebarForeground: '210 40% 98%',
      header: '222.2 84% 4.9%',
      headerForeground: '210 40% 98%',
      gradientStart: '217.2 91.2% 59.8%',
      gradientEnd: '199.2 89.1% 48%',
      shadow: '0 0% 0%',
      glow: '217.2 91.2% 59.8%',
    },
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      display: ['Inter', 'sans-serif'],
    },
    animations: {
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { smooth: 'ease-out', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
    effects: {
      blur: true,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: false,
    },
  },

  tactical: {
    id: 'tactical',
    name: 'Tactical Operations',
    description: 'High-contrast tactical theme for field operations',
    category: 'tactical',
    preview: '#0f172a',
    colors: {
      background: '222.2 100% 1%',
      foreground: '142.1 76.2% 60%',
      muted: '217.2 50% 8%',
      mutedForeground: '142.1 76.2% 40%',
      popover: '222.2 100% 1%',
      popoverForeground: '142.1 76.2% 60%',
      card: '217.2 50% 3%',
      cardForeground: '142.1 76.2% 60%',
      border: '142.1 76.2% 20%',
      input: '217.2 50% 8%',
      primary: '142.1 76.2% 50%',
      primaryForeground: '222.2 100% 1%',
      secondary: '217.2 50% 8%',
      secondaryForeground: '142.1 76.2% 60%',
      accent: '142.1 76.2% 25%',
      accentForeground: '142.1 76.2% 60%',
      destructive: '0 72.2% 50.6%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 50%',
      successForeground: '222.2 100% 1%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '222.2 100% 1%',
      info: '199.2 89.1% 48%',
      infoForeground: '222.2 100% 1%',
      ring: '142.1 76.2% 50%',
      radius: '0.25rem',
      sidebar: '217.2 50% 2%',
      sidebarForeground: '142.1 76.2% 60%',
      header: '222.2 100% 1%',
      headerForeground: '142.1 76.2% 60%',
      gradientStart: '142.1 76.2% 50%',
      gradientEnd: '142.1 76.2% 30%',
      shadow: '142.1 76.2% 50%',
      glow: '142.1 76.2% 50%',
    },
    fonts: {
      sans: ['JetBrains Mono', 'Courier New', 'monospace'],
      serif: ['JetBrains Mono', 'monospace'],
      mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      display: ['JetBrains Mono', 'monospace'],
    },
    animations: {
      duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
      easing: { smooth: 'linear', bounce: 'ease-out', elastic: 'ease-in-out' },
    },
    effects: {
      blur: false,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: false,
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern Glass',
    description: 'Contemporary glass morphism design',
    category: 'light',
    preview: '#fafafa',
    colors: {
      background: '0 0% 98%',
      foreground: '240 10% 3.9%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      primary: '346.8 77.2% 49.8%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '210 40% 98%',
      info: '221.2 83.2% 53.3%',
      infoForeground: '210 40% 98%',
      ring: '346.8 77.2% 49.8%',
      radius: '0.75rem',
      sidebar: '240 4.8% 97%',
      sidebarForeground: '240 10% 3.9%',
      header: '0 0% 100%',
      headerForeground: '240 10% 3.9%',
      gradientStart: '346.8 77.2% 49.8%',
      gradientEnd: '221.2 83.2% 53.3%',
      shadow: '240 5.9% 90%',
      glow: '346.8 77.2% 49.8%',
    },
    fonts: {
      sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      serif: ['Playfair Display', 'serif'],
      mono: ['Fira Code', 'monospace'],
      display: ['Poppins', 'sans-serif'],
    },
    animations: {
      duration: { fast: '200ms', normal: '400ms', slow: '600ms' },
      easing: { smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
    effects: {
      blur: true,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: true,
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-minimal design with maximum focus',
    category: 'light',
    preview: '#ffffff',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 10%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 10%',
      card: '0 0% 100%',
      cardForeground: '0 0% 10%',
      border: '0 0% 90%',
      input: '0 0% 94%',
      primary: '0 0% 10%',
      primaryForeground: '0 0% 98%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 10%',
      accent: '0 0% 94%',
      accentForeground: '0 0% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '0 0% 98%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '0 0% 10%',
      info: '199.2 89.1% 48%',
      infoForeground: '0 0% 98%',
      ring: '0 0% 10%',
      radius: '0rem',
      sidebar: '0 0% 98%',
      sidebarForeground: '0 0% 10%',
      header: '0 0% 100%',
      headerForeground: '0 0% 10%',
      gradientStart: '0 0% 10%',
      gradientEnd: '0 0% 40%',
      shadow: '0 0% 80%',
      glow: '0 0% 10%',
    },
    fonts: {
      sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      serif: ['IBM Plex Serif', 'serif'],
      mono: ['IBM Plex Mono', 'monospace'],
      display: ['IBM Plex Sans', 'sans-serif'],
    },
    animations: {
      duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
      easing: { smooth: 'ease', bounce: 'ease', elastic: 'ease' },
    },
    effects: {
      blur: false,
      shadows: false,
      animations: false,
      transitions: true,
      glassmorphism: false,
    },
  },

  construction: {
    id: 'construction',
    name: 'Construction Pro',
    description: 'Industry-themed colors for construction professionals',
    category: 'brand',
    preview: '#f97316',
    colors: {
      background: '0 0% 100%',
      foreground: '20 14.3% 4.1%',
      muted: '60 4.8% 95.9%',
      mutedForeground: '25 5.3% 44.7%',
      popover: '0 0% 100%',
      popoverForeground: '20 14.3% 4.1%',
      card: '0 0% 100%',
      cardForeground: '20 14.3% 4.1%',
      border: '20 5.9% 90%',
      input: '20 5.9% 90%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '60 4.8% 95.9%',
      secondaryForeground: '24 9.8% 10%',
      accent: '60 4.8% 95.9%',
      accentForeground: '24 9.8% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '60 9.1% 97.8%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '20 14.3% 4.1%',
      info: '199.2 89.1% 48%',
      infoForeground: '60 9.1% 97.8%',
      ring: '24.6 95% 53.1%',
      radius: '0.5rem',
      sidebar: '60 4.8% 97%',
      sidebarForeground: '20 14.3% 4.1%',
      header: '0 0% 100%',
      headerForeground: '20 14.3% 4.1%',
      gradientStart: '24.6 95% 53.1%',
      gradientEnd: '32.1 94.6% 43.7%',
      shadow: '20 5.9% 80%',
      glow: '24.6 95% 53.1%',
    },
    fonts: {
      sans: ['Roboto', 'system-ui', 'sans-serif'],
      serif: ['Roboto Slab', 'serif'],
      mono: ['Roboto Mono', 'monospace'],
      display: ['Roboto', 'sans-serif'],
    },
    animations: {
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { smooth: 'ease-out', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
    effects: {
      blur: true,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: false,
    },
  },

  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    description: 'Maximum contrast for accessibility compliance',
    category: 'accessibility',
    preview: '#000000',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      muted: '0 0% 85%',
      mutedForeground: '0 0% 0%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 0%',
      card: '0 0% 100%',
      cardForeground: '0 0% 0%',
      border: '0 0% 0%',
      input: '0 0% 100%',
      primary: '0 0% 0%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 85%',
      secondaryForeground: '0 0% 0%',
      accent: '0 0% 85%',
      accentForeground: '0 0% 0%',
      destructive: '0 100% 25%',
      destructiveForeground: '0 0% 100%',
      success: '120 100% 25%',
      successForeground: '0 0% 100%',
      warning: '40 100% 25%',
      warningForeground: '0 0% 100%',
      info: '240 100% 25%',
      infoForeground: '0 0% 100%',
      ring: '0 0% 0%',
      radius: '0rem',
      sidebar: '0 0% 95%',
      sidebarForeground: '0 0% 0%',
      header: '0 0% 100%',
      headerForeground: '0 0% 0%',
      gradientStart: '0 0% 0%',
      gradientEnd: '0 0% 30%',
      shadow: '0 0% 0%',
      glow: '0 0% 0%',
    },
    fonts: {
      sans: ['Arial', 'system-ui', 'sans-serif'],
      serif: ['Times New Roman', 'serif'],
      mono: ['Courier New', 'monospace'],
      display: ['Arial', 'sans-serif'],
    },
    animations: {
      duration: { fast: '0ms', normal: '0ms', slow: '0ms' },
      easing: { smooth: 'ease', bounce: 'ease', elastic: 'ease' },
    },
    effects: {
      blur: false,
      shadows: false,
      animations: false,
      transitions: false,
      glassmorphism: false,
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming ocean-inspired color palette',
    category: 'light',
    preview: '#0369a1',
    colors: {
      background: '0 0% 100%',
      foreground: '200 50% 3%',
      muted: '200 50% 95%',
      mutedForeground: '200 25% 45%',
      popover: '0 0% 100%',
      popoverForeground: '200 50% 3%',
      card: '0 0% 100%',
      cardForeground: '200 50% 3%',
      border: '200 50% 90%',
      input: '200 50% 90%',
      primary: '199 89% 48%',
      primaryForeground: '0 0% 98%',
      secondary: '200 50% 95%',
      secondaryForeground: '200 50% 3%',
      accent: '200 50% 95%',
      accentForeground: '200 50% 3%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '0 0% 98%',
      warning: '32.1 94.6% 43.7%',
      warningForeground: '0 0% 98%',
      info: '199 89% 48%',
      infoForeground: '0 0% 98%',
      ring: '199 89% 48%',
      radius: '0.75rem',
      sidebar: '200 50% 97%',
      sidebarForeground: '200 50% 3%',
      header: '0 0% 100%',
      headerForeground: '200 50% 3%',
      gradientStart: '199 89% 48%',
      gradientEnd: '199 89% 68%',
      shadow: '200 50% 80%',
      glow: '199 89% 48%',
    },
    fonts: {
      sans: ['Nunito', 'system-ui', 'sans-serif'],
      serif: ['Lora', 'serif'],
      mono: ['Source Code Pro', 'monospace'],
      display: ['Nunito', 'sans-serif'],
    },
    animations: {
      duration: { fast: '200ms', normal: '400ms', slow: '600ms' },
      easing: { smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
    effects: {
      blur: true,
      shadows: true,
      animations: true,
      transitions: true,
      glassmorphism: true,
    },
  },
};

// Theme Manager Class
export class ThemeManager {
  private currentTheme: string = 'default';
  private customThemes = new Map<string, ThemeConfig>();
  private observers = new Set<(theme: ThemeConfig) => void>();
  private mediaQuery?: MediaQueryList;
  private prefersDark = false;

  constructor() {
    this.initializeSystemTheme();
    this.loadSavedTheme();
  }

  // Initialize system theme detection
  private initializeSystemTheme(): void {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.prefersDark = this.mediaQuery.matches;

      this.mediaQuery.addEventListener('change', (e) => {
        this.prefersDark = e.matches;

        // Auto-switch if user has auto theme enabled
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme === 'auto') {
          this.setTheme(this.prefersDark ? 'dark' : 'default');
        }
      });
    }
  }

  // Load saved theme from localStorage
  private loadSavedTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const themePreference = localStorage.getItem('theme-preference');

      if (themePreference === 'auto') {
        this.setTheme(this.prefersDark ? 'dark' : 'default');
      } else if (savedTheme && this.isValidTheme(savedTheme)) {
        this.setTheme(savedTheme);
      }
    }
  }

  // Check if theme is valid
  private isValidTheme(themeId: string): boolean {
    return themes.hasOwnProperty(themeId) || this.customThemes.has(themeId);
  }

  // Get theme configuration
  getTheme(themeId?: string): ThemeConfig {
    const id = themeId || this.currentTheme;
    return themes[id] || this.customThemes.get(id) || themes.default;
  }

  // Get current theme
  getCurrentTheme(): ThemeConfig {
    return this.getTheme(this.currentTheme);
  }

  // Get all available themes
  getAllThemes(): ThemeConfig[] {
    const allThemes = [
      ...Object.values(themes),
      ...Array.from(this.customThemes.values()),
    ];

    return allThemes.sort((a, b) => {
      // Sort by category, then by name
      const categoryOrder = ['light', 'dark', 'tactical', 'brand', 'accessibility'];
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      return a.name.localeCompare(b.name);
    });
  }

  // Get themes by category
  getThemesByCategory(category: ThemeConfig['category']): ThemeConfig[] {
    return this.getAllThemes().filter(theme => theme.category === category);
  }

  // Set theme
  setTheme(themeId: string): void {
    if (!this.isValidTheme(themeId)) {
      console.warn(`Theme "${themeId}" not found, falling back to default`);
      themeId = 'default';
    }

    this.currentTheme = themeId;
    const theme = this.getTheme(themeId);

    // Apply theme to DOM
    this.applyTheme(theme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeId);
    }

    // Notify observers
    this.observers.forEach(observer => { observer(theme); });
  }

  // Apply theme to DOM
  private applyTheme(theme: ThemeConfig): void {
    if (typeof document === 'undefined') { return; }

    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${this.kebabCase(key)}`, value);
    });

    // Apply font families
    Object.entries(theme.fonts).forEach(([key, fonts]) => {
      root.style.setProperty(`--font-${key}`, fonts.join(', '));
    });

    // Apply animation properties
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // Apply effects as data attributes
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-category', theme.category);

    Object.entries(theme.effects).forEach(([key, value]) => {
      root.setAttribute(`data-${this.kebabCase(key)}`, value.toString());
    });

    // Add theme class to body
    document.body.className = document.body.className
      .replace(/theme-\S+/g, '')
      .trim();
    document.body.classList.add(`theme-${theme.id}`);
  }

  // Convert camelCase to kebab-case
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Add custom theme
  addCustomTheme(theme: ThemeConfig): void {
    this.customThemes.set(theme.id, theme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const customThemes = Array.from(this.customThemes.values());
      localStorage.setItem('custom-themes', JSON.stringify(customThemes));
    }
  }

  // Remove custom theme
  removeCustomTheme(themeId: string): void {
    if (this.customThemes.has(themeId)) {
      this.customThemes.delete(themeId);

      // Switch to default if current theme is being removed
      if (this.currentTheme === themeId) {
        this.setTheme('default');
      }

      // Update localStorage
      if (typeof window !== 'undefined') {
        const customThemes = Array.from(this.customThemes.values());
        localStorage.setItem('custom-themes', JSON.stringify(customThemes));
      }
    }
  }

  // Create theme from brand config
  createBrandTheme(brandConfig: CustomBrandConfig): ThemeConfig {
    const baseTheme = themes.default;

    return {
      ...baseTheme,
      id: `brand-${brandConfig.companyName.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${brandConfig.companyName} Brand`,
      description: `Custom brand theme for ${brandConfig.companyName}`,
      category: 'brand',
      preview: brandConfig.primaryColor,
      colors: {
        ...baseTheme.colors,
        primary: this.hexToHsl(brandConfig.primaryColor),
        secondary: this.hexToHsl(brandConfig.secondaryColor),
        accent: this.hexToHsl(brandConfig.accentColor),
        gradientStart: this.hexToHsl(brandConfig.primaryColor),
        gradientEnd: this.hexToHsl(brandConfig.secondaryColor),
        glow: this.hexToHsl(brandConfig.primaryColor),
      },
      fonts: {
        sans: [brandConfig.fonts.primary, ...baseTheme.fonts.sans],
        serif: [brandConfig.fonts.secondary, ...baseTheme.fonts.serif],
        mono: baseTheme.fonts.mono,
        display: [brandConfig.fonts.primary, ...baseTheme.fonts.display],
      },
    };
  }

  // Convert hex to HSL
  private hexToHsl(hex: string): string {
    // Remove the hash if present
    hex = hex.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  // Toggle between light and dark
  toggleDarkMode(): void {
    const currentCategory = this.getCurrentTheme().category;

    if (currentCategory === 'dark') {
      this.setTheme('default');
    } else {
      this.setTheme('dark');
    }
  }

  // Set auto theme (follows system preference)
  setAutoTheme(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', 'auto');
      this.setTheme(this.prefersDark ? 'dark' : 'default');
    }
  }

  // Subscribe to theme changes
  subscribe(observer: (theme: ThemeConfig) => void): () => void {
    this.observers.add(observer);

    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  // Export theme configuration
  exportTheme(themeId: string): string {
    const theme = this.getTheme(themeId);
    return JSON.stringify(theme, null, 2);
  }

  // Import theme configuration
  importTheme(themeData: string): ThemeConfig {
    try {
      const theme = JSON.parse(themeData) as ThemeConfig;

      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors) {
        throw new Error('Invalid theme structure');
      }

      this.addCustomTheme(theme);
      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error.message}`);
    }
  }

  // Get theme preview CSS
  getThemePreviewCSS(theme: ThemeConfig): string {
    const css = Object.entries(theme.colors)
      .map(([key, value]) => `--${this.kebabCase(key)}: ${value};`)
      .join('\n');

    return `:root {\n${css}\n}`;
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// React hook for theme management
export function useTheme() {
  const [currentTheme, setCurrentTheme] = React.useState(themeManager.getCurrentTheme());

  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe(setCurrentTheme);
    return unsubscribe;
  }, []);

  return {
    theme: currentTheme,
    themes: themeManager.getAllThemes(),
    setTheme: (themeId: string) => { themeManager.setTheme(themeId); },
    toggleDarkMode: () => { themeManager.toggleDarkMode(); },
    setAutoTheme: () => { themeManager.setAutoTheme(); },
    addCustomTheme: (theme: ThemeConfig) => { themeManager.addCustomTheme(theme); },
    removeCustomTheme: (themeId: string) => { themeManager.removeCustomTheme(themeId); },
    createBrandTheme: (brandConfig: CustomBrandConfig) => themeManager.createBrandTheme(brandConfig),
    exportTheme: (themeId: string) => themeManager.exportTheme(themeId),
    importTheme: (themeData: string) => themeManager.importTheme(themeData),
  };
}