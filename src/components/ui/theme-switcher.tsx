import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Shield, Crosshair, Satellite, Command, Palette, Sparkles, Eye, Settings } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Slider } from './slider';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  class: string;
  wallpaper: string;
  category: 'tactical' | 'business' | 'creative' | 'accessibility';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  effects: {
    animations: boolean;
    glassmorphism: boolean;
    glow: boolean;
    particles: boolean;
  };
}

interface EffectSettings {
  animationSpeed: number;
  glowIntensity: number;
  blurAmount: number;
  particleCount: number;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const THEME_CONFIGURATIONS: ThemeConfig[] = [
  {
    id: 'isac-os',
    name: 'ISAC-OS Tactical',
    description: 'Military-grade interface with Division cybernetic orange',
    icon: Shield,
    class: 'theme-isac-os',
    wallpaper: 'tactical-grid',
    category: 'tactical',
    colors: {
      primary: 'hsl(25, 100%, 60%)',
      secondary: 'hsl(33, 83%, 57%)',
      accent: 'hsl(40, 95%, 65%)',
      background: 'hsl(220, 15%, 8%)',
      foreground: 'hsl(0, 0%, 95%)',
    },
    effects: {
      animations: true,
      glassmorphism: true,
      glow: true,
      particles: true,
    },
  },
  {
    id: 'defcon-tactical',
    name: 'DEFCON Critical',
    description: 'Defense Readiness Condition Military Interface',
    icon: Crosshair,
    class: 'theme-defcon',
    wallpaper: 'military-grid',
    category: 'tactical',
    colors: {
      primary: 'hsl(0, 100%, 50%)',
      secondary: 'hsl(45, 100%, 50%)',
      accent: 'hsl(120, 100%, 50%)',
      background: 'hsl(0, 5%, 10%)',
      foreground: 'hsl(0, 0%, 90%)',
    },
    effects: {
      animations: true,
      glassmorphism: false,
      glow: true,
      particles: false,
    },
  },
  {
    id: 'overwatch-command',
    name: 'OverWatch Command',
    description: 'Tactical Operations Strategic Surveillance',
    icon: Satellite,
    class: 'theme-overwatch',
    wallpaper: 'command-center',
    category: 'tactical',
    colors: {
      primary: 'hsl(30, 100%, 50%)',
      secondary: 'hsl(220, 100%, 50%)',
      accent: 'hsl(300, 100%, 70%)',
      background: 'hsl(220, 15%, 8%)',
      foreground: 'hsl(0, 0%, 92%)',
    },
    effects: {
      animations: true,
      glassmorphism: true,
      glow: true,
      particles: true,
    },
  },
  {
    id: 'business-pro',
    name: 'Business Professional',
    description: 'Clean, professional interface for business use',
    icon: Command,
    class: 'theme-business',
    wallpaper: 'minimal-clean',
    category: 'business',
    colors: {
      primary: 'hsl(213, 84%, 22%)',
      secondary: 'hsl(210, 15%, 70%)',
      accent: 'hsl(25, 100%, 60%)',
      background: 'hsl(0, 0%, 98%)',
      foreground: 'hsl(220, 15%, 15%)',
    },
    effects: {
      animations: true,
      glassmorphism: false,
      glow: false,
      particles: false,
    },
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    description: 'Vibrant, creative interface with gradient effects',
    icon: Palette,
    class: 'theme-creative',
    wallpaper: 'gradient-mesh',
    category: 'creative',
    colors: {
      primary: 'hsl(280, 100%, 60%)',
      secondary: 'hsl(200, 100%, 60%)',
      accent: 'hsl(320, 100%, 70%)',
      background: 'hsl(240, 20%, 12%)',
      foreground: 'hsl(0, 0%, 95%)',
    },
    effects: {
      animations: true,
      glassmorphism: true,
      glow: true,
      particles: true,
    },
  },
  {
    id: 'accessibility-high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for accessibility',
    icon: Eye,
    class: 'theme-high-contrast',
    wallpaper: 'none',
    category: 'accessibility',
    colors: {
      primary: 'hsl(60, 100%, 50%)',
      secondary: 'hsl(0, 0%, 100%)',
      accent: 'hsl(120, 100%, 50%)',
      background: 'hsl(0, 0%, 0%)',
      foreground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      animations: false,
      glassmorphism: false,
      glow: false,
      particles: false,
    },
  },
];

const WALLPAPER_CONFIGURATIONS = [
  { id: 'tactical-grid', name: 'Tactical Grid', file: 'tactical-grid-4k.jpg', category: 'tactical' },
  { id: 'military-grid', name: 'Military Grid', file: 'military-grid-4k.jpg', category: 'tactical' },
  { id: 'command-center', name: 'Command Center', file: 'command-center-4k.jpg', category: 'tactical' },
  { id: 'construction-blueprint', name: 'Construction Blueprint', file: 'construction-blueprint-4k.jpg', category: 'business' },
  { id: 'asphalt-texture', name: 'Asphalt Texture', file: 'fresh-asphalt-texture-4k.jpg', category: 'business' },
  { id: 'paving-operations', name: 'Paving Operations', file: 'asphalt-paving-machine-4k.jpg', category: 'business' },
  { id: 'gradient-mesh', name: 'Gradient Mesh', file: 'gradient-mesh-4k.jpg', category: 'creative' },
  { id: 'minimal-clean', name: 'Minimal Clean', file: 'minimal-clean-4k.jpg', category: 'business' },
  { id: 'none', name: 'No Wallpaper', file: '', category: 'accessibility' },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('isac-os');
  const [currentWallpaper, setCurrentWallpaper] = useState('tactical-grid');
  const [darkMode, setDarkMode] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    animationSpeed: 100,
    glowIntensity: 50,
    blurAmount: 8,
    particleCount: 50,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    colorBlindMode: 'none',
  });

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'isac-os';
    const savedWallpaper = localStorage.getItem('wallpaper') || 'tactical-grid';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedEffects = localStorage.getItem('effectSettings');

    setCurrentTheme(savedTheme);
    setCurrentWallpaper(savedWallpaper);
    setDarkMode(savedDarkMode);
    
    if (savedEffects) {
      setEffectSettings(JSON.parse(savedEffects));
    }

    if (!previewMode) {
      applyTheme(savedTheme, savedWallpaper, savedDarkMode, savedEffects ? JSON.parse(savedEffects) : effectSettings);
    }
  }, []);

  const applyTheme = (themeId: string, wallpaperId: string, isDark: boolean, effects: EffectSettings) => {
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
      
      // Apply theme colors
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // Apply dark mode
    body.classList.toggle('dark', isDark);

    // Apply accessibility settings
    body.classList.toggle('reduced-motion', effects.reducedMotion);
    body.classList.toggle('high-contrast', effects.highContrast);
    body.classList.toggle('large-text', effects.largeText);
    
    // Apply color blind mode
    body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (effects.colorBlindMode !== 'none') {
      body.classList.add(effects.colorBlindMode);
    }

    // Apply wallpaper
    const selectedWallpaper = WALLPAPER_CONFIGURATIONS.find(w => w.id === wallpaperId);
    if (selectedWallpaper && selectedWallpaper.file) {
      body.style.backgroundImage = `url('/wallpapers/${selectedWallpaper.file}')`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.backgroundImage = 'none';
    }

    // Apply effect settings
    root.style.setProperty('--animation-speed', `${effects.animationSpeed}%`);
    root.style.setProperty('--glow-intensity', `${effects.glowIntensity / 100}`);
    root.style.setProperty('--blur-amount', `${effects.blurAmount}px`);
    root.style.setProperty('--particle-count', effects.particleCount.toString());

    // Save to localStorage if not in preview mode
    if (!previewMode) {
      localStorage.setItem('theme', themeId);
      localStorage.setItem('wallpaper', wallpaperId);
      localStorage.setItem('darkMode', isDark.toString());
      localStorage.setItem('effectSettings', JSON.stringify(effects));
    }
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    const theme = THEME_CONFIGURATIONS.find(t => t.id === themeId);
    if (theme) {
      setCurrentWallpaper(theme.wallpaper);
      applyTheme(themeId, theme.wallpaper, darkMode, effectSettings);
    }
  };

  const handleWallpaperChange = (wallpaperId: string) => {
    setCurrentWallpaper(wallpaperId);
    applyTheme(currentTheme, wallpaperId, darkMode, effectSettings);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(currentTheme, currentWallpaper, newDarkMode, effectSettings);
  };

  const handleEffectSettingChange = (key: keyof EffectSettings, value: any) => {
    const newSettings = { ...effectSettings, [key]: value };
    setEffectSettings(newSettings);
    applyTheme(currentTheme, currentWallpaper, darkMode, newSettings);
  };

  const startPreview = (themeId: string) => {
    setPreviewMode(true);
    const theme = THEME_CONFIGURATIONS.find(t => t.id === themeId);
    if (theme) {
      applyTheme(themeId, theme.wallpaper, darkMode, effectSettings);
    }
    
    // Reset preview after 3 seconds
    setTimeout(() => {
      setPreviewMode(false);
      applyTheme(currentTheme, currentWallpaper, darkMode, effectSettings);
    }, 3000);
  };

  const resetToDefaults = () => {
    const defaultSettings: EffectSettings = {
      animationSpeed: 100,
      glowIntensity: 50,
      blurAmount: 8,
      particleCount: 50,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      colorBlindMode: 'none',
    };
    setEffectSettings(defaultSettings);
    applyTheme(currentTheme, currentWallpaper, darkMode, defaultSettings);
  };

  const currentThemeConfig = THEME_CONFIGURATIONS.find(t => t.id === currentTheme);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gradient">Theme Customization</h3>
          <p className="text-sm text-muted-foreground">
            Personalize your interface with advanced theming options
          </p>
        </div>
        {previewMode && (
          <Badge variant="outline" className="animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            Preview Mode
          </Badge>
        )}
      </div>

      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {THEME_CONFIGURATIONS.map((theme) => (
              <Card
                key={theme.id}
                variant={currentTheme === theme.id ? 'neon' : 'default'}
                interactive
                tilt
                className={cn(
                  'relative overflow-hidden transition-all duration-300',
                  currentTheme === theme.id && 'ring-2 ring-primary'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <theme.icon className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-sm">{theme.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {theme.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {theme.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Color Preview */}
                  <div className="flex gap-1 mb-3">
                    {Object.entries(theme.colors).slice(0, 3).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: value }}
                        title={key}
                      />
                    ))}
                  </div>

                  {/* Effects Preview */}
                  <div className="flex gap-2 mb-3">
                    {theme.effects.animations && <Badge variant="outline" className="text-xs">Animated</Badge>}
                    {theme.effects.glassmorphism && <Badge variant="outline" className="text-xs">Glass</Badge>}
                    {theme.effects.glow && <Badge variant="outline" className="text-xs">Glow</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={currentTheme === theme.id ? 'default' : 'outline'}
                      onClick={() => handleThemeChange(theme.id)}
                      className="flex-1"
                    >
                      {currentTheme === theme.id ? 'Active' : 'Apply'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startPreview(theme.id)}
                      disabled={currentTheme === theme.id}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>

                {/* Theme indicator */}
                {currentTheme === theme.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallpapers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {WALLPAPER_CONFIGURATIONS.map((wallpaper) => (
              <Card
                key={wallpaper.id}
                interactive
                variant={currentWallpaper === wallpaper.id ? 'neon' : 'default'}
                onClick={() => handleWallpaperChange(wallpaper.id)}
                className={cn(
                  'aspect-video relative overflow-hidden',
                  currentWallpaper === wallpaper.id && 'ring-2 ring-primary'
                )}
              >
                {wallpaper.file ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/wallpapers/${wallpaper.file}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
                )}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-sm font-medium">{wallpaper.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {wallpaper.category}
                  </Badge>
                </div>
                {currentWallpaper === wallpaper.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Animation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Animation Speed</label>
                  <Slider
                    value={[effectSettings.animationSpeed]}
                    onValueChange={([value]) => handleEffectSettingChange('animationSpeed', value)}
                    max={200}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    {effectSettings.animationSpeed}% of normal speed
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Glow Intensity</label>
                  <Slider
                    value={[effectSettings.glowIntensity]}
                    onValueChange={([value]) => handleEffectSettingChange('glowIntensity', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blur Amount</label>
                  <Slider
                    value={[effectSettings.blurAmount]}
                    onValueChange={([value]) => handleEffectSettingChange('blurAmount', value)}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    {effectSettings.blurAmount}px blur radius
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Particle Count</label>
                  <Slider
                    value={[effectSettings.particleCount]}
                    onValueChange={([value]) => handleEffectSettingChange('particleCount', value)}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Reduced Motion</label>
                  <p className="text-xs text-muted-foreground">
                    Reduces animations for motion sensitivity
                  </p>
                </div>
                <Switch
                  checked={effectSettings.reducedMotion}
                  onCheckedChange={(checked) => handleEffectSettingChange('reducedMotion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">High Contrast</label>
                  <p className="text-xs text-muted-foreground">
                    Increases contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={effectSettings.highContrast}
                  onCheckedChange={(checked) => handleEffectSettingChange('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Large Text</label>
                  <p className="text-xs text-muted-foreground">
                    Increases font sizes throughout the interface
                  </p>
                </div>
                <Switch
                  checked={effectSettings.largeText}
                  onCheckedChange={(checked) => handleEffectSettingChange('largeText', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color Blind Support</label>
                <Select
                  value={effectSettings.colorBlindMode}
                  onValueChange={(value) => handleEffectSettingChange('colorBlindMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}