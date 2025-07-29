import { createContext, useContext } from 'react';

// Advanced Color Palette Management
interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: {
        primary: string;
        secondary: string;
    };
    state: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}

// Accessibility-Focused Typography System
interface TypographyScale {
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    fontWeight: {
        light: number;
        normal: number;
        semibold: number;
        bold: number;
    };
    lineHeight: {
        tight: number;
        normal: number;
        loose: number;
    };
    letterSpacing: {
        tight: string;
        normal: string;
        wide: string;
    };
}

// Responsive Spacing and Layout
interface SpacingSystem {
    scale: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    grid: {
        columns: number;
        gap: string;
    };
}

// Advanced Theming Capabilities
interface ThemeConfig {
    colorMode: 'light' | 'dark' | 'system';
    highContrast: boolean;
    reducedMotion: boolean;
}

// Comprehensive Design System
class DesignSystem {
    private static instance: DesignSystem;
    
    // Core Design Tokens
    private _colorPalette: ColorPalette;
    private _typography: TypographyScale;
    private _spacing: SpacingSystem;
    private _themeConfig: ThemeConfig;

    private constructor() {
        this._colorPalette = this.createDefaultColorPalette();
        this._typography = this.createDefaultTypographyScale();
        this._spacing = this.createDefaultSpacingSystem();
        this._themeConfig = this.createDefaultThemeConfig();
    }

    // Singleton Pattern
    public static getInstance(): DesignSystem {
        if (!DesignSystem.instance) {
            DesignSystem.instance = new DesignSystem();
        }
        return DesignSystem.instance;
    }

    // Color Palette Generation
    private createDefaultColorPalette(): ColorPalette {
        return {
            primary: '#1a73e8',
            secondary: '#34a853',
            accent: '#fbbc05',
            background: '#ffffff',
            text: {
                primary: '#202124',
                secondary: '#5f6368'
            },
            state: {
                success: '#34a853',
                warning: '#fbbc05',
                error: '#ea4335',
                info: '#4285f4'
            }
        };
    }

    // Typography Scale Generation
    private createDefaultTypographyScale(): TypographyScale {
        return {
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem'
            },
            fontWeight: {
                light: 300,
                normal: 400,
                semibold: 600,
                bold: 700
            },
            lineHeight: {
                tight: 1.2,
                normal: 1.5,
                loose: 1.8
            },
            letterSpacing: {
                tight: '-0.02em',
                normal: '0',
                wide: '0.02em'
            }
        };
    }

    // Spacing System Generation
    private createDefaultSpacingSystem(): SpacingSystem {
        return {
            scale: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem'
            },
            grid: {
                columns: 12,
                gap: '1rem'
            }
        };
    }

    // Theme Configuration
    private createDefaultThemeConfig(): ThemeConfig {
        return {
            colorMode: 'system',
            highContrast: false,
            reducedMotion: false
        };
    }

    // Accessibility Color Contrast Checker
    public checkColorContrast(foreground: string, background: string): number {
        // Implement WCAG contrast ratio calculation
        // Returns contrast ratio (should be >= 4.5 for WCAG AA compliance)
        return 0; // Placeholder
    }

    // Dynamic Theme Generation
    public generateTheme(customConfig?: Partial<ThemeConfig>): string {
        const themeConfig = { 
            ...this._themeConfig, 
            ...customConfig 
        };

        // Generate CSS variables based on theme configuration
        return `
            :root {
                --color-primary: ${this._colorPalette.primary};
                --color-secondary: ${this._colorPalette.secondary};
                --font-size-base: ${this._typography.fontSize.base};
                --spacing-md: ${this._spacing.scale.md};
                
                ${themeConfig.highContrast ? 
                    '--color-text: #000000; --color-background: #ffffff;' : 
                    ''
                }
                
                ${themeConfig.reducedMotion ? 
                    '--transition-speed: 0s;' : 
                    '--transition-speed: 0.3s;'
                }
            }
        `;
    }

    // Responsive Typography Scaling
    public getResponsiveFontSize(baseSize: keyof TypographyScale['fontSize']): string {
        const size = this._typography.fontSize[baseSize];
        return `clamp(${parseFloat(size) * 0.8}rem, 4vw, ${parseFloat(size) * 1.2}rem)`;
    }

    // Accessibility Helpers
    public getAccessibilityAttributes(): Record<string, string> {
        return {
            'aria-live': 'polite',
            'role': 'region',
            'tabIndex': '0'
        };
    }

    // Theme Switching
    public switchTheme(mode: ThemeConfig['colorMode']) {
        this._themeConfig.colorMode = mode;
        // Trigger theme change event or update
        return this.generateTheme();
    }

    // Export Design Tokens
    public getDesignTokens() {
        return {
            colors: this._colorPalette,
            typography: this._typography,
            spacing: this._spacing,
            theme: this._themeConfig
        };
    }
}

// React Context for Design System
const DesignSystemContext = createContext(DesignSystem.getInstance());

// Custom Hook for Design System Access
export function useDesignSystem() {
    return useContext(DesignSystemContext);
}

export default DesignSystem.getInstance(); 