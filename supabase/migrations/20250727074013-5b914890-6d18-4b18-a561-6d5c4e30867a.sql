-- Create themes table for custom themes
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallpapers table
CREATE TABLE public.wallpapers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  theme_id UUID REFERENCES public.themes(id),
  wallpaper_id UUID REFERENCES public.wallpapers(id),
  theme_mode TEXT DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for themes
CREATE POLICY "Users can view public and system themes" 
ON public.themes FOR SELECT 
USING (is_public = true OR is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own themes" 
ON public.themes FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own themes" 
ON public.themes FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own themes" 
ON public.themes FOR DELETE 
USING (created_by = auth.uid());

-- RLS policies for wallpapers
CREATE POLICY "Users can view public and system wallpapers" 
ON public.wallpapers FOR SELECT 
USING (is_public = true OR is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own wallpapers" 
ON public.wallpapers FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own wallpapers" 
ON public.wallpapers FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own wallpapers" 
ON public.wallpapers FOR DELETE 
USING (created_by = auth.uid());

-- RLS policies for user preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences FOR ALL 
USING (user_id = auth.uid());

-- Insert system themes
INSERT INTO public.themes (name, description, colors, is_system) VALUES
('Construction Pro', 'Professional construction theme with orange and blue', '{
  "light": {
    "background": "220 13% 98%",
    "foreground": "220 15% 15%",
    "primary": "32 95% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "213 84% 22%",
    "secondary-foreground": "0 0% 100%",
    "accent": "213 84% 92%",
    "accent-foreground": "213 84% 22%",
    "muted": "220 13% 95%",
    "muted-foreground": "220 10% 45%"
  },
  "dark": {
    "background": "222.2 84% 4.9%",
    "foreground": "210 40% 98%",
    "primary": "32 95% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "217.2 32.6% 17.5%",
    "secondary-foreground": "210 40% 98%",
    "accent": "217.2 32.6% 17.5%",
    "accent-foreground": "210 40% 98%",
    "muted": "217.2 32.6% 17.5%",
    "muted-foreground": "215 20.2% 65.1%"
  }
}', true),
('Ocean Blue', 'Cool blue theme for water and marine projects', '{
  "light": {
    "background": "210 40% 98%",
    "foreground": "210 40% 15%",
    "primary": "213 84% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "197 71% 73%",
    "secondary-foreground": "210 40% 15%",
    "accent": "213 84% 92%",
    "accent-foreground": "213 84% 22%",
    "muted": "210 40% 95%",
    "muted-foreground": "210 25% 45%"
  },
  "dark": {
    "background": "213 84% 4%",
    "foreground": "210 40% 98%",
    "primary": "213 84% 55%",
    "primary-foreground": "0 0% 100%",
    "secondary": "197 71% 25%",
    "secondary-foreground": "210 40% 98%",
    "accent": "213 84% 15%",
    "accent-foreground": "210 40% 98%",
    "muted": "213 84% 10%",
    "muted-foreground": "210 25% 65%"
  }
}', true),
('Forest Green', 'Natural green theme for landscaping and environmental projects', '{
  "light": {
    "background": "120 20% 98%",
    "foreground": "120 20% 15%",
    "primary": "142 76% 36%",
    "primary-foreground": "0 0% 100%",
    "secondary": "120 20% 25%",
    "secondary-foreground": "0 0% 100%",
    "accent": "142 76% 92%",
    "accent-foreground": "142 76% 22%",
    "muted": "120 20% 95%",
    "muted-foreground": "120 15% 45%"
  },
  "dark": {
    "background": "120 20% 4%",
    "foreground": "120 20% 98%",
    "primary": "142 76% 50%",
    "primary-foreground": "0 0% 100%",
    "secondary": "120 20% 17%",
    "secondary-foreground": "120 20% 98%",
    "accent": "120 20% 15%",
    "accent-foreground": "120 20% 98%",
    "muted": "120 20% 10%",
    "muted-foreground": "120 15% 65%"
  }
}', true);

-- Insert system wallpapers  
INSERT INTO public.wallpapers (name, description, image_url, thumbnail_url, category, is_system) VALUES
('Construction Site', 'Modern construction site with cranes', '/wallpapers/construction-site.jpg', '/wallpapers/thumbs/construction-site.jpg', 'construction', true),
('Ocean View', 'Calm ocean with horizon', '/wallpapers/ocean-view.jpg', '/wallpapers/thumbs/ocean-view.jpg', 'nature', true),
('Forest Landscape', 'Lush green forest landscape', '/wallpapers/forest-landscape.jpg', '/wallpapers/thumbs/forest-landscape.jpg', 'nature', true),
('Urban Blueprint', 'Abstract blueprint pattern', '/wallpapers/urban-blueprint.jpg', '/wallpapers/thumbs/urban-blueprint.jpg', 'abstract', true),
('Steel Structure', 'Modern steel and glass architecture', '/wallpapers/steel-structure.jpg', '/wallpapers/thumbs/steel-structure.jpg', 'architecture', true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallpapers_updated_at BEFORE UPDATE ON public.wallpapers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();