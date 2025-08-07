import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Eye,
  EyeOff,
  Volume2,
  Contrast,
  Type,
  Palette,
  Zap,
  Moon,
  Sun,
  Accessibility,
  Heart,
  Focus,
} from 'lucide-react';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  dyslexiaSupport: boolean;
  colorBlindSupport: boolean;
  focusIndicators: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  textSpacing: number;
  lineHeight: number;
  fontSize: number;
  contrastRatio: number;
}

const AccessibilityThemeControls: React.FC = () => {
  const { currentTheme, setTheme, adaptiveContrast, setAdaptiveContrast } = useDynamicTheme();

  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    dyslexiaSupport: false,
    colorBlindSupport: false,
    focusIndicators: true,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    textSpacing: 1,
    lineHeight: 1.5,
    fontSize: 16,
    contrastRatio: 4.5,
  });

  const accessibilityThemes = [
    {
      id: 'highContrastLight',
      name: 'High Contrast Light',
      description: 'Maximum contrast for better visibility',
      icon: <Contrast className="h-4 w-4" />,
      badge: 'WCAG AAA',
    },
    {
      id: 'highContrastDark',
      name: 'High Contrast Dark',
      description: 'Dark theme with maximum contrast',
      icon: <Moon className="h-4 w-4" />,
      badge: 'WCAG AAA',
    },
    {
      id: 'dyslexiaFriendly',
      name: 'Dyslexia Friendly',
      description: 'Optimized for users with dyslexia',
      icon: <Type className="h-4 w-4" />,
      badge: 'Dyslexia',
    },
  ];

  const colorBlindPresets = [
    { id: 'protanopia', name: 'Protanopia', description: 'Red-blind friendly' },
    { id: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind friendly' },
    { id: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind friendly' },
    { id: 'monochromacy', name: 'Monochromacy', description: 'Complete color blindness' },
  ];

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (accessibilitySettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply high contrast
    if (accessibilitySettings.highContrast) {
      setTheme(currentTheme.category === 'dark' ? 'highContrastDark' : 'highContrastLight');
    }

    // Apply reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.style.setProperty('--duration-fast', '0ms');
      root.style.setProperty('--duration-normal', '0ms');
      root.style.setProperty('--duration-slow', '0ms');
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }

    // Apply large text
    root.style.setProperty('--text-scale', accessibilitySettings.largeText ? '1.25' : '1');
    root.style.setProperty('--font-size-base', `${accessibilitySettings.fontSize}px`);

    // Apply text spacing
    root.style.setProperty('--text-spacing', `${accessibilitySettings.textSpacing}rem`);
    root.style.setProperty('--line-height', accessibilitySettings.lineHeight.toString());

    // Apply dyslexia support
    if (accessibilitySettings.dyslexiaSupport) {
      setTheme('dyslexiaFriendly');
    }

    // Apply focus indicators
    document.body.classList.toggle('enhanced-focus', accessibilitySettings.focusIndicators);

    // Apply screen reader optimizations
    document.body.classList.toggle('screen-reader-optimized', accessibilitySettings.screenReaderOptimized);

    // Apply keyboard navigation enhancements
    document.body.classList.toggle('keyboard-nav-enhanced', accessibilitySettings.keyboardNavigation);

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings));
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      dyslexiaSupport: false,
      colorBlindSupport: false,
      focusIndicators: true,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      textSpacing: 1,
      lineHeight: 1.5,
      fontSize: 16,
      contrastRatio: 4.5,
    };
    setSettings(defaultSettings);
    applyAccessibilitySettings(defaultSettings);
  };

  const quickAccessibilityPresets = [
    {
      name: 'Visual Impairment',
      icon: <Eye className="h-4 w-4" />,
      settings: {
        highContrast: true,
        largeText: true,
        focusIndicators: true,
        fontSize: 20,
        contrastRatio: 7,
      },
    },
    {
      name: 'Motor Impairment',
      icon: <Focus className="h-4 w-4" />,
      settings: {
        reducedMotion: true,
        focusIndicators: true,
        keyboardNavigation: true,
        largeText: true,
      },
    },
    {
      name: 'Cognitive Support',
      icon: <Heart className="h-4 w-4" />,
      settings: {
        dyslexiaSupport: true,
        reducedMotion: true,
        textSpacing: 1.5,
        lineHeight: 2,
        fontSize: 18,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Access Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Quick Accessibility Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickAccessibilityPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  const newSettings = { ...settings, ...preset.settings };
                  setSettings(newSettings);
                  applyAccessibilitySettings(newSettings);
                }}
              >
                {preset.icon}
                <span className="text-sm font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accessibilityThemes.map((theme) => (
              <Card
                key={theme.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => { setTheme(theme.id); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    {theme.icon}
                    <Badge variant="secondary" className="text-xs">
                      {theme.badge}
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-1">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => { handleSettingChange('highContrast', checked); }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Adaptive Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjusts contrast based on ambient light
              </p>
            </div>
            <Switch
              checked={adaptiveContrast}
              onCheckedChange={setAdaptiveContrast}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Size: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => { handleSettingChange('fontSize', value); }}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Line Height: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => { handleSettingChange('lineHeight', value); }}
              min={1}
              max={2.5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Text Spacing: {settings.textSpacing}rem</Label>
            <Slider
              value={[settings.textSpacing]}
              onValueChange={([value]) => { handleSettingChange('textSpacing', value); }}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Motion & Animation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Motion & Animation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimizes animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => { handleSettingChange('reducedMotion', checked); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Blind Support */}
      <Card>
        <CardHeader>
          <CardTitle>Color Blind Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Color Blind Support</Label>
              <p className="text-sm text-muted-foreground">
                Adjusts colors for color vision deficiencies
              </p>
            </div>
            <Switch
              checked={settings.colorBlindSupport}
              onCheckedChange={(checked) => { handleSettingChange('colorBlindSupport', checked); }}
            />
          </div>

          {settings.colorBlindSupport && (
            <div className="space-y-2">
              <Label>Color Vision Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select color vision type" />
                </SelectTrigger>
                <SelectContent>
                  {colorBlindPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cognitive Support */}
      <Card>
        <CardHeader>
          <CardTitle>Cognitive Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dyslexia Support</Label>
              <p className="text-sm text-muted-foreground">
                Uses dyslexia-friendly fonts and spacing
              </p>
            </div>
            <Switch
              checked={settings.dyslexiaSupport}
              onCheckedChange={(checked) => { handleSettingChange('dyslexiaSupport', checked); }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Screen Reader Optimized</Label>
              <p className="text-sm text-muted-foreground">
                Optimizes interface for screen readers
              </p>
            </div>
            <Switch
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) => { handleSettingChange('screenReaderOptimized', checked); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Support */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enhanced Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">
                Stronger visual focus indicators for keyboard navigation
              </p>
            </div>
            <Switch
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => { handleSettingChange('focusIndicators', checked); }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Keyboard Navigation Enhancement</Label>
              <p className="text-sm text-muted-foreground">
                Improves keyboard navigation experience
              </p>
            </div>
            <Switch
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => { handleSettingChange('keyboardNavigation', checked); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={resetToDefaults} variant="outline" className="w-full">
            Reset to Default Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityThemeControls;