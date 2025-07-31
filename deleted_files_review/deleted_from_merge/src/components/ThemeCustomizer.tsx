import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Image,
  X,
  Check,
  Sparkles
} from 'lucide-react';

export default function ThemeCustomizer() {
  const { 
    theme, 
    wallpaper, 
    availableWallpapers, 
    setTheme, 
    setWallpaper, 
    toggleTheme 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleWallpaperChange = (wallpaperId: string | null) => {
    setWallpaper(wallpaperId);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
        size="icon"
      >
        <Palette className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Theme Customizer
            </CardTitle>
            <CardDescription>
              Customize your theme and wallpaper preferences
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Theme Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Monitor className="mr-2 h-4 w-4" />
              Theme Mode
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Sun className="h-6 w-6" />
                <span>Light Mode</span>
                {theme === 'light' && <Check className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Moon className="h-6 w-6" />
                <span>Dark Mode</span>
                {theme === 'dark' && <Check className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Image className="mr-2 h-4 w-4" />
              Background Wallpaper
            </h3>
            
            {/* No Wallpaper Option */}
            <Button
              variant={!wallpaper ? 'default' : 'outline'}
              onClick={() => handleWallpaperChange(null)}
              className="w-full h-16 justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium">No Wallpaper</div>
                  <div className="text-sm text-muted-foreground">Clean default background</div>
                </div>
                {!wallpaper && <Check className="h-4 w-4 ml-auto" />}
              </div>
            </Button>

            {/* Wallpaper Grid */}
            <div className="grid grid-cols-1 gap-3">
              {availableWallpapers.map((wp) => (
                <Button
                  key={wp.id}
                  variant={wallpaper === wp.id ? 'default' : 'outline'}
                  onClick={() => handleWallpaperChange(wp.id)}
                  className="w-full h-16 justify-start p-3"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div 
                      className="w-12 h-12 rounded border bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${wp.image})` }}
                    />
                    <div className="text-left flex-1">
                      <div className="font-medium">{wp.name}</div>
                      <div className="text-sm text-muted-foreground">{wp.description}</div>
                    </div>
                    {wallpaper === wp.id && <Check className="h-4 w-4" />}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="flex-1"
              >
                {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                Toggle Theme
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleWallpaperChange(null)}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Wallpaper
              </Button>
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground">Current Settings</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {theme === 'light' ? 'Light' : 'Dark'} Mode
              </Badge>
              {wallpaper ? (
                <Badge variant="secondary">
                  {availableWallpapers.find(w => w.id === wallpaper)?.name || 'Custom'} Wallpaper
                </Badge>
              ) : (
                <Badge variant="outline">No Wallpaper</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}