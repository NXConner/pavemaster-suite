import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { 
  Download, 
  Upload, 
  Save, 
  Eye, 
  Trash2,
  Paintbrush,
  RotateCcw,
  Check,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    destructive: string;
    warning: string;
    success: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  layout: {
    borderRadius: string;
    spacing: string;
    density: 'compact' | 'comfortable' | 'spacious';
  };
  effects: {
    shadows: boolean;
    animations: boolean;
    glass: boolean;
    gradient: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

const defaultThemes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default Light',
    description: 'Clean and modern light theme',
    colors: {
      primary: 'hsl(221.2, 83.2%, 53.3%)',
      secondary: 'hsl(210, 40%, 96%)',
      accent: 'hsl(210, 40%, 96%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      muted: 'hsl(210, 40%, 96%)',
      destructive: 'hsl(0, 84.2%, 60.2%)',
      warning: 'hsl(38, 92%, 50%)',
      success: 'hsl(142, 76%, 36%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: '400',
    },
    layout: {
      borderRadius: '6px',
      spacing: '16px',
      density: 'comfortable',
    },
    effects: {
      shadows: true,
      animations: true,
      glass: false,
      gradient: false,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Professional dark theme with blue accents',
    colors: {
      primary: 'hsl(221.2, 83.2%, 53.3%)',
      secondary: 'hsl(217.2, 32.6%, 17.5%)',
      accent: 'hsl(217.2, 32.6%, 17.5%)',
      background: 'hsl(222.2, 84%, 4.9%)',
      foreground: 'hsl(210, 40%, 98%)',
      muted: 'hsl(217.2, 32.6%, 17.5%)',
      destructive: 'hsl(0, 62.8%, 30.6%)',
      warning: 'hsl(38, 92%, 50%)',
      success: 'hsl(142, 76%, 36%)',
      border: 'hsl(217.2, 32.6%, 17.5%)',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: '400',
    },
    layout: {
      borderRadius: '6px',
      spacing: '16px',
      density: 'comfortable',
    },
    effects: {
      shadows: true,
      animations: true,
      glass: true,
      gradient: false,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
    },
  },
  {
    id: 'tactical',
    name: 'Tactical Command',
    description: 'Military-inspired tactical interface',
    colors: {
      primary: 'hsl(200, 100%, 50%)',
      secondary: 'hsl(220, 15%, 12%)',
      accent: 'hsl(60, 100%, 50%)',
      background: 'hsl(220, 15%, 8%)',
      foreground: 'hsl(0, 0%, 95%)',
      muted: 'hsl(220, 15%, 12%)',
      destructive: 'hsl(0, 100%, 50%)',
      warning: 'hsl(45, 100%, 50%)',
      success: 'hsl(120, 100%, 40%)',
      border: 'hsl(200, 50%, 25%)',
    },
    typography: {
      fontFamily: 'JetBrains Mono',
      fontSize: '14px',
      fontWeight: '500',
    },
    layout: {
      borderRadius: '2px',
      spacing: '12px',
      density: 'compact',
    },
    effects: {
      shadows: true,
      animations: true,
      glass: true,
      gradient: true,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
    },
  },
  {
    id: 'construction',
    name: 'Construction Pro',
    description: 'Professional construction industry theme',
    colors: {
      primary: 'hsl(40, 80%, 50%)',
      secondary: 'hsl(40, 15%, 95%)',
      accent: 'hsl(0, 80%, 60%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(20, 20%, 15%)',
      muted: 'hsl(40, 15%, 95%)',
      destructive: 'hsl(0, 84.2%, 60.2%)',
      warning: 'hsl(38, 92%, 50%)',
      success: 'hsl(142, 76%, 36%)',
      border: 'hsl(40, 20%, 80%)',
    },
    typography: {
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: '400',
    },
    layout: {
      borderRadius: '8px',
      spacing: '18px',
      density: 'spacious',
    },
    effects: {
      shadows: true,
      animations: true,
      glass: false,
      gradient: false,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
    },
  },
];

export function EnhancedThemeCustomizer() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultThemes[0]!);
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [importText, setImportText] = useState('');

  // Apply theme to CSS variables
  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-size', theme.typography.fontSize);
    root.style.setProperty('--font-weight', theme.typography.fontWeight);

    // Apply layout
    root.style.setProperty('--radius', theme.layout.borderRadius);
    root.style.setProperty('--spacing', theme.layout.spacing);

    // Apply effects
    root.classList.toggle('no-shadows', !theme.effects.shadows);
    root.classList.toggle('no-animations', !theme.effects.animations);
    root.classList.toggle('glass-effects', theme.effects.glass);
    root.classList.toggle('gradient-effects', theme.effects.gradient);

    // Apply accessibility
    root.classList.toggle('high-contrast', theme.accessibility.highContrast);
    root.classList.toggle('reduced-motion', theme.accessibility.reducedMotion);
    root.classList.toggle('large-text', theme.accessibility.largeText);

    // Save to localStorage
    localStorage.setItem('current-theme', JSON.stringify(theme));
  };

  // Update theme property
  const updateThemeProperty = (path: string, value: any) => {
    setCurrentTheme(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (current && current[keys[i]!]) {
          current = current[keys[i]!];
        }
      }
      const lastKey = keys[keys.length - 1];
      if (current && lastKey) {
        current[lastKey] = value;
      }
      
      return updated;
    });
    setIsDirty(true);
  };

  // Color conversion utilities
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#000000';

    let h = parseInt(match[1]!) / 360;
    let s = parseInt(match[2]!) / 100;
    let l = parseInt(match[3]!) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Save custom theme
  const saveCustomTheme = () => {
    const newTheme = {
      ...currentTheme,
      id: `custom-${Date.now()}`,
      name: currentTheme.name || `Custom Theme ${customThemes.length + 1}`,
    };

    setCustomThemes(prev => [...prev, newTheme]);
    localStorage.setItem('custom-themes', JSON.stringify([...customThemes, newTheme]));
    setIsDirty(false);
    
    toast('Theme saved successfully!');
  };

  // Export theme
  const exportTheme = () => {
    const dataStr = JSON.stringify(currentTheme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTheme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast('Theme exported successfully!');
  };

  // Import theme
  const importTheme = () => {
    try {
      const imported = JSON.parse(importText);
      setCurrentTheme(imported);
      setImportText('');
      setIsDirty(true);
      toast('Theme imported successfully!');
    } catch {
      toast('Invalid theme format!');
    }
  };

  // Generate random theme
  const generateRandomTheme = () => {
    const hue = Math.floor(Math.random() * 360);
    const randomTheme: ThemeConfig = {
      ...currentTheme,
      id: `random-${Date.now()}`,
      name: `Random Theme ${Date.now()}`,
      colors: {
        ...currentTheme.colors,
        primary: `hsl(${hue}, 70%, 50%)`,
        secondary: `hsl(${(hue + 120) % 360}, 20%, 90%)`,
        accent: `hsl(${(hue + 240) % 360}, 80%, 60%)`,
      },
    };
    
    setCurrentTheme(randomTheme);
    setIsDirty(true);
    toast('Random theme generated!');
  };

  // Apply theme when it changes in preview mode
  useEffect(() => {
    if (previewMode) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, previewMode]);

  // Load saved themes on mount
  useEffect(() => {
    const saved = localStorage.getItem('custom-themes');
    if (saved) {
      try {
        setCustomThemes(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom themes:', error);
      }
    }

    const currentSaved = localStorage.getItem('current-theme');
    if (currentSaved) {
      try {
        const savedTheme = JSON.parse(currentSaved);
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Failed to load current theme:', error);
      }
    }
  }, []);

  const allThemes = [...defaultThemes, ...customThemes];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Enhanced Theme Customizer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isDirty ? "destructive" : "secondary"}>
                {isDirty ? "Unsaved Changes" : "Saved"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Exit Preview" : "Live Preview"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allThemes.map((theme) => (
                  <Card 
                    key={theme.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      currentTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setCurrentTheme(theme);
                      setIsDirty(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{theme.name}</h4>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        {currentTheme.id === theme.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex gap-1 mb-3">
                        {Object.entries(theme.colors).slice(0, 5).map(([key, value]) => (
                          <div
                            key={key}
                            className="w-6 h-6 rounded border-2 border-white shadow-sm"
                            style={{ backgroundColor: value }}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentTheme(theme);
                            applyTheme(theme);
                            setIsDirty(false);
                          }}
                        >
                          Apply
                        </Button>
                        {customThemes.some(t => t.id === theme.id) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomThemes(prev => prev.filter(t => t.id !== theme.id));
                              localStorage.setItem('custom-themes', JSON.stringify(customThemes.filter(t => t.id !== theme.id)));
                              toast('Theme deleted!');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={generateRandomTheme}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCurrentTheme(defaultThemes[0]!)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentTheme.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-white shadow-sm"
                        style={{ backgroundColor: value }}
                      />
                      <Input
                        type="color"
                        value={hslToHex(value)}
                        onChange={(e) => updateThemeProperty(`colors.${key}`, hexToHsl(e.target.value))}
                        className="w-16 h-8 p-0 border-0"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateThemeProperty(`colors.${key}`, e.target.value)}
                        className="font-mono text-sm"
                        placeholder="hsl(...)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Font Family</Label>
                    <Select
                      value={currentTheme.typography.fontFamily}
                      onValueChange={(value) => updateThemeProperty('typography.fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                        <SelectItem value="Fira Code">Fira Code</SelectItem>
                        <SelectItem value="system-ui">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Font Size</Label>
                    <Input
                      value={currentTheme.typography.fontSize}
                      onChange={(e) => updateThemeProperty('typography.fontSize', e.target.value)}
                      placeholder="14px"
                    />
                  </div>

                  <div>
                    <Label>Font Weight</Label>
                    <Select
                      value={currentTheme.typography.fontWeight}
                      onValueChange={(value) => updateThemeProperty('typography.fontWeight', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Normal (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semibold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Typography Preview</h4>
                  <div
                    style={{
                      fontFamily: currentTheme.typography.fontFamily,
                      fontSize: currentTheme.typography.fontSize,
                      fontWeight: currentTheme.typography.fontWeight,
                    }}
                  >
                    <h1 className="text-2xl font-bold mb-2">Heading 1</h1>
                    <h2 className="text-xl font-semibold mb-2">Heading 2</h2>
                    <p className="mb-2">
                      This is a paragraph of body text to demonstrate typography settings.
                    </p>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      Code example
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Border Radius</Label>
                    <Input
                      value={currentTheme.layout.borderRadius}
                      onChange={(e) => updateThemeProperty('layout.borderRadius', e.target.value)}
                      placeholder="6px"
                    />
                  </div>

                  <div>
                    <Label>Spacing</Label>
                    <Input
                      value={currentTheme.layout.spacing}
                      onChange={(e) => updateThemeProperty('layout.spacing', e.target.value)}
                      placeholder="16px"
                    />
                  </div>

                  <div>
                    <Label>Density</Label>
                    <Select
                      value={currentTheme.layout.density}
                      onValueChange={(value) => updateThemeProperty('layout.density', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card style={{ borderRadius: currentTheme.layout.borderRadius }}>
                    <CardContent style={{ padding: currentTheme.layout.spacing }}>
                      <h4 className="font-medium mb-2">Preview Card</h4>
                      <p className="text-sm text-muted-foreground">
                        This demonstrates current layout settings.
                      </p>
                      <Button className="mt-2" size="sm">Sample Button</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Effects Tab */}
            <TabsContent value="effects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Visual Effects</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>Shadows</Label>
                    <Switch
                      checked={currentTheme.effects.shadows}
                      onCheckedChange={(checked) => updateThemeProperty('effects.shadows', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Animations</Label>
                    <Switch
                      checked={currentTheme.effects.animations}
                      onCheckedChange={(checked) => updateThemeProperty('effects.animations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Glass Effects</Label>
                    <Switch
                      checked={currentTheme.effects.glass}
                      onCheckedChange={(checked) => updateThemeProperty('effects.glass', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Gradients</Label>
                    <Switch
                      checked={currentTheme.effects.gradient}
                      onCheckedChange={(checked) => updateThemeProperty('effects.gradient', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Accessibility</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>High Contrast</Label>
                    <Switch
                      checked={currentTheme.accessibility.highContrast}
                      onCheckedChange={(checked) => updateThemeProperty('accessibility.highContrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Reduced Motion</Label>
                    <Switch
                      checked={currentTheme.accessibility.reducedMotion}
                      onCheckedChange={(checked) => updateThemeProperty('accessibility.reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Large Text</Label>
                    <Switch
                      checked={currentTheme.accessibility.largeText}
                      onCheckedChange={(checked) => updateThemeProperty('accessibility.largeText', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Import/Export Section */}
          <div className="space-y-4">
            <h4 className="font-semibold">Import/Export</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Import Theme JSON</Label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste theme JSON here..."
                  rows={3}
                  className="mt-2"
                />
                <Button
                  onClick={importTheme}
                  disabled={!importText.trim()}
                  className="mt-2"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Export & Save</Label>
                <Button onClick={exportTheme} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Theme
                </Button>
                <Button onClick={saveCustomTheme} disabled={!isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Custom Theme
                </Button>
                <Button 
                  onClick={() => {
                    applyTheme(currentTheme);
                    setIsDirty(false);
                    toast('Theme applied!');
                  }}
                  disabled={!isDirty}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Current Theme
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}