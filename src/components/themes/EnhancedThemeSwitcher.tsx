import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Palette,
  Monitor,
  Smartphone,
  Settings,
  Crown,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';
import { advancedThemes, getThemeById } from '../../config/advanced-themes';
import { ISAC_OS_THEME, applyISACTheme } from '../../config/themes';
import { ThemeCustomizer } from './ThemeCustomizer';

export function EnhancedThemeSwitcher() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedTheme, setSelectedTheme] = useState<string>('isac-os');
  const [previewMode, setPreviewMode] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    animations: true,
    reducedMotion: false,
    fontSize: 16,
    contrastMode: false,
    compactMode: false,
  });

  const applyTheme = (themeId: string) => {
    if (themeId === 'isac-os') {
      applyISACTheme();
    } else {
      const theme = getThemeById(themeId);
      if (theme) {
        const root = document.documentElement;
        // Apply theme colors to CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, String(value));
        });
        // Store theme selection
        localStorage.setItem('theme', themeId);
      }
    }
    setSelectedTheme(themeId);
  };

  const exportThemeConfig = (themeId: string) => {
    const theme = themeId === 'isac-os' ? ISAC_OS_THEME : getThemeById(themeId);
    if (theme) {
      const config = JSON.stringify(theme, null, 2);
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${themeId}-theme-config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Theme System</h2>
          <p className="text-muted-foreground">
            ISAC-OS tactical themes with advanced customization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => { setPreviewMode(!previewMode); }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview Mode'}
          </Button>
          <Button onClick={() => { exportThemeConfig(selectedTheme); }}>
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gallery">
            <Palette className="h-4 w-4 mr-2" />
            Theme Gallery
          </TabsTrigger>
          <TabsTrigger value="customizer">
            <Settings className="h-4 w-4 mr-2" />
            Customizer
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Eye className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Monitor className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          {/* ISAC-OS Theme */}
          <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Crown className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      ISAC-OS Tactical
                      <Badge className="bg-orange-500 text-white">SIGNATURE</Badge>
                    </CardTitle>
                    <CardDescription>
                      Military-grade interface with Division cybernetic orange
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => { applyTheme('isac-os'); }}
                  variant={selectedTheme === 'isac-os' ? 'default' : 'outline'}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {selectedTheme === 'isac-os' ? 'Active' : 'Apply'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2 mb-4">
                {Object.entries(ISAC_OS_THEME.colors).slice(0, 8).map(([key, color]) => (
                  <div
                    key={key}
                    className="h-8 rounded border"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>🎖️ Veteran-Designed</span>
                <span>🔶 Division Orange</span>
                <span>⚡ High Performance</span>
                <span>🛡️ Tactical Interface</span>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Themes */}
          <div className="grid gap-4 md:grid-cols-2">
            {advancedThemes.map((theme) => (
              <Card key={theme.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {theme.name}
                        {theme.isPremium && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Sparkles className="h-3 w-3 mr-1" />
                            PREMIUM
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{theme.description}</CardDescription>
                      <Badge variant="secondary" className="mt-1 w-fit">
                        {theme.category}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => { applyTheme(theme.id); }}
                      variant={selectedTheme === theme.id ? 'default' : 'outline'}
                      size="sm"
                    >
                      {selectedTheme === theme.id ? 'Active' : 'Apply'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 mb-3">
                    {Object.entries(theme.colors).slice(0, 8).map(([key, color]) => (
                      <div
                        key={key}
                        className="h-6 rounded border"
                        style={{ backgroundColor: color }}
                        title={key}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Font: {theme.typography?.fontFamily?.split(',')[0]?.replace(/"/g, '') || 'Default'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customizer" className="space-y-6">
          <ThemeCustomizer
            onThemeChange={(theme) => {
              // Handle custom theme application
              console.log('Custom theme applied:', theme);
            }}
          />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visual Accessibility</CardTitle>
                <CardDescription>Customize visual settings for better accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contrast-mode">High Contrast Mode</Label>
                  <Switch
                    id="contrast-mode"
                    checked={customSettings.contrastMode}
                    onCheckedChange={(checked) => { setCustomSettings(prev => ({ ...prev, contrastMode: checked })); }
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <Switch
                    id="reduced-motion"
                    checked={customSettings.reducedMotion}
                    onCheckedChange={(checked) => { setCustomSettings(prev => ({ ...prev, reducedMotion: checked })); }
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size: {customSettings.fontSize}px</Label>
                  <div className="px-3">
                    <input
                      type="range"
                      id="font-size"
                      min={12}
                      max={24}
                      step={1}
                      value={customSettings.fontSize}
                      onChange={(e) => { setCustomSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) })); }
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interface Preferences</CardTitle>
                <CardDescription>Customize interface behavior and layout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Enable Animations</Label>
                  <Switch
                    id="animations"
                    checked={customSettings.animations}
                    onCheckedChange={(checked) => { setCustomSettings(prev => ({ ...prev, animations: checked })); }
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <Switch
                    id="compact-mode"
                    checked={customSettings.compactMode}
                    onCheckedChange={(checked) => { setCustomSettings(prev => ({ ...prev, compactMode: checked })); }
                    }
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">WCAG 2.1 AA Compliant</p>
                  <p className="text-xs text-muted-foreground">
                    All themes meet accessibility standards
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Theme Preview</h3>
            <p className="text-sm text-muted-foreground">
              Selected theme: {selectedTheme}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Theme Optimization
              </CardTitle>
              <CardDescription>
                Themes optimized for mobile and tablet devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="aspect-[9/16] bg-muted rounded-lg p-4 relative">
                  <div className="text-xs font-medium mb-2">iPhone 14 Pro</div>
                  <div className="bg-background rounded border h-full p-2">
                    <div className="bg-primary h-8 rounded mb-2"></div>
                    <div className="space-y-1">
                      <div className="bg-muted h-3 rounded"></div>
                      <div className="bg-muted h-3 rounded w-3/4"></div>
                      <div className="bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="aspect-[3/4] bg-muted rounded-lg p-4 relative">
                  <div className="text-xs font-medium mb-2">iPad Pro</div>
                  <div className="bg-background rounded border h-full p-3">
                    <div className="bg-primary h-6 rounded mb-3"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted h-12 rounded"></div>
                      <div className="bg-muted h-12 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="aspect-[16/9] bg-muted rounded-lg p-4 relative">
                  <div className="text-xs font-medium mb-2">Desktop</div>
                  <div className="bg-background rounded border h-full p-2">
                    <div className="flex gap-2">
                      <div className="bg-primary h-16 rounded flex-1"></div>
                      <div className="bg-muted h-16 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}