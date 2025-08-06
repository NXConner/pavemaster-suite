import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { 
  Palette, 
  Monitor, 
  Zap, 
  Settings, 
  Eye,
  Cpu,
  Shield,
  Target
} from 'lucide-react';

interface ISACThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'tactical' | 'operational' | 'strategic' | 'stealth';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  effects: {
    glowIntensity: number;
    animationSpeed: number;
    transparencyLevel: number;
    scanlineEffect: boolean;
    holographicOverlay: boolean;
  };
  wallpaper: string;
  soundProfile: string;
}

const ISAC_THEMES: ISACThemeConfig[] = [
  {
    id: 'tactical-orange',
    name: 'Tactical Orange',
    description: 'High-visibility tactical interface',
    category: 'tactical',
    colors: {
      primary: 'hsl(25, 95%, 53%)',
      secondary: 'hsl(25, 90%, 45%)',
      accent: 'hsl(45, 100%, 60%)',
      background: 'hsl(0, 0%, 8%)',
      surface: 'hsl(0, 0%, 12%)',
      text: 'hsl(0, 0%, 95%)',
      border: 'hsl(25, 70%, 35%)'
    },
    effects: {
      glowIntensity: 80,
      animationSpeed: 75,
      transparencyLevel: 15,
      scanlineEffect: true,
      holographicOverlay: true
    },
    wallpaper: '/wallpapers/tactical-grid-4k.jpg',
    soundProfile: 'tactical'
  },
  {
    id: 'stealth-blue',
    name: 'Stealth Blue',
    description: 'Low-profile operational interface',
    category: 'stealth',
    colors: {
      primary: 'hsl(210, 70%, 45%)',
      secondary: 'hsl(210, 60%, 35%)',
      accent: 'hsl(180, 80%, 50%)',
      background: 'hsl(220, 20%, 6%)',
      surface: 'hsl(220, 15%, 10%)',
      text: 'hsl(210, 30%, 85%)',
      border: 'hsl(210, 50%, 25%)'
    },
    effects: {
      glowIntensity: 40,
      animationSpeed: 50,
      transparencyLevel: 25,
      scanlineEffect: false,
      holographicOverlay: false
    },
    wallpaper: '/wallpapers/urban-blueprint.jpg',
    soundProfile: 'stealth'
  },
  {
    id: 'command-red',
    name: 'Command Red',
    description: 'High-alert command interface',
    category: 'strategic',
    colors: {
      primary: 'hsl(0, 85%, 55%)',
      secondary: 'hsl(0, 75%, 45%)',
      accent: 'hsl(15, 100%, 65%)',
      background: 'hsl(0, 10%, 5%)',
      surface: 'hsl(0, 15%, 8%)',
      text: 'hsl(0, 5%, 92%)',
      border: 'hsl(0, 60%, 30%)'
    },
    effects: {
      glowIntensity: 90,
      animationSpeed: 85,
      transparencyLevel: 10,
      scanlineEffect: true,
      holographicOverlay: true
    },
    wallpaper: '/wallpapers/steel-structure.jpg',
    soundProfile: 'command'
  }
];

export function ISACOSThemeEngine() {
  const defaultTheme = ISAC_THEMES[0]!; // We know it exists
  const [currentTheme, setCurrentTheme] = useState<ISACThemeConfig>(defaultTheme);
  const [customEffects, setCustomEffects] = useState(defaultTheme.effects);
  const [previewMode, setPreviewMode] = useState(false);

  const applyTheme = (theme: ISACThemeConfig, effects?: any) => {
    const finalEffects = effects || theme.effects;
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--isac-${key}`, value);
    });

    // Apply effect variables
    root.style.setProperty('--isac-glow-intensity', `${finalEffects.glowIntensity}%`);
    root.style.setProperty('--isac-animation-speed', `${finalEffects.animationSpeed}%`);
    root.style.setProperty('--isac-transparency', `${finalEffects.transparencyLevel}%`);
    
    // Apply wallpaper
    root.style.setProperty('--isac-wallpaper', `url('${theme.wallpaper}')`);

    // Apply body classes for effects
    document.body.classList.toggle('isac-scanlines', finalEffects.scanlineEffect);
    document.body.classList.toggle('isac-holographic', finalEffects.holographicOverlay);
    document.body.classList.add(`isac-theme-${theme.category}`);

    // Save to localStorage
    localStorage.setItem('isac-theme', JSON.stringify({
      theme: theme.id,
      customEffects: finalEffects
    }));
  };

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('isac-theme');
    if (saved) {
      try {
        const { theme: themeId, customEffects: savedEffects } = JSON.parse(saved);
        const theme = ISAC_THEMES.find(t => t.id === themeId);
        if (theme) {
          setCurrentTheme(theme);
          setCustomEffects(savedEffects || theme.effects);
          applyTheme(theme, savedEffects);
        } else {
          // Fallback to default theme if saved theme is not found
          applyTheme(defaultTheme);
        }
      } catch (error) {
        console.error('Error loading ISAC theme:', error);
        applyTheme(defaultTheme);
      }
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  const handleThemeChange = (themeId: string) => {
    const theme = ISAC_THEMES.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setCustomEffects(theme.effects);
      applyTheme(theme);
    }
  };

  const handleEffectChange = (key: string, value: any) => {
    const newEffects = { ...customEffects, [key]: value };
    setCustomEffects(newEffects);
    if (!previewMode) {
      applyTheme(currentTheme, newEffects);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tactical': return <Target className="h-4 w-4" />;
      case 'stealth': return <Shield className="h-4 w-4" />;
      case 'strategic': return <Cpu className="h-4 w-4" />;
      case 'operational': return <Monitor className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Theme Selection */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            ISAC-OS Theme Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {ISAC_THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${currentTheme.id === theme.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border/30 bg-surface/30 hover:border/60'
                  }
                `}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(theme.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{theme.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {theme.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {Object.values(theme.colors).slice(0, 4).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Effect Customization */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Visual Effects Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Glow Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Glow Intensity</label>
              <span className="text-xs text-muted-foreground">{customEffects.glowIntensity}%</span>
            </div>
            <Slider
              value={[customEffects.glowIntensity]}
              onValueChange={([value]) => handleEffectChange('glowIntensity', value)}
              className="w-full"
            />
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Animation Speed</label>
              <span className="text-xs text-muted-foreground">{customEffects.animationSpeed}%</span>
            </div>
            <Slider
              value={[customEffects.animationSpeed]}
              onValueChange={([value]) => handleEffectChange('animationSpeed', value)}
              className="w-full"
            />
          </div>

          {/* Transparency Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Transparency Level</label>
              <span className="text-xs text-muted-foreground">{customEffects.transparencyLevel}%</span>
            </div>
            <Slider
              value={[customEffects.transparencyLevel]}
              onValueChange={([value]) => handleEffectChange('transparencyLevel', value)}
              className="w-full"
            />
          </div>

          {/* Effect Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Scanline Effect</label>
              <Switch
                checked={customEffects.scanlineEffect}
                onCheckedChange={(checked) => handleEffectChange('scanlineEffect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Holographic Overlay</label>
              <Switch
                checked={customEffects.holographicOverlay}
                onCheckedChange={(checked) => handleEffectChange('holographicOverlay', checked)}
              />
            </div>
          </div>

          {/* Preview Mode */}
          <div className="pt-4 border-t border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <label className="text-sm font-medium">Preview Mode</label>
              </div>
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
            </div>
            {previewMode && (
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => applyTheme(currentTheme, customEffects)}
                >
                  Apply
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setCustomEffects(currentTheme.effects);
                    applyTheme(currentTheme);
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}