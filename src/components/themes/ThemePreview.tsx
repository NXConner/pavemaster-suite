import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import type { AdvancedTheme } from '../../config/advanced-themes';
import { 
  Palette,
  Eye,
  Download,
  Star,
  Lock,
  Zap,
  Crown,
  Sparkles,
  Heart,
  CheckCircle
} from 'lucide-react';

interface ThemePreviewProps {
  theme: AdvancedTheme;
  isActive?: boolean;
  onApply?: (themeId: string) => void;
  onPreview?: (themeId: string) => void;
}

export function ThemePreview({ theme, isActive, onApply, onPreview }: ThemePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return <Sparkles className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'minimal': return <Heart className="h-4 w-4" />;
      case 'dynamic': return <Zap className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional': return 'text-blue-600';
      case 'creative': return 'text-purple-600';
      case 'minimal': return 'text-gray-600';
      case 'dynamic': return 'text-orange-600';
      case 'premium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer
        ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-md'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(theme.id)}
    >
      {theme.isPremium && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      {isActive && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="default" className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={getCategoryColor(theme.category)}>
                {getCategoryIcon(theme.category)}
              </div>
              {theme.name}
            </CardTitle>
            <CardDescription className="mt-1">{theme.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Color Palette Preview */}
        <div>
          <p className="text-sm font-medium mb-2">Color Palette</p>
          <div className="flex gap-1">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: theme.colors.primary }}
              title="Primary"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: theme.colors.secondary }}
              title="Secondary"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: theme.colors.accent }}
              title="Accent"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: theme.colors.background }}
              title="Background"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: theme.colors.surface }}
              title="Surface"
            />
          </div>
        </div>

        {/* Gradient Preview */}
        <div>
          <p className="text-sm font-medium mb-2">Gradients</p>
          <div className="space-y-1">
            <div 
              className="h-4 rounded-md"
              style={{ background: theme.gradients.primary }}
            />
            <div 
              className="h-4 rounded-md"
              style={{ background: theme.gradients.hero }}
            />
          </div>
        </div>

        {/* Typography Preview */}
        <div>
          <p className="text-sm font-medium mb-2">Typography</p>
          <div 
            className="space-y-1"
            style={{ 
              fontFamily: theme.typography.fontFamily,
              color: theme.colors.text 
            }}
          >
            <p className="text-lg font-bold">Heading Text</p>
            <p className="text-sm">Body text in {theme.typography.fontFamily}</p>
          </div>
        </div>

        {/* Component Preview */}
        <div className="p-3 rounded-lg border" style={{ backgroundColor: theme.colors.surface }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
              Sample Component
            </p>
            <Badge 
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.background 
              }}
            >
              New
            </Badge>
          </div>
          <Progress 
            value={75} 
            className="h-2"
            style={{ 
              backgroundColor: theme.colors.border,
            }}
          />
          <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
            Progress: 75% complete
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(theme.id);
            }}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(theme.id);
            }}
            className="flex-1"
            disabled={theme.isPremium && !isActive} // Disable premium themes if not purchased
          >
            {theme.isPremium && !isActive ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Apply
              </>
            )}
          </Button>
        </div>

        {/* Theme Details */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Category:</span>
              <p className="capitalize">{theme.category}</p>
            </div>
            <div>
              <span className="font-medium">Animation:</span>
              <p>{theme.animations.duration}</p>
            </div>
            <div>
              <span className="font-medium">Radius:</span>
              <p>{theme.borderRadius.md}</p>
            </div>
            <div>
              <span className="font-medium">Effects:</span>
              <p>{theme.isPremium ? 'Advanced' : 'Standard'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}