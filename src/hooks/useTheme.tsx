import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbTheme = Database['public']['Tables']['themes']['Row'];
type DbWallpaper = Database['public']['Tables']['wallpapers']['Row'];
type DbUserPreferences = Database['public']['Tables']['user_preferences']['Row'];

type Theme = {
  id: string;
  name: string;
  description?: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  is_system: boolean;
};

type Wallpaper = {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  is_system: boolean;
};

type ThemeMode = 'light' | 'dark' | 'system';

type UserPreferences = {
  theme_id?: string;
  wallpaper_id?: string;
  theme_mode: ThemeMode;
  custom_settings: Record<string, any>;
};

type ThemeContextType = {
  currentTheme: Theme | null;
  currentWallpaper: Wallpaper | null;
  themeMode: ThemeMode;
  themes: Theme[];
  wallpapers: Wallpaper[];
  preferences: UserPreferences | null;
  loading: boolean;
  setTheme: (themeId: string) => Promise<void>;
  setWallpaper: (wallpaperId: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  createCustomTheme: (theme: Omit<Theme, 'id' | 'is_system'>) => Promise<void>;
  uploadWallpaper: (file: File, name: string, description?: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
  refreshWallpapers: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme: Theme = {
  id: 'default',
  name: 'Construction Pro',
  description: 'Professional construction theme',
  colors: {
    light: {
      background: '220 13% 98%',
      foreground: '220 15% 15%',
      primary: '32 95% 55%',
      'primary-foreground': '0 0% 100%',
      secondary: '213 84% 22%',
      'secondary-foreground': '0 0% 100%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      primary: '32 95% 55%',
      'primary-foreground': '0 0% 100%',
      secondary: '217.2 32.6% 17.5%',
      'secondary-foreground': '210 40% 98%',
    }
  },
  is_system: true
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  const applyTheme = (theme: Theme, mode: ThemeMode) => {
    const root = document.documentElement;
    const actualMode = mode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;

    // Apply theme colors
    const colors = theme.colors[actualMode];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Set dark class
    if (actualMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Apply wallpaper to document
  const applyWallpaper = (wallpaper: Wallpaper | null) => {
    const root = document.documentElement;
    if (wallpaper) {
      root.style.setProperty('--wallpaper-url', `url('${wallpaper.image_url}')`);
      root.style.setProperty('background-image', `var(--wallpaper-url)`);
      root.style.setProperty('background-size', 'cover');
      root.style.setProperty('background-position', 'center');
      root.style.setProperty('background-attachment', 'fixed');
    } else {
      root.style.removeProperty('--wallpaper-url');
      root.style.removeProperty('background-image');
      root.style.removeProperty('background-size');
      root.style.removeProperty('background-position');
      root.style.removeProperty('background-attachment');
    }
  };

  // Load themes
  const refreshThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) throw error;
      const transformedThemes = (data || []).map((theme: DbTheme): Theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || undefined,
        colors: theme.colors as { light: Record<string, string>; dark: Record<string, string> },
        is_system: theme.is_system
      }));
      setThemes(transformedThemes);
    } catch (error) {
      console.error('Error loading themes:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading themes',
        description: 'Failed to load available themes'
      });
    }
  };

  // Load wallpapers
  const refreshWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) throw error;
      const transformedWallpapers = (data || []).map((wallpaper: DbWallpaper): Wallpaper => ({
        id: wallpaper.id,
        name: wallpaper.name,
        description: wallpaper.description || undefined,
        image_url: wallpaper.image_url,
        thumbnail_url: wallpaper.thumbnail_url || undefined,
        category: wallpaper.category,
        is_system: wallpaper.is_system
      }));
      setWallpapers(transformedWallpapers);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading wallpapers',
        description: 'Failed to load available wallpapers'
      });
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*, themes(*), wallpapers(*)')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          theme_id: data.theme_id || undefined,
          wallpaper_id: data.wallpaper_id || undefined,
          theme_mode: data.theme_mode as ThemeMode,
          custom_settings: (data.custom_settings as Record<string, any>) || {}
        });

        if (data.themes) {
          const theme: Theme = {
            id: data.themes.id,
            name: data.themes.name,
            description: data.themes.description || undefined,
            colors: data.themes.colors as { light: Record<string, string>; dark: Record<string, string> },
            is_system: data.themes.is_system
          };
          setCurrentTheme(theme);
        }
        if (data.wallpapers) {
          const wallpaper: Wallpaper = {
            id: data.wallpapers.id,
            name: data.wallpapers.name,
            description: data.wallpapers.description || undefined,
            image_url: data.wallpapers.image_url,
            thumbnail_url: data.wallpapers.thumbnail_url || undefined,
            category: data.wallpapers.category,
            is_system: data.wallpapers.is_system
          };
          setCurrentWallpaper(wallpaper);
        }
        setThemeModeState(data.theme_mode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        refreshThemes(),
        refreshWallpapers(),
        loadPreferences()
      ]);
      setLoading(false);
    };

    initialize();
  }, [user]);

  // Apply theme and wallpaper when they change
  useEffect(() => {
    applyTheme(currentTheme, themeMode);
  }, [currentTheme, themeMode]);

  useEffect(() => {
    applyWallpaper(currentWallpaper);
  }, [currentWallpaper]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => { applyTheme(currentTheme, themeMode); };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => { mediaQuery.removeEventListener('change', handleChange); };
    }
  }, [themeMode, currentTheme]);

  // Save preferences to database
  const savePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates } as UserPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving preferences',
        description: 'Failed to save your theme preferences'
      });
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);
    await savePreferences({ theme_id: themeId });

    toast({
      title: 'Theme updated',
      description: `Switched to ${theme.name} theme`
    });
  };

  const setWallpaper = async (wallpaperId: string) => {
    const wallpaper = wallpapers.find(w => w.id === wallpaperId);
    if (!wallpaper) return;

    setCurrentWallpaper(wallpaper);
    await savePreferences({ wallpaper_id: wallpaperId });

    toast({
      title: 'Wallpaper updated',
      description: `Switched to ${wallpaper.name} wallpaper`
    });
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await savePreferences({ theme_mode: mode });

    toast({
      title: 'Theme mode updated',
      description: `Switched to ${mode} mode`
    });
  };

  const createCustomTheme = async (theme: Omit<Theme, 'id' | 'is_system'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('themes')
        .insert({
          name: theme.name,
          description: theme.description,
          colors: theme.colors,
          created_by: user.id,
          is_public: false,
          is_system: false
        })
        .select()
        .single();

      if (error) throw error;

      await refreshThemes();
      toast({
        title: 'Custom theme created',
        description: `Created ${theme.name} theme`
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating theme',
        description: 'Failed to create custom theme'
      });
    }
  };

  const uploadWallpaper = async (file: File, name: string, description?: string) => {
    if (!user) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wallpapers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wallpapers')
        .getPublicUrl(fileName);

      // Save wallpaper record
      const { error } = await supabase
        .from('wallpapers')
        .insert({
          name,
          description,
          image_url: publicUrl,
          created_by: user.id,
          is_public: false,
          is_system: false,
          category: 'custom'
        });

      if (error) throw error;

      await refreshWallpapers();
      toast({
        title: 'Wallpaper uploaded',
        description: `Uploaded ${name} wallpaper`
      });
    } catch (error) {
      console.error('Error uploading wallpaper:', error);
      toast({
        variant: 'destructive',
        title: 'Error uploading wallpaper',
        description: 'Failed to upload wallpaper'
      });
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      currentWallpaper,
      themeMode,
      themes,
      wallpapers,
      preferences,
      loading,
      setTheme,
      setWallpaper,
      setThemeMode,
      createCustomTheme,
      uploadWallpaper,
      refreshThemes,
      refreshWallpapers
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}