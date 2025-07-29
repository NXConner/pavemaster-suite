// Theme system type definitions

export interface Theme {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  is_system: boolean;
}

export interface Wallpaper {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  is_system: boolean;
}

export interface UserPreferences {
  theme_id?: string;
  wallpaper_id?: string;
  theme_mode: 'light' | 'dark' | 'system';
  custom_settings?: CustomThemeSettings;
}

export interface CustomThemeSettings {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  font_size?: 'small' | 'medium' | 'large';
  border_radius?: 'none' | 'small' | 'medium' | 'large';
  animations_enabled?: boolean;
  high_contrast?: boolean;
}

export interface ThemeContextType {
  currentTheme: Theme | null;
  currentWallpaper: Wallpaper | null;
  userPreferences: UserPreferences;
  themes: Theme[];
  wallpapers: Wallpaper[];
  loading: boolean;
  updateTheme: (themeId: string) => Promise<void>;
  updateWallpaper: (wallpaperId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}