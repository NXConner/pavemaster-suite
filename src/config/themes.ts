// ISAC-OS Theme Configuration
export interface ISACTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
  effects: {
    glow: string;
    shadow: string;
    blur: string;
  };
}

export interface IndustryTheme {
  id: string;
  name: string;
  icon: string;
  industry: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface WallpaperImage {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  description: string;
  resolution: string;
  tags: string[];
}

export interface WallpaperCollection {
  id: string;
  name: string;
  description: string;
  images: WallpaperImage[];
}

export const INDUSTRY_THEMES: IndustryTheme[] = [
  {
    id: 'isac-os',
    name: 'ISAC-OS Tactical',
    icon: '🔶',
    industry: 'Defense',
    description: 'Military-grade interface with Division cybernetic orange',
    colors: {
      primary: 'hsl(25, 100%, 60%)',
      secondary: 'hsl(33, 83%, 57%)',
      accent: 'hsl(40, 95%, 65%)',
      background: 'hsl(220, 15%, 8%)',
      foreground: 'hsl(0, 0%, 95%)',
      muted: 'hsl(0, 0%, 65%)',
      border: 'hsl(25, 50%, 35%)',
    },
    fonts: {
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif',
    },
  },
  {
    id: 'construction',
    name: 'Construction Pro',
    icon: '🚧',
    industry: 'Construction',
    description: 'Professional theme for construction and paving operations',
    colors: {
      primary: 'hsl(40, 80%, 50%)',
      secondary: 'hsl(20, 70%, 45%)',
      accent: 'hsl(0, 80%, 60%)',
      background: 'hsl(40, 15%, 95%)',
      foreground: 'hsl(20, 20%, 15%)',
      muted: 'hsl(20, 10%, 60%)',
      border: 'hsl(40, 20%, 80%)',
    },
    fonts: {
      heading: '"Roboto", sans-serif',
      body: '"Open Sans", sans-serif',
    },
  },
];

export const WALLPAPER_COLLECTIONS: WallpaperCollection[] = [
  {
    id: 'tactical',
    name: 'Tactical Operations',
    description: 'Professional military-grade backgrounds',
    images: [
      {
        id: 'tactical-1',
        name: 'Grid Pattern',
        url: '/wallpapers/tactical-grid-4k.jpg',
        description: 'Clean grid pattern for tactical displays',
        resolution: '4K',
        tags: ['grid', 'minimal', 'tactical'],
      },
    ],
  },
];

export const ISAC_OS_THEME: ISACTheme = {
  id: 'isac-os',
  name: 'ISAC-OS Tactical',
  colors: {
    primary: 'hsl(25, 100%, 60%)', // Division cybernetic orange
    secondary: 'hsl(33, 83%, 57%)', // Secondary division amber
    accent: 'hsl(40, 95%, 65%)', // Bright tactical amber
    background: 'hsl(220, 15%, 8%)', // Dark tactical
    surface: 'hsl(220, 15%, 12%)', // Slightly lighter
    text: 'hsl(0, 0%, 95%)', // High contrast white
    muted: 'hsl(0, 0%, 65%)', // Muted text
    border: 'hsl(25, 50%, 35%)', // Orange tactical border
    success: 'hsl(120, 100%, 40%)', // Success green
    warning: 'hsl(45, 100%, 50%)', // Warning amber
    error: 'hsl(0, 100%, 50%)', // Error red
    info: 'hsl(25, 100%, 60%)', // Info orange (matching primary)
  },
  fonts: {
    primary: '"Inter", "Segoe UI", system-ui, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  effects: {
    glow: '0 0 20px hsl(200, 100%, 50%, 0.3)',
    shadow: '0 4px 20px hsl(220, 15%, 0%, 0.5)',
    blur: 'blur(8px)',
  },
};

export const applyISACTheme = () => {
  const root = document.documentElement;
  const theme = ISAC_OS_THEME;
  
  // Apply CSS custom properties
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--surface', theme.colors.surface);
  root.style.setProperty('--foreground', theme.colors.text);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--destructive', theme.colors.error);
  root.style.setProperty('--info', theme.colors.info);
  
  // Apply font family
  root.style.setProperty('--font-sans', theme.fonts.primary);
  root.style.setProperty('--font-mono', theme.fonts.mono);
  
  // Apply effects
  root.style.setProperty('--glow', theme.effects.glow);
  root.style.setProperty('--shadow', theme.effects.shadow);
  root.style.setProperty('--blur', theme.effects.blur);
  
  // Add tactical class to body
  document.body.classList.add('isac-os-theme');
  
  localStorage.setItem('theme', 'isac-os');
};