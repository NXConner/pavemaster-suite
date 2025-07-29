// Design System Configuration
export const DesignSystem = {
    colors: {
        primary: {
            50: '#E3F2FD',
            100: '#BBDEFB',
            200: '#90CAF9',
            300: '#64B5F6',
            400: '#42A5F5',
            500: '#1A73E8', // Main primary color
            600: '#1E88E5',
            700: '#1976D2',
            800: '#1565C0',
            900: '#0D47A1'
        },
        secondary: {
            50: '#E8F5E9',
            100: '#C8E6C9',
            200: '#A5D6A7',
            300: '#81C784',
            400: '#66BB6A',
            500: '#34A853', // Main secondary color
            600: '#43A047',
            700: '#388E3C',
            800: '#2E7D32',
            900: '#1B5E20'
        },
        neutral: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },
        error: {
            500: '#D32F2F'
        },
        warning: {
            500: '#FBC02D'
        },
        success: {
            500: '#388E3C'
        }
    },
    typography: {
        fontFamily: {
            primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            monospace: "'Roboto Mono', monospace"
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
        },
        fontWeight: {
            thin: 100,
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800
        }
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
    },
    borderRadius: {
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px'
    },
    boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    accessibility: {
        contrastRatios: {
            minimum: 4.5,
            enhanced: 7
        },
        focusRing: {
            width: '2px',
            style: 'solid',
            color: '#1A73E8'
        }
    },
    performance: {
        transitionSpeed: {
            fast: '100ms',
            normal: '200ms',
            slow: '300ms'
        }
    }
};

export const generateAccessibleColorPalette = (baseColor: string) => {
    // Implement color generation with accessibility in mind
    // Ensure proper contrast ratios
};

export const createResponsiveScale = () => {
    // Implement responsive typography and spacing scales
};

export default DesignSystem;