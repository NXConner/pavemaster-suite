// ============================================================================
// ENHANCED THEME SYSTEM - PaveMaster Suite with ISAC-OS Integration
// ============================================================================

// Base theme types
export type Theme = 'light' | 'dark' | 'system';

// Enhanced theme modes including tactical themes
export type ThemeMode = 'light' | 'dark' | 'system' | 'isac' | 'defcon' | 'overwatch' | 'tactical';

// Wallpaper configurations
export type WallpaperType = 
  | 'tactical-grid-4k'
  | 'urban-blueprint' 
  | 'steel-structure'
  | 'construction-site'
  | 'forest-landscape'
  | 'ocean-view'
  | 'none';

// Theme configuration interface
export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  wallpaper: WallpaperType;
  tacticalGrid: boolean;
  animations: boolean;
  density: DisplayDensity;
  militaryMode: boolean;
  glassEffects: boolean;
  borderRadius: BorderRadius;
  fontSize: FontSize;
}

export type DisplayDensity = 'compact' | 'comfortable' | 'spacious';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

// ISAC-OS specific theme configurations
export interface ISACThemeConfig extends ThemeConfig {
  mode: 'isac';
  commandInterface: boolean;
  statusIndicators: boolean;
  tacticalOverlay: boolean;
  emergencyMode: boolean;
  nightVision: boolean;
}

// DEFCON theme configurations
export interface DEFCONThemeConfig extends ThemeConfig {
  mode: 'defcon';
  alertLevel: DefconLevel;
  threatDisplay: boolean;
  criticalAlerts: boolean;
  autoEscalation: boolean;
}

export type DefconLevel = 1 | 2 | 3 | 4 | 5;

// OverWatch theme configurations
export interface OverWatchThemeConfig extends ThemeConfig {
  mode: 'overwatch';
  surveillanceMode: boolean;
  tacticalMap: boolean;
  realTimeFeeds: boolean;
  threatTracking: boolean;
  commandCenter: boolean;
}

// Color scheme definitions
export interface ColorScheme {
  primary: HSLColor;
  secondary: HSLColor;
  accent: HSLColor;
  background: HSLColor;
  foreground: HSLColor;
  muted: HSLColor;
  destructive: HSLColor;
  warning: HSLColor;
  success: HSLColor;
  info: HSLColor;
}

export interface HSLColor {
  h: number; // hue (0-360)
  s: number; // saturation (0-100)
  l: number; // lightness (0-100)
  a?: number; // alpha (0-1)
}

// Tactical color schemes
export interface TacticalColorScheme extends ColorScheme {
  threat: HSLColor;
  friendly: HSLColor;
  neutral: HSLColor;
  unknown: HSLColor;
  critical: HSLColor;
  classified: HSLColor;
}

// Animation preferences
export interface AnimationConfig {
  enabled: boolean;
  duration: AnimationDuration;
  easing: AnimationEasing;
  reduce: boolean; // respect user's reduce motion preference
  tacticalEffects: boolean;
  transitions: TransitionConfig;
}

export type AnimationDuration = 'fast' | 'normal' | 'slow';
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

export interface TransitionConfig {
  page: string;
  modal: string;
  tooltip: string;
  dropdown: string;
  sidebar: string;
}

// Layout preferences
export interface LayoutConfig {
  sidebar: SidebarConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  spacing: SpacingConfig;
  grid: GridConfig;
}

export interface SidebarConfig {
  width: number;
  collapsible: boolean;
  position: 'left' | 'right';
  overlay: boolean;
  pinned: boolean;
  autoHide: boolean;
}

export interface HeaderConfig {
  height: number;
  fixed: boolean;
  transparent: boolean;
  showLogo: boolean;
  showSearch: boolean;
  showNotifications: boolean;
}

export interface FooterConfig {
  height: number;
  fixed: boolean;
  showCopyright: boolean;
  showLinks: boolean;
  showVersion: boolean;
}

export interface SpacingConfig {
  scale: number; // multiplier for spacing units
  compact: boolean;
  padding: PaddingConfig;
  margin: MarginConfig;
}

export interface PaddingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface MarginConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface GridConfig {
  columns: number;
  gap: number;
  breakpoints: BreakpointConfig;
  containerWidth: ContainerWidthConfig;
}

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ContainerWidthConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Typography configuration
export interface TypographyConfig {
  fontFamily: FontFamilyConfig;
  fontSize: FontSizeConfig;
  fontWeight: FontWeightConfig;
  lineHeight: LineHeightConfig;
  letterSpacing: LetterSpacingConfig;
}

export interface FontFamilyConfig {
  sans: string[];
  serif: string[];
  mono: string[];
  tactical: string[];
}

export interface FontSizeConfig {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeightConfig {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeightConfig {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingConfig {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

// Component-specific theme configurations
export interface ComponentThemeConfig {
  button: ButtonThemeConfig;
  card: CardThemeConfig;
  input: InputThemeConfig;
  modal: ModalThemeConfig;
  table: TableThemeConfig;
  chart: ChartThemeConfig;
}

export interface ButtonThemeConfig {
  borderRadius: BorderRadius;
  size: ComponentSize;
  variant: ButtonVariant;
  animation: boolean;
  glow: boolean;
  tactical: boolean;
}

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'destructive' 
  | 'outline' 
  | 'ghost' 
  | 'link'
  | 'tactical'
  | 'emergency';

export interface CardThemeConfig {
  borderRadius: BorderRadius;
  shadow: ShadowSize;
  glass: boolean;
  border: boolean;
  hover: boolean;
}

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface InputThemeConfig {
  borderRadius: BorderRadius;
  size: ComponentSize;
  variant: InputVariant;
  focus: FocusConfig;
}

export type InputVariant = 'default' | 'outline' | 'filled' | 'underline' | 'tactical';

export interface FocusConfig {
  ring: boolean;
  ringSize: number;
  ringColor: string;
  ringOffset: number;
}

export interface ModalThemeConfig {
  size: ModalSize;
  backdrop: BackdropConfig;
  animation: ModalAnimation;
  glass: boolean;
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface BackdropConfig {
  blur: boolean;
  opacity: number;
  color: string;
  clickToClose: boolean;
}

export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'flip' | 'tactical';

export interface TableThemeConfig {
  size: ComponentSize;
  striped: boolean;
  hover: boolean;
  bordered: boolean;
  compact: boolean;
}

export interface ChartThemeConfig {
  colorScheme: ChartColorScheme;
  animation: boolean;
  grid: boolean;
  legend: boolean;
  tooltip: boolean;
}

export type ChartColorScheme = 'default' | 'tactical' | 'status' | 'rainbow' | 'monochrome';

// Advanced theme features
export interface AdvancedThemeFeatures {
  adaptive: AdaptiveThemeConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
  customization: CustomizationConfig;
}

export interface AdaptiveThemeConfig {
  enabled: boolean;
  timeBasedSwitching: boolean;
  locationAware: boolean;
  deviceAware: boolean;
  contextAware: boolean;
  userBehavior: boolean;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusIndicators: boolean;
  screenReader: boolean;
  colorBlindness: ColorBlindnessConfig;
}

export interface ColorBlindnessConfig {
  type: ColorBlindnessType;
  compensation: boolean;
  severity: ColorBlindnessSeverity;
}

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
export type ColorBlindnessSeverity = 'mild' | 'moderate' | 'severe';

export interface PerformanceConfig {
  optimizeAnimations: boolean;
  reduceEffects: boolean;
  lazyLoading: boolean;
  prefersReducedData: boolean;
  gpuAcceleration: boolean;
}

export interface CustomizationConfig {
  allowUserCustomization: boolean;
  savePreferences: boolean;
  syncAcrossDevices: boolean;
  exportSettings: boolean;
  importSettings: boolean;
  resetToDefaults: boolean;
}

// Theme provider interfaces
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  forcedTheme?: ThemeMode;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: ThemeMode[];
  attribute?: 'class' | 'data-theme';
  value?: Partial<Record<ThemeMode, string>>;
  nonce?: string;
}

export interface ThemeProviderState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themes: ThemeMode[];
  forcedTheme?: ThemeMode;
  resolvedTheme?: ThemeMode;
  systemTheme?: 'dark' | 'light';
}

// Enhanced theme context
export interface EnhancedThemeContext extends ThemeProviderState {
  config: ThemeConfig;
  updateConfig: (config: Partial<ThemeConfig>) => void;
  resetConfig: () => void;
  colorScheme: ColorScheme;
  animation: AnimationConfig;
  layout: LayoutConfig;
  typography: TypographyConfig;
  components: ComponentThemeConfig;
  advanced: AdvancedThemeFeatures;
  presets: ThemePreset[];
  activePreset?: string;
  applyPreset: (presetId: string) => void;
  createPreset: (name: string, config: ThemeConfig) => void;
  deletePreset: (presetId: string) => void;
}

// Theme presets
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  preview: string; // base64 encoded preview image
  tags: string[];
  author: string;
  version: string;
  created: Date;
  updated: Date;
  downloads: number;
  rating: number;
  featured: boolean;
}

// CSS custom properties interface
export interface CSSCustomProperties {
  [key: `--${string}`]: string | number;
}

// Theme CSS variables
export interface ThemeCSSVariables extends CSSCustomProperties {
  '--background': string;
  '--foreground': string;
  '--primary': string;
  '--primary-foreground': string;
  '--secondary': string;
  '--secondary-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--destructive': string;
  '--destructive-foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  '--radius': string;
  '--chart-1': string;
  '--chart-2': string;
  '--chart-3': string;
  '--chart-4': string;
  '--chart-5': string;
}

// ISAC-OS specific CSS variables
export interface ISACCSSVariables extends ThemeCSSVariables {
  '--isac-primary': string;
  '--isac-secondary': string;
  '--isac-accent': string;
  '--isac-warning': string;
  '--isac-error': string;
  '--isac-success': string;
  '--isac-grid': string;
  '--isac-glow': string;
  '--isac-shadow': string;
  '--isac-gradient': string;
}

// Theme utilities and helpers
export interface ThemeUtils {
  getThemeVariables: (theme: ThemeMode) => ThemeCSSVariables;
  interpolateColor: (color1: HSLColor, color2: HSLColor, factor: number) => HSLColor;
  generateColorScheme: (baseColor: HSLColor) => ColorScheme;
  validateThemeConfig: (config: ThemeConfig) => ValidationResult;
  exportTheme: (config: ThemeConfig) => string;
  importTheme: (data: string) => ThemeConfig;
  generateCSS: (config: ThemeConfig) => string;
  optimizeForPerformance: (config: ThemeConfig) => ThemeConfig;
  adaptForAccessibility: (config: ThemeConfig, needs: AccessibilityConfig) => ThemeConfig;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Default theme configurations
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  primaryColor: 'hsl(210, 100%, 50%)',
  accentColor: 'hsl(210, 100%, 60%)',
  wallpaper: 'none',
  tacticalGrid: false,
  animations: true,
  density: 'comfortable',
  militaryMode: false,
  glassEffects: false,
  borderRadius: 'medium',
  fontSize: 'medium'
};

export const ISAC_THEME_CONFIG: ISACThemeConfig = {
  ...DEFAULT_THEME_CONFIG,
  mode: 'isac',
  primaryColor: 'hsl(210, 100%, 50%)',
  accentColor: 'hsl(15, 100%, 55%)',
  wallpaper: 'tactical-grid-4k',
  tacticalGrid: true,
  militaryMode: true,
  glassEffects: true,
  commandInterface: true,
  statusIndicators: true,
  tacticalOverlay: true,
  emergencyMode: false,
  nightVision: false
};

export const DEFCON_THEME_CONFIG: DEFCONThemeConfig = {
  ...DEFAULT_THEME_CONFIG,
  mode: 'defcon',
  primaryColor: 'hsl(0, 100%, 50%)',
  accentColor: 'hsl(30, 100%, 50%)',
  wallpaper: 'steel-structure',
  tacticalGrid: true,
  militaryMode: true,
  alertLevel: 5,
  threatDisplay: true,
  criticalAlerts: true,
  autoEscalation: false
};

export const OVERWATCH_THEME_CONFIG: OverWatchThemeConfig = {
  ...DEFAULT_THEME_CONFIG,
  mode: 'overwatch',
  primaryColor: 'hsl(195, 100%, 50%)',
  accentColor: 'hsl(280, 100%, 60%)',
  wallpaper: 'urban-blueprint',
  tacticalGrid: true,
  militaryMode: true,
  glassEffects: true,
  surveillanceMode: true,
  tacticalMap: true,
  realTimeFeeds: true,
  threatTracking: true,
  commandCenter: true
};

// Theme constants
export const THEME_MODES: readonly ThemeMode[] = [
  'light', 'dark', 'system', 'isac', 'defcon', 'overwatch', 'tactical'
] as const;

export const WALLPAPER_TYPES: readonly WallpaperType[] = [
  'tactical-grid-4k', 'urban-blueprint', 'steel-structure', 
  'construction-site', 'forest-landscape', 'ocean-view', 'none'
] as const;

export const DISPLAY_DENSITIES: readonly DisplayDensity[] = [
  'compact', 'comfortable', 'spacious'
] as const;

export const BORDER_RADII: readonly BorderRadius[] = [
  'none', 'small', 'medium', 'large', 'full'
] as const;

export const FONT_SIZES: readonly FontSize[] = [
  'small', 'medium', 'large', 'extra-large'
] as const;