import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

type Theme = {
  id: string;
  name: string;
  description?: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  is_system: boolean;
};

interface ThemeCardProps {
  theme: Theme;
  currentTheme: Theme | null;
  setTheme: (themeId: string) => Promise<void>;
}

export function ThemeCard({ theme, currentTheme, setTheme }: ThemeCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
        currentTheme?.id === theme.id ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onClick={() => setTheme(theme.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{theme.name}</h4>
            {currentTheme?.id === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
            {theme.is_system && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>
          {theme.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {theme.description}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {/* Color preview */}
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
          />
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: `hsl(${theme.colors.light.secondary || theme.colors.light.primary})` }}
          />
        </div>
      </div>
    </div>
  );
}