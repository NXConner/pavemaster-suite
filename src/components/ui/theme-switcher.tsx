import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Crosshair, Satellite, Command } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  class: string;
  wallpaper: string;
}

const THEME_CONFIGURATIONS: ThemeConfig[] = [
  {
    id: 'isac-os',
    name: 'ISAC-OS',
    description: 'Intelligent Strategic Analysis Command Operating System',
    icon: Shield,
    class: 'theme-isac-os',
    wallpaper: 'tactical-grid',
  },
  {
    id: 'defcon-tactical',
    name: 'DEFCON Tactical',
    description: 'Defense Readiness Condition Military Interface',
    icon: Crosshair,
    class: 'theme-defcon',
    wallpaper: 'military-grid',
  },
  {
    id: 'overwatch-command',
    name: 'OverWatch Command',
    description: 'Tactical Operations Strategic Surveillance',
    icon: Satellite,
    class: 'theme-overwatch',
    wallpaper: 'command-center',
  },
  {
    id: 'mission-control',
    name: 'Mission Control',
    description: 'Enterprise Command & Control Interface',
    icon: Command,
    class: 'theme-mission-control',
    wallpaper: 'construction-blueprint',
  },
];

const WALLPAPER_CONFIGURATIONS = [
  { id: 'tactical-grid', name: 'Tactical Grid', file: 'tactical-grid-4k.jpg' },
  { id: 'military-grid', name: 'Military Grid', file: 'military-grid-4k.jpg' },
  { id: 'command-center', name: 'Command Center', file: 'command-center-4k.jpg' },
  { id: 'construction-blueprint', name: 'Construction Blueprint', file: 'construction-blueprint-4k.jpg' },
  { id: 'asphalt-texture', name: 'Asphalt Texture', file: 'fresh-asphalt-texture-4k.jpg' },
  { id: 'paving-operations', name: 'Paving Operations', file: 'asphalt-paving-machine-4k.jpg' },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState('isac-os');
  const [wallpaper, setWallpaper] = useState('tactical-grid');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'isac-os';
    const savedWallpaper = localStorage.getItem('wallpaper') || 'tactical-grid';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    setTheme(savedTheme);
    setWallpaper(savedWallpaper);
    setDarkMode(savedDarkMode);

    applyTheme(savedTheme, savedWallpaper, savedDarkMode);
  }, []);

  const applyTheme = (themeId: string, wallpaperId: string, isDark: boolean) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    THEME_CONFIGURATIONS.forEach(config => {
      body.classList.remove(config.class);
    });

    // Apply selected theme
    const selectedTheme = THEME_CONFIGURATIONS.find(t => t.id === themeId);
    if (selectedTheme) {
      body.classList.add(selectedTheme.class);
    }

    // Apply dark mode
    if (isDark) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }

    // Apply wallpaper
    const selectedWallpaper = WALLPAPER_CONFIGURATIONS.find(w => w.id === wallpaperId);
    if (selectedWallpaper) {
      root.style.setProperty('--wallpaper-image', `url('/wallpapers/${selectedWallpaper.file}')`);
    }

    // Apply theme-specific CSS variables
    applyThemeVariables(themeId, isDark);
  };

  const applyThemeVariables = (themeId: string, isDark: boolean) => {
    const root = document.documentElement;

    const themeVariables = {
      'isac-os': {
        light: {
          '--primary': '25 100% 60%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '33 83% 57%',
          '--accent': '40 95% 65%',
          '--background': '220 15% 5%',
          '--foreground': '0 0% 95%',
          '--card': '220 15% 8%',
          '--border': '25 50% 35%',
        },
        dark: {
          '--primary': '25 100% 65%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '33 83% 62%',
          '--accent': '40 95% 70%',
          '--background': '220 15% 3%',
          '--foreground': '0 0% 98%',
          '--card': '220 15% 6%',
          '--border': '25 50% 30%',
        },
      },
      'defcon-tactical': {
        light: {
          '--primary': '0 100% 50%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '45 100% 50%',
          '--accent': '120 100% 50%',
          '--background': '0 5% 10%',
          '--foreground': '0 0% 90%',
          '--card': '0 5% 15%',
          '--border': '0 50% 25%',
        },
        dark: {
          '--primary': '0 100% 60%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '45 100% 60%',
          '--accent': '120 100% 60%',
          '--background': '0 5% 5%',
          '--foreground': '0 0% 95%',
          '--card': '0 5% 8%',
          '--border': '0 50% 20%',
        },
      },
      'overwatch-command': {
        light: {
          '--primary': '30 100% 50%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '220 100% 50%',
          '--accent': '300 100% 70%',
          '--background': '220 15% 8%',
          '--foreground': '0 0% 92%',
          '--card': '220 15% 12%',
          '--border': '220 30% 25%',
        },
        dark: {
          '--primary': '30 100% 60%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '220 100% 60%',
          '--accent': '300 100% 80%',
          '--background': '220 15% 4%',
          '--foreground': '0 0% 96%',
          '--card': '220 15% 7%',
          '--border': '220 30% 20%',
        },
      },
      'mission-control': {
        light: {
          '--primary': '32 95% 55%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '213 84% 22%',
          '--accent': '142 76% 36%',
          '--background': '220 13% 98%',
          '--foreground': '220 15% 15%',
          '--card': '0 0% 100%',
          '--border': '220 13% 91%',
        },
        dark: {
          '--primary': '32 95% 65%',
          '--primary-foreground': '0 0% 100%',
          '--secondary': '213 84% 32%',
          '--accent': '142 76% 46%',
          '--background': '220 15% 8%',
          '--foreground': '220 15% 95%',
          '--card': '220 15% 12%',
          '--border': '220 30% 25%',
        },
      },
    };

    const variables = themeVariables[themeId as keyof typeof themeVariables];
    const modeVariables = isDark ? variables.dark : variables.light;

    Object.entries(modeVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    const selectedTheme = THEME_CONFIGURATIONS.find(t => t.id === newTheme);
    if (selectedTheme) {
      setWallpaper(selectedTheme.wallpaper);
      localStorage.setItem('wallpaper', selectedTheme.wallpaper);
    }

    applyTheme(newTheme, selectedTheme?.wallpaper || wallpaper, darkMode);
  };

  const handleWallpaperChange = (newWallpaper: string) => {
    setWallpaper(newWallpaper);
    localStorage.setItem('wallpaper', newWallpaper);
    applyTheme(theme, newWallpaper, darkMode);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyTheme(theme, wallpaper, newDarkMode);
  };

  const selectedTheme = THEME_CONFIGURATIONS.find(t => t.id === theme);
  const selectedWallpaper = WALLPAPER_CONFIGURATIONS.find(w => w.id === wallpaper);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedTheme && <selectedTheme.icon className="h-5 w-5" />}
          Interface Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Command Interface</label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_CONFIGURATIONS.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Wallpaper Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Background Environment</label>
          <Select value={wallpaper} onValueChange={handleWallpaperChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WALLPAPER_CONFIGURATIONS.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Dark Operations Mode</label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDarkModeToggle}
            className="flex items-center gap-2"
          >
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {darkMode ? 'Dark' : 'Light'}
          </Button>
        </div>

        {/* Current Configuration Display */}
        <div className="p-3 bg-muted rounded-lg space-y-1">
          <div className="text-xs font-mono text-muted-foreground">ACTIVE CONFIGURATION</div>
          <div className="text-sm font-medium">{selectedTheme?.name}</div>
          <div className="text-xs text-muted-foreground">{selectedWallpaper?.name}</div>
          <div className="text-xs text-muted-foreground">Mode: {darkMode ? 'DARK OPS' : 'DAYLIGHT'}</div>
        </div>
      </CardContent>
    </Card>
  );
}