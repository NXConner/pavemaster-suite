import { createTheme } from '@mui/material/styles';
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

// Color Palette Inspired by Construction and Pavement Industry
export const COLOR_PALETTE = {
  primary: {
    50: '#e3f2fd',   // Lightest blue (sky)
    100: '#bbdefb',  // Light blue
    200: '#90caf9',  // Soft blue
    300: '#64b5f6',  // Moderate blue
    400: '#42a5f5',  // Bright blue
    500: '#2196f3',  // Core blue (asphalt reflection)
    600: '#1e88e5',  // Deep blue
    700: '#1976d2',  // Dark blue
    800: '#1565c0',  // Darker blue
    900: '#0d47a1',  // Navy blue
    contrastText: '#ffffff'
  },
  secondary: {
    50: '#fafafa',   // Lightest gray (concrete)
    100: '#f5f5f5', 
    200: '#eeeeee',
    300: '#e0e0e0',  // Soft gray
    400: '#bdbdbd',  // Medium gray
    500: '#9e9e9e',  // Core gray
    600: '#757575',  // Dark gray
    700: '#616161',  // Darker gray
    800: '#424242',  // Almost black
    900: '#212121',  // Pavement black
    contrastText: '#000000'
  },
  accent: {
    safety: '#4caf50',   // Safety green
    warning: '#ff9800',  // Warning orange
    error: '#f44336',   // Error red
    info: '#2196f3'     // Information blue
  }
};

// Typography Scale
export const TYPOGRAPHY_SCALE = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Space Grotesk", "Roboto Mono", monospace'
  },
  sizes: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    body: {
      primary: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      secondary: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.4
      }
    }
  }
};

// Spacing and Layout
export const SPACING_SYSTEM = {
  base: 8,  // 8px base unit
  scale: {
    xs: 4,   // 4px
    sm: 8,   // 8px
    md: 16,  // 16px
    lg: 24,  // 24px
    xl: 32,  // 32px
    xxl: 48  // 48px
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }
};

// Accessibility Color Contrast Ratios
export const ACCESSIBILITY_COLORS = {
  minimumContrast: 4.5,  // WCAG AA standard
  enhancedContrast: 7    // WCAG AAA standard
};

// Create MUI Theme
export const theme = createTheme({
  palette: {
    primary: {
      main: COLOR_PALETTE.primary[500],
      light: COLOR_PALETTE.primary[300],
      dark: COLOR_PALETTE.primary[700],
      contrastText: COLOR_PALETTE.primary.contrastText
    },
    secondary: {
      main: COLOR_PALETTE.secondary[500],
      light: COLOR_PALETTE.secondary[300],
      dark: COLOR_PALETTE.secondary[700],
      contrastText: COLOR_PALETTE.secondary.contrastText
    },
    error: {
      main: COLOR_PALETTE.accent.error
    },
    warning: {
      main: COLOR_PALETTE.accent.warning
    },
    info: {
      main: COLOR_PALETTE.accent.info
    },
    success: {
      main: COLOR_PALETTE.accent.safety
    }
  },
  typography: {
    fontFamily: TYPOGRAPHY_SCALE.fontFamily.primary,
    h1: TYPOGRAPHY_SCALE.sizes.h1,
    h2: TYPOGRAPHY_SCALE.sizes.h2,
    h3: TYPOGRAPHY_SCALE.sizes.h3,
    body1: TYPOGRAPHY_SCALE.sizes.body.primary,
    body2: TYPOGRAPHY_SCALE.sizes.body.secondary
  },
  shape: {
    borderRadius: SPACING_SYSTEM.borderRadius.md
  },
  spacing: SPACING_SYSTEM.base
});

// Extended Theme for More Customization
export const extendedTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          ...COLOR_PALETTE.primary
        },
        secondary: {
          ...COLOR_PALETTE.secondary
        }
      }
    },
    dark: {
      palette: {
        primary: {
          ...COLOR_PALETTE.primary
        },
        secondary: {
          ...COLOR_PALETTE.secondary
        }
      }
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: SPACING_SYSTEM.borderRadius.md
        }
      }
    }
  }
});

// Theme Utility Functions
export const getColorContrast = (color: string) => {
  // Implement color contrast calculation
  // This is a placeholder - use a proper color contrast algorithm
  return color;
};

export const generateColorVariants = (baseColor: string) => {
  // Generate color variants for a given base color
  // This is a placeholder - use a proper color generation algorithm
  return {
    light: baseColor,
    main: baseColor,
    dark: baseColor
  };
};

export default theme;