import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Palette,
  Image,
  Monitor,
  Download,
  Eye,
  Settings,
} from 'lucide-react';
import { INDUSTRY_THEMES, WALLPAPER_COLLECTIONS, type IndustryTheme, type WallpaperImage } from '../../config/themes';

export function AdvancedThemeSwitcher() {
  const [selectedTheme, setSelectedTheme] = useState<IndustryTheme>(INDUSTRY_THEMES[0] || {} as IndustryTheme);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperImage | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const applyTheme = (theme: IndustryTheme) => {
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--border', theme.colors.border);

    // Apply fonts if Google Fonts are loaded
    if (theme.fonts.heading) {
      root.style.setProperty('--font-heading', theme.fonts.heading);
    }
    if (theme.fonts.body) {
      root.style.setProperty('--font-body', theme.fonts.body);
    }

    setSelectedTheme(theme);

    // Save to localStorage
    localStorage.setItem('selected-theme', JSON.stringify(theme));
  };

  const applyWallpaper = (wallpaper: WallpaperImage) => {
    document.body.style.backgroundImage = `url(${wallpaper.url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';

    setSelectedWallpaper(wallpaper);

    // Save to localStorage
    localStorage.setItem('selected-wallpaper', JSON.stringify(wallpaper));
  };

  const clearWallpaper = () => {
    document.body.style.backgroundImage = 'none';
    setSelectedWallpaper(null);
    localStorage.removeItem('selected-wallpaper');
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      document.body.classList.add('preview-mode');
    } else {
      document.body.classList.remove('preview-mode');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Advanced Theme Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="themes">Industry Themes</TabsTrigger>
              <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
              <TabsTrigger value="preview">Preview Mode</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INDUSTRY_THEMES.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => { applyTheme(theme); }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{theme.icon}</span>
                        <div>
                          <h3 className="font-semibold">{theme.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {theme.industry}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {theme.description}
                      </p>

                      {/* Color Preview */}
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground">
                          Fonts: {theme.fonts.heading} / {theme.fonts.body}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wallpapers" className="space-y-4">
              {WALLPAPER_COLLECTIONS.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      {collection.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collection.images.map((wallpaper) => (
                        <Card
                          key={wallpaper.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedWallpaper?.id === wallpaper.id ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <CardContent className="p-3">
                            <div
                              className="w-full h-32 bg-cover bg-center rounded-lg mb-3"
                              style={{
                                backgroundImage: `url(${wallpaper.thumbnail || wallpaper.url})`,
                              }}
                            />
                            <h4 className="font-medium mb-1">{wallpaper.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {wallpaper.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="text-xs">
                                {wallpaper.resolution}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(wallpaper.url, '_blank');
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyWallpaper(wallpaper);
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {wallpaper.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedWallpaper && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Current Wallpaper: {selectedWallpaper.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedWallpaper.resolution}</p>
                      </div>
                      <Button variant="outline" onClick={clearWallpaper}>
                        Clear Wallpaper
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Preview Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Live Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        See theme changes in real-time across the application
                      </p>
                    </div>
                    <Button onClick={togglePreview} variant={previewMode ? 'default' : 'outline'}>
                      <Eye className="h-4 w-4 mr-2" />
                      {previewMode ? 'Exit Preview' : 'Enable Preview'}
                    </Button>
                  </div>

                  {previewMode && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h5 className="font-medium mb-2">Preview Active</h5>
                      <p className="text-sm text-muted-foreground">
                        Navigate through the application to see how your theme choices affect different pages and components.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Current Configuration</h5>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{selectedTheme.icon}</span>
                          <span className="font-medium">{selectedTheme.name}</span>
                          <Badge>{selectedTheme.industry}</Badge>
                        </div>
                        {selectedWallpaper && (
                          <div className="text-sm text-muted-foreground">
                            Wallpaper: {selectedWallpaper.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Save Configuration
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export Theme
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}