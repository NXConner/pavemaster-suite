import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface Wallpaper {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface ThemeContextType {
  theme: Theme;
  wallpaper: string | null;
  availableWallpapers: Wallpaper[];
  setTheme: (theme: Theme) => void;
  setWallpaper: (wallpaper: string | null) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const AVAILABLE_WALLPAPERS: Wallpaper[] = [
  {
    id: 'starry-night',
    name: 'Starry Night',
    image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1920&q=80',
    description: 'Blue starry night sky'
  },
  {
    id: 'orange-flowers',
    name: 'Orange Flowers',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80',
    description: 'Vibrant orange flowers'
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
    description: 'Black circuit board macro photography'
  },
  {
    id: 'mountain-rays',
    name: 'Mountain Rays',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42b?w=1920&q=80',
    description: 'Mountain landscape hit by sun rays'
  },
  {
    id: 'forest-sunbeam',
    name: 'Forest Sunbeam',
    image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=1920&q=80',
    description: 'Forest heated by sunbeam'
  },
  {
    id: 'foggy-mountain',
    name: 'Foggy Mountain',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    description: 'Foggy mountain summit'
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1920&q=80',
    description: 'Ocean wave at beach'
  }
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pavemaster-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      // Default to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [wallpaper, setWallpaperState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pavemaster-wallpaper');
    }
    return null;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply wallpaper
    if (wallpaper) {
      const wallpaperData = AVAILABLE_WALLPAPERS.find(w => w.id === wallpaper);
      if (wallpaperData) {
        root.style.setProperty('--wallpaper-image', `url(${wallpaperData.image})`);
        root.classList.add('has-wallpaper');
      }
    } else {
      root.style.removeProperty('--wallpaper-image');
      root.classList.remove('has-wallpaper');
    }
  }, [theme, wallpaper]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('pavemaster-theme', newTheme);
  };

  const setWallpaper = (newWallpaper: string | null) => {
    setWallpaperState(newWallpaper);
    if (newWallpaper) {
      localStorage.setItem('pavemaster-wallpaper', newWallpaper);
    } else {
      localStorage.removeItem('pavemaster-wallpaper');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        wallpaper,
        availableWallpapers: AVAILABLE_WALLPAPERS,
        setTheme,
        setWallpaper,
        toggleTheme,
      }}
    >
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