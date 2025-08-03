export interface AdvancedTheme {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'dynamic' | 'premium';
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    hero: string;
    subtle: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    colored: string;
  };
  animations: {
    duration: string;
    easing: string;
    hover: string;
    focus: string;
  };
  typography: {
    fontFamily: string;
    headingFamily?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  effects: {
    blur: string;
    brightness: string;
    contrast: string;
    saturate: string;
  };
}

export const advancedThemes: AdvancedTheme[] = [
  // 1. Corporate Elite Theme
  {
    id: 'corporate-elite',
    name: 'Corporate Elite',
    description: 'Sophisticated dark theme with gold accents for executive dashboards',
    category: 'premium',
    isPremium: true,
    colors: {
      primary: 'hsl(45, 90%, 55%)', // Gold
      secondary: 'hsl(220, 15%, 20%)', // Dark slate
      accent: 'hsl(45, 100%, 65%)', // Bright gold
      background: 'hsl(225, 15%, 8%)', // Very dark blue
      surface: 'hsl(220, 15%, 12%)', // Dark surface
      text: 'hsl(45, 20%, 95%)', // Light gold-white
      textSecondary: 'hsl(45, 10%, 70%)', // Muted gold
      border: 'hsl(220, 15%, 18%)', // Dark border
      success: 'hsl(120, 40%, 55%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 70%, 55%)',
      info: 'hsl(200, 70%, 55%)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(45, 90%, 55%) 0%, hsl(45, 100%, 65%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(220, 15%, 20%) 0%, hsl(220, 15%, 12%) 100%)',
      hero: 'linear-gradient(135deg, hsl(225, 15%, 8%) 0%, hsl(220, 15%, 12%) 50%, hsl(45, 90%, 55%) 100%)',
      subtle: 'linear-gradient(180deg, hsl(225, 15%, 8%) 0%, hsl(220, 15%, 10%) 100%)',
    },
    shadows: {
      small: '0 2px 8px hsl(45, 90%, 55%, 0.1)',
      medium: '0 8px 25px hsl(45, 90%, 55%, 0.15)',
      large: '0 20px 50px hsl(45, 90%, 55%, 0.2)',
      colored: '0 10px 30px hsl(45, 90%, 55%, 0.3)',
    },
    animations: {
      duration: '350ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'transform 300ms ease-out',
      focus: 'all 200ms ease-in-out',
    },
    typography: {
      fontFamily: '"Inter", "Helvetica Neue", sans-serif',
      headingFamily: '"Playfair Display", serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    effects: {
      blur: 'blur(8px)',
      brightness: 'brightness(1.1)',
      contrast: 'contrast(1.1)',
      saturate: 'saturate(1.2)',
    },
  },

  // 2. Neon Cyber Theme
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic cyberpunk theme with electric blue and purple neon effects',
    category: 'creative',
    isPremium: true,
    colors: {
      primary: 'hsl(195, 100%, 50%)', // Electric blue
      secondary: 'hsl(270, 100%, 50%)', // Electric purple
      accent: 'hsl(315, 100%, 50%)', // Hot pink
      background: 'hsl(240, 10%, 5%)', // Almost black
      surface: 'hsl(240, 15%, 8%)', // Very dark
      text: 'hsl(195, 80%, 90%)', // Light cyan
      textSecondary: 'hsl(195, 40%, 70%)', // Muted cyan
      border: 'hsl(195, 100%, 50%)', // Glowing border
      success: 'hsl(120, 100%, 40%)',
      warning: 'hsl(60, 100%, 50%)',
      error: 'hsl(0, 100%, 50%)',
      info: 'hsl(195, 100%, 50%)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(195, 100%, 50%) 0%, hsl(270, 100%, 50%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(270, 100%, 50%) 0%, hsl(315, 100%, 50%) 100%)',
      hero: 'linear-gradient(135deg, hsl(240, 10%, 5%) 0%, hsl(195, 100%, 10%) 50%, hsl(270, 100%, 10%) 100%)',
      subtle: 'linear-gradient(180deg, hsl(240, 10%, 5%) 0%, hsl(240, 15%, 8%) 100%)',
    },
    shadows: {
      small: '0 2px 8px hsl(195, 100%, 50%, 0.3)',
      medium: '0 8px 25px hsl(195, 100%, 50%, 0.4)',
      large: '0 20px 50px hsl(195, 100%, 50%, 0.5)',
      colored: '0 0 30px hsl(195, 100%, 50%, 0.6)',
    },
    animations: {
      duration: '250ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      hover: 'transform 250ms ease-out, box-shadow 250ms ease-out',
      focus: 'all 150ms ease-in-out',
    },
    typography: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    effects: {
      blur: 'blur(4px)',
      brightness: 'brightness(1.2)',
      contrast: 'contrast(1.3)',
      saturate: 'saturate(1.5)',
    },
  },

  // 3. Organic Nature Theme
  {
    id: 'organic-nature',
    name: 'Organic Nature',
    description: 'Earth-toned theme with natural gradients and organic shapes',
    category: 'creative',
    isPremium: false,
    colors: {
      primary: 'hsl(110, 40%, 45%)', // Forest green
      secondary: 'hsl(35, 60%, 55%)', // Warm brown
      accent: 'hsl(25, 80%, 60%)', // Terracotta
      background: 'hsl(45, 30%, 96%)', // Cream white
      surface: 'hsl(45, 20%, 98%)', // Pure cream
      text: 'hsl(110, 20%, 15%)', // Dark forest
      textSecondary: 'hsl(110, 15%, 35%)', // Medium forest
      border: 'hsl(45, 25%, 85%)', // Light cream
      success: 'hsl(110, 50%, 40%)',
      warning: 'hsl(45, 80%, 50%)',
      error: 'hsl(15, 80%, 50%)',
      info: 'hsl(200, 60%, 50%)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(110, 40%, 45%) 0%, hsl(110, 50%, 35%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(35, 60%, 55%) 0%, hsl(25, 80%, 60%) 100%)',
      hero: 'linear-gradient(135deg, hsl(45, 30%, 96%) 0%, hsl(110, 20%, 85%) 50%, hsl(35, 40%, 80%) 100%)',
      subtle: 'linear-gradient(180deg, hsl(45, 30%, 96%) 0%, hsl(45, 25%, 92%) 100%)',
    },
    shadows: {
      small: '0 2px 8px hsl(110, 20%, 15%, 0.08)',
      medium: '0 8px 25px hsl(110, 20%, 15%, 0.12)',
      large: '0 20px 50px hsl(110, 20%, 15%, 0.15)',
      colored: '0 10px 30px hsl(110, 40%, 45%, 0.2)',
    },
    animations: {
      duration: '400ms',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      hover: 'transform 400ms ease-out',
      focus: 'all 300ms ease-in-out',
    },
    typography: {
      fontFamily: '"Nunito", "Source Sans Pro", sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    effects: {
      blur: 'blur(6px)',
      brightness: 'brightness(1.05)',
      contrast: 'contrast(1.05)',
      saturate: 'saturate(1.1)',
    },
  },

  // 4. Glass Morphism Theme
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    description: 'Modern glass effect with translucent surfaces and backdrop blur',
    category: 'minimal',
    isPremium: true,
    colors: {
      primary: 'hsl(220, 70%, 60%)', // Soft blue
      secondary: 'hsl(280, 60%, 65%)', // Soft purple
      accent: 'hsl(340, 70%, 65%)', // Soft pink
      background: 'hsl(220, 15%, 95%)', // Very light blue-gray
      surface: 'hsla(220, 20%, 98%, 0.7)', // Translucent white
      text: 'hsl(220, 15%, 15%)', // Dark blue-gray
      textSecondary: 'hsl(220, 10%, 45%)', // Medium gray
      border: 'hsla(220, 20%, 80%, 0.3)', // Translucent border
      success: 'hsl(140, 60%, 50%)',
      warning: 'hsl(50, 80%, 55%)',
      error: 'hsl(10, 80%, 55%)',
      info: 'hsl(220, 70%, 60%)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsla(220, 70%, 60%, 0.8) 0%, hsla(280, 60%, 65%, 0.8) 100%)',
      secondary: 'linear-gradient(135deg, hsla(280, 60%, 65%, 0.6) 0%, hsla(340, 70%, 65%, 0.6) 100%)',
      hero: 'linear-gradient(135deg, hsla(220, 15%, 95%, 0.9) 0%, hsla(220, 30%, 90%, 0.7) 100%)',
      subtle: 'linear-gradient(180deg, hsla(220, 15%, 95%, 0.5) 0%, hsla(220, 20%, 98%, 0.8) 100%)',
    },
    shadows: {
      small: '0 4px 12px hsla(220, 15%, 15%, 0.05)',
      medium: '0 8px 25px hsla(220, 15%, 15%, 0.08)',
      large: '0 25px 60px hsla(220, 15%, 15%, 0.12)',
      colored: '0 8px 32px hsla(220, 70%, 60%, 0.15)',
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'transform 300ms ease-out, backdrop-filter 300ms ease-out',
      focus: 'all 200ms ease-in-out',
    },
    typography: {
      fontFamily: '"SF Pro Display", "Inter", sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.75rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      full: '9999px',
    },
    effects: {
      blur: 'blur(20px)',
      brightness: 'brightness(1.02)',
      contrast: 'contrast(1.02)',
      saturate: 'saturate(1.05)',
    },
  },

  // 5. Retro Wave Theme
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    description: '80s synthwave aesthetic with vibrant gradients and neon colors',
    category: 'dynamic',
    isPremium: true,
    colors: {
      primary: 'hsl(315, 100%, 60%)', // Hot pink
      secondary: 'hsl(240, 100%, 70%)', // Electric purple
      accent: 'hsl(180, 100%, 50%)', // Cyan
      background: 'hsl(240, 30%, 8%)', // Very dark purple
      surface: 'hsl(240, 25%, 12%)', // Dark purple
      text: 'hsl(315, 80%, 90%)', // Light pink
      textSecondary: 'hsl(315, 40%, 70%)', // Muted pink
      border: 'hsl(315, 100%, 60%)', // Glowing pink
      success: 'hsl(120, 100%, 50%)',
      warning: 'hsl(60, 100%, 60%)',
      error: 'hsl(0, 100%, 60%)',
      info: 'hsl(180, 100%, 50%)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(315, 100%, 60%) 0%, hsl(240, 100%, 70%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(240, 100%, 70%) 0%, hsl(180, 100%, 50%) 100%)',
      hero: 'linear-gradient(135deg, hsl(240, 30%, 8%) 0%, hsl(315, 50%, 15%) 50%, hsl(240, 60%, 20%) 100%)',
      subtle: 'linear-gradient(180deg, hsl(240, 30%, 8%) 0%, hsl(240, 25%, 12%) 100%)',
    },
    shadows: {
      small: '0 2px 8px hsl(315, 100%, 60%, 0.3)',
      medium: '0 8px 25px hsl(315, 100%, 60%, 0.4)',
      large: '0 20px 50px hsl(315, 100%, 60%, 0.5)',
      colored: '0 0 40px hsl(315, 100%, 60%, 0.8)',
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      hover: 'transform 200ms ease-out, filter 200ms ease-out',
      focus: 'all 150ms ease-in-out',
    },
    typography: {
      fontFamily: '"Orbitron", "Exo 2", monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    effects: {
      blur: 'blur(2px)',
      brightness: 'brightness(1.3)',
      contrast: 'contrast(1.4)',
      saturate: 'saturate(1.8)',
    },
  },
];

export const getThemeById = (id: string): AdvancedTheme | undefined => {
  return advancedThemes.find(theme => theme.id === id);
};

export const getThemesByCategory = (category: AdvancedTheme['category']): AdvancedTheme[] => {
  return advancedThemes.filter(theme => theme.category === category);
};

export const getPremiumThemes = (): AdvancedTheme[] => {
  return advancedThemes.filter(theme => theme.isPremium);
};

export const getFreeThemes = (): AdvancedTheme[] => {
  return advancedThemes.filter(theme => !theme.isPremium);
};