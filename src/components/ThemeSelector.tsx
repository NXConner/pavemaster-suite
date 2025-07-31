import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Theme = 'light' | 'dark' | 'system';

const themes = [
  {
    value: 'light' as Theme,
    label: 'Light',
    icon: Sun,
    description: 'Light mode for daytime use'
  },
  {
    value: 'dark' as Theme,
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode for low light environments'
  },
  {
    value: 'system' as Theme,
    label: 'System',
    icon: Monitor,
    description: 'Use system preference'
  }
];

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('system');

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    // In a real implementation, this would update the global theme
    console.log('Theme changed to:', theme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.value;
            
            return (
              <Button
                key={theme.value}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleThemeChange(theme.value)}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{theme.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Current theme: <span className="font-medium capitalize">{selectedTheme}</span>
        </div>
      </CardContent>
    </Card>
  );
}