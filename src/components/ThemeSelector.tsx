import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Upload, Plus, Check } from 'lucide-react';
import { ThemeCard } from '@/components/ThemeCard';

export function ThemeSelector() {
  const {
    currentTheme,
    currentWallpaper,
    themeMode,
    themes,
    wallpapers,
    loading,
    setTheme,
    setWallpaper,
    setThemeMode,
    createCustomTheme,
    uploadWallpaper
  } = useTheme();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    description: '',
    colors: {
      light: {
        background: '220 13% 98%',
        foreground: '220 15% 15%',
        primary: '32 95% 55%',
        'primary-foreground': '0 0% 100%'
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        primary: '32 95% 55%',
        'primary-foreground': '0 0% 100%'
      }
    }
  });

  const [wallpaperUpload, setWallpaperUpload] = useState({
    name: '',
    description: '',
    file: null as File | null
  });

  const handleCreateTheme = async () => {
    if (!newTheme.name) return;
    
    await createCustomTheme(newTheme);
    setCreateDialogOpen(false);
    setNewTheme({
      name: '',
      description: '',
      colors: {
        light: {
          background: '220 13% 98%',
          foreground: '220 15% 15%',
          primary: '32 95% 55%',
          'primary-foreground': '0 0% 100%'
        },
        dark: {
          background: '222.2 84% 4.9%',
          foreground: '210 40% 98%',
          primary: '32 95% 55%',
          'primary-foreground': '0 0% 100%'
        }
      }
    });
  };

  const handleUploadWallpaper = async () => {
    if (!wallpaperUpload.file || !wallpaperUpload.name) return;
    
    await uploadWallpaper(wallpaperUpload.file, wallpaperUpload.name, wallpaperUpload.description);
    setUploadDialogOpen(false);
    setWallpaperUpload({ name: '', description: '', file: null });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize your application appearance with themes and wallpapers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme Mode</Label>
          <Select value={themeMode} onValueChange={setThemeMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Select Theme</Label>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Theme</DialogTitle>
                    <DialogDescription>
                      Create your own custom theme with your preferred colors
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="theme-name">Theme Name</Label>
                      <Input
                        id="theme-name"
                        value={newTheme.name}
                        onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Theme"
                      />
                    </div>
                    <div>
                      <Label htmlFor="theme-description">Description (Optional)</Label>
                      <Textarea
                        id="theme-description"
                        value={newTheme.description}
                        onChange={(e) => setNewTheme(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="A beautiful custom theme..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateTheme} className="flex-1">
                        Create Theme
                      </Button>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-4">
                {/* Core System Themes */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">CORE THEMES</Label>
                  <div className="grid gap-2">
                    {themes.filter(theme => 
                      theme.is_system && ['Construction Pro', 'Division Reborn', 'Gemini', 'Echo Comms'].includes(theme.name)
                    ).map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} currentTheme={currentTheme} setTheme={setTheme} />
                    ))}
                  </div>
                </div>

                {/* Industry-Specific Themes */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">INDUSTRY OPERATIONS</Label>
                  <div className="grid gap-2">
                    {themes.filter(theme => 
                      theme.is_system && ['Construction Command', 'Security Operations', 'Tactical Operations', 'Urban Infrastructure'].includes(theme.name)
                    ).map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} currentTheme={currentTheme} setTheme={setTheme} />
                    ))}
                  </div>
                </div>

                {/* Custom Themes */}
                {themes.filter(theme => !theme.is_system).length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">CUSTOM THEMES</Label>
                    <div className="grid gap-2">
                      {themes.filter(theme => !theme.is_system).map((theme) => (
                        <ThemeCard key={theme.id} theme={theme} currentTheme={currentTheme} setTheme={setTheme} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback - show any other themes */}
                {themes.filter(theme => 
                  theme.is_system && 
                  !['Construction Pro', 'Division Reborn', 'Gemini', 'Echo Comms', 'Construction Command', 'Security Operations', 'Tactical Operations', 'Urban Infrastructure'].includes(theme.name)
                ).length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">OTHER THEMES</Label>
                    <div className="grid gap-2">
                      {themes.filter(theme => 
                        theme.is_system && 
                        !['Construction Pro', 'Division Reborn', 'Gemini', 'Echo Comms', 'Construction Command', 'Security Operations', 'Tactical Operations', 'Urban Infrastructure'].includes(theme.name)
                      ).map((theme) => (
                        <ThemeCard key={theme.id} theme={theme} currentTheme={currentTheme} setTheme={setTheme} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="wallpapers" className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Select Wallpaper</Label>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Custom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Custom Wallpaper</DialogTitle>
                    <DialogDescription>
                      Upload your own image to use as a wallpaper
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wallpaper-file">Image File</Label>
                      <Input
                        id="wallpaper-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWallpaperUpload(prev => ({ ...prev, file }));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wallpaper-name">Wallpaper Name</Label>
                      <Input
                        id="wallpaper-name"
                        value={wallpaperUpload.name}
                        onChange={(e) => setWallpaperUpload(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Wallpaper"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wallpaper-description">Description (Optional)</Label>
                      <Textarea
                        id="wallpaper-description"
                        value={wallpaperUpload.description}
                        onChange={(e) => setWallpaperUpload(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="A beautiful custom wallpaper..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUploadWallpaper} className="flex-1">
                        Upload Wallpaper
                      </Button>
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-64">
              <div className="grid gap-3">
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    !currentWallpaper ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setWallpaper('')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-br from-muted to-muted-foreground/20 rounded border" />
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        No Wallpaper
                        {!currentWallpaper && <Check className="h-4 w-4 text-primary" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">Use default background</p>
                    </div>
                  </div>
                </div>

                {wallpapers.map((wallpaper) => (
                  <div
                    key={wallpaper.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      currentWallpaper?.id === wallpaper.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setWallpaper(wallpaper.id)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={wallpaper.thumbnail_url || wallpaper.image_url}
                        alt={wallpaper.name}
                        className="w-12 h-8 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{wallpaper.name}</h4>
                          {wallpaper.is_system && <Badge variant="secondary" className="text-xs">System</Badge>}
                          {currentWallpaper?.id === wallpaper.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        {wallpaper.description && (
                          <p className="text-sm text-muted-foreground mt-1">{wallpaper.description}</p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          {wallpaper.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}