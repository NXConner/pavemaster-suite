import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Palette,
  Download,
  Eye,
  Type,
  Layout,
  Sparkles,
  Zap,
  Copy,
  Save,
  Share2,
} from 'lucide-react';

interface ThemeCustomizerProps {
  onThemeChange?: (theme: any) => void;
}

export function ThemeCustomizer({ onThemeChange }: ThemeCustomizerProps) {
  // Use onThemeChange callback when theme is updated
  const handleThemeChange = (theme: any) => {
    onThemeChange?.(theme);
  };
  const [activeTab, setActiveTab] = useState('colors');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [customTheme, setCustomTheme] = useState({
    name: 'Custom Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      hero: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: {
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    effects: {
      blur: 'blur(8px)',
      shadow: 'soft',
    },
  });

  const colorCategories = [
    { key: 'primary', label: 'Primary', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary', description: 'Supporting color' },
    { key: 'accent', label: 'Accent', description: 'Highlight color' },
    { key: 'background', label: 'Background', description: 'Page background' },
    { key: 'surface', label: 'Surface', description: 'Card backgrounds' },
    { key: 'text', label: 'Text', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Text Secondary', description: 'Muted text color' },
    { key: 'border', label: 'Border', description: 'Border color' },
  ];

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern Sans)' },
    { value: 'Roboto', label: 'Roboto (Clean Sans)' },
    { value: 'Playfair Display', label: 'Playfair (Elegant Serif)' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono (Code)' },
    { value: 'Nunito', label: 'Nunito (Friendly Sans)' },
    { value: 'Orbitron', label: 'Orbitron (Futuristic)' },
  ];

  const animationPresets = [
    { value: '150ms', label: 'Fast (150ms)' },
    { value: '300ms', label: 'Medium (300ms)' },
    { value: '500ms', label: 'Slow (500ms)' },
    { value: '750ms', label: 'Very Slow (750ms)' },
  ];

  const easingOptions = [
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In-Out' },
    { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Material' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
  ];

  const updateColor = (colorKey: string, value: string) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value,
      },
    };
    setCustomTheme(updatedTheme);
    handleThemeChange(updatedTheme);
  };

  const generateGradient = (color1: string, color2: string) => {
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(customTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyThemeCode = () => {
    const themeCode = `// ${customTheme.name}
export const customTheme = ${JSON.stringify(customTheme, null, 2)};`;
    navigator.clipboard.writeText(themeCode);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Theme Customizer</h2>
          <p className="text-muted-foreground">Create and customize your perfect theme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setIsPreviewMode(!isPreviewMode); }}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button onClick={exportTheme}>
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="spacing">
            <Layout className="h-4 w-4 mr-2" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="animations">
            <Zap className="h-4 w-4 mr-2" />
            Animations
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Sparkles className="h-4 w-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Customize your theme colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {colorCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <Label htmlFor={category.key}>{category.label}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={category.key}
                        type="color"
                        value={customTheme.colors[category.key as keyof typeof customTheme.colors]}
                        onChange={(e) => { updateColor(category.key, e.target.value); }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={customTheme.colors[category.key as keyof typeof customTheme.colors]}
                        onChange={(e) => { updateColor(category.key, e.target.value); }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Generated Gradients</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Primary Gradient</Label>
                    <div
                      className="h-12 rounded-lg border mt-2"
                      style={{ background: generateGradient(customTheme.colors.primary, customTheme.colors.secondary) }}
                    />
                  </div>
                  <div>
                    <Label>Accent Gradient</Label>
                    <div
                      className="h-12 rounded-lg border mt-2"
                      style={{ background: generateGradient(customTheme.colors.accent, customTheme.colors.primary) }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Configure fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={customTheme.typography.fontFamily}
                    onValueChange={(value) => {
                      setCustomTheme(prev => ({
                        ...prev,
                        typography: { ...prev.typography, fontFamily: value },
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Base Font Size</Label>
                    <Input
                      value={customTheme.typography.fontSize.base}
                      onChange={(e) => {
                        setCustomTheme(prev => ({
                          ...prev,
                          typography: {
                            ...prev.typography,
                            fontSize: { ...prev.typography.fontSize, base: e.target.value },
                          },
                        }));
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Large Font Size</Label>
                    <Input
                      value={customTheme.typography.fontSize.lg}
                      onChange={(e) => {
                        setCustomTheme(prev => ({
                          ...prev,
                          typography: {
                            ...prev.typography,
                            fontSize: { ...prev.typography.fontSize, lg: e.target.value },
                          },
                        }));
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Extra Large Font Size</Label>
                    <Input
                      value={customTheme.typography.fontSize.xl}
                      onChange={(e) => {
                        setCustomTheme(prev => ({
                          ...prev,
                          typography: {
                            ...prev.typography,
                            fontSize: { ...prev.typography.fontSize, xl: e.target.value },
                          },
                        }));
                      }}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg" style={{ fontFamily: customTheme.typography.fontFamily }}>
                  <h3 className="text-2xl font-bold mb-2">Typography Preview</h3>
                  <p className="text-lg mb-2">Large text example</p>
                  <p className="text-base mb-2">Base text with normal styling</p>
                  <p className="text-sm text-muted-foreground">Small muted text for descriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spacing & Layout</CardTitle>
              <CardDescription>Configure spacing and border radius</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Spacing Scale</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Small Spacing</Label>
                      <Input
                        value={customTheme.spacing.sm}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            spacing: { ...prev.spacing, sm: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Medium Spacing</Label>
                      <Input
                        value={customTheme.spacing.md}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            spacing: { ...prev.spacing, md: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Large Spacing</Label>
                      <Input
                        value={customTheme.spacing.lg}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            spacing: { ...prev.spacing, lg: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Border Radius</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Small Radius</Label>
                      <Input
                        value={customTheme.borderRadius.sm}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            borderRadius: { ...prev.borderRadius, sm: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Medium Radius</Label>
                      <Input
                        value={customTheme.borderRadius.md}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            borderRadius: { ...prev.borderRadius, md: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Large Radius</Label>
                      <Input
                        value={customTheme.borderRadius.lg}
                        onChange={(e) => {
                          setCustomTheme(prev => ({
                            ...prev,
                            borderRadius: { ...prev.borderRadius, lg: e.target.value },
                          }));
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Spacing Preview</h3>
                <div className="space-y-4">
                  <div
                    className="bg-primary/10 border border-primary/20"
                    style={{
                      padding: customTheme.spacing.sm,
                      borderRadius: customTheme.borderRadius.sm,
                    }}
                  >
                    Small spacing and radius
                  </div>
                  <div
                    className="bg-primary/10 border border-primary/20"
                    style={{
                      padding: customTheme.spacing.md,
                      borderRadius: customTheme.borderRadius.md,
                    }}
                  >
                    Medium spacing and radius
                  </div>
                  <div
                    className="bg-primary/10 border border-primary/20"
                    style={{
                      padding: customTheme.spacing.lg,
                      borderRadius: customTheme.borderRadius.lg,
                    }}
                  >
                    Large spacing and radius
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animation Settings</CardTitle>
              <CardDescription>Configure motion and transitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Animation Duration</Label>
                  <Select
                    value={customTheme.animations.duration}
                    onValueChange={(value) => {
                      setCustomTheme(prev => ({
                        ...prev,
                        animations: { ...prev.animations, duration: value },
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationPresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Easing Function</Label>
                  <Select
                    value={customTheme.animations.easing}
                    onValueChange={(value) => {
                      setCustomTheme(prev => ({
                        ...prev,
                        animations: { ...prev.animations, easing: value },
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {easingOptions.map((easing) => (
                        <SelectItem key={easing.value} value={easing.value}>
                          {easing.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Animation Preview</h3>
                <div className="space-y-4">
                  <Button
                    className="w-full transition-all"
                    style={{
                      transitionDuration: customTheme.animations.duration,
                      transitionTimingFunction: customTheme.animations.easing,
                    }}
                  >
                    Hover me to see animation
                  </Button>
                  <div
                    className="h-4 bg-primary rounded-full transition-all"
                    style={{
                      transitionDuration: customTheme.animations.duration,
                      transitionTimingFunction: customTheme.animations.easing,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Effects</CardTitle>
              <CardDescription>Configure shadows, blur, and other effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Blur Intensity</Label>
                  <Input
                    value={customTheme.effects.blur}
                    onChange={(e) => {
                      setCustomTheme(prev => ({
                        ...prev,
                        effects: { ...prev.effects, blur: e.target.value },
                      }));
                    }}
                    className="mt-2"
                    placeholder="blur(8px)"
                  />
                </div>

                <div>
                  <Label>Shadow Style</Label>
                  <Select
                    value={customTheme.effects.shadow}
                    onValueChange={(value) => {
                      setCustomTheme(prev => ({
                        ...prev,
                        effects: { ...prev.effects, shadow: value },
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soft">Soft Shadow</SelectItem>
                      <SelectItem value="sharp">Sharp Shadow</SelectItem>
                      <SelectItem value="colored">Colored Shadow</SelectItem>
                      <SelectItem value="none">No Shadow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Effects Preview</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-background border rounded-lg shadow-md">
                    Standard card with shadow
                  </div>
                  <div
                    className="p-4 bg-background/80 border rounded-lg backdrop-blur-sm"
                    style={{ backdropFilter: customTheme.effects.blur }}
                  >
                    Blurred background effect
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>See how your custom theme looks in action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6" style={{
                backgroundColor: customTheme.colors.background,
                color: customTheme.colors.text,
                fontFamily: customTheme.typography.fontFamily,
                padding: customTheme.spacing.lg,
                borderRadius: customTheme.borderRadius.lg,
                border: `1px solid ${customTheme.colors.border}`,
              }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Dashboard Preview</h3>
                  <Badge style={{ backgroundColor: customTheme.colors.primary, color: customTheme.colors.background }}>
                    New
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div style={{
                    backgroundColor: customTheme.colors.surface,
                    padding: customTheme.spacing.md,
                    borderRadius: customTheme.borderRadius.md,
                    border: `1px solid ${customTheme.colors.border}`,
                  }}>
                    <h4 className="font-medium mb-2">Primary Card</h4>
                    <p style={{ color: customTheme.colors.textSecondary }}>
                      This is how cards will look with your theme
                    </p>
                  </div>
                  <div style={{
                    background: customTheme.gradients.primary,
                    padding: customTheme.spacing.md,
                    borderRadius: customTheme.borderRadius.md,
                    color: customTheme.colors.background,
                  }}>
                    <h4 className="font-medium mb-2">Gradient Card</h4>
                    <p>With primary gradient background</p>
                  </div>
                  <div style={{
                    backgroundColor: customTheme.colors.accent,
                    padding: customTheme.spacing.md,
                    borderRadius: customTheme.borderRadius.md,
                    color: customTheme.colors.background,
                  }}>
                    <h4 className="font-medium mb-2">Accent Card</h4>
                    <p>Using accent color</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    style={{
                      backgroundColor: customTheme.colors.primary,
                      color: customTheme.colors.background,
                      borderRadius: customTheme.borderRadius.md,
                    }}
                  >
                    Primary Button
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: customTheme.colors.border,
                      color: customTheme.colors.text,
                      borderRadius: customTheme.borderRadius.md,
                    }}
                  >
                    Secondary Button
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={copyThemeCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={exportTheme}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}