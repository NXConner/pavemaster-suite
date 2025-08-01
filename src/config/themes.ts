// Industry-Specific Theme Configurations
export interface IndustryTheme {
  id: string;
  name: string;
  description: string;
  industry: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  wallpapers: string[];
  icon: string;
}

export const INDUSTRY_THEMES: IndustryTheme[] = [
  {
    id: 'construction-pro',
    name: 'Construction Professional',
    description: 'Heavy-duty theme for construction and paving professionals',
    industry: 'Construction',
    colors: {
      primary: 'hsl(25, 85%, 45%)', // Construction Orange
      secondary: 'hsl(210, 15%, 25%)', // Steel Gray
      accent: 'hsl(45, 95%, 55%)', // Safety Yellow
      background: 'hsl(0, 0%, 98%)',
      foreground: 'hsl(210, 15%, 15%)',
      muted: 'hsl(210, 15%, 85%)',
      border: 'hsl(210, 15%, 75%)'
    },
    fonts: {
      heading: 'Roboto Condensed',
      body: 'Inter'
    },
    wallpapers: [
      'construction-site',
      'steel-structure',
      'urban-blueprint'
    ],
    icon: '🏗️'
  },
  {
    id: 'tactical-command',
    name: 'Tactical Command',
    description: 'Military-inspired interface for mission-critical operations',
    industry: 'Military/Security',
    colors: {
      primary: 'hsl(120, 40%, 35%)', // Military Green
      secondary: 'hsl(60, 5%, 20%)', // Tactical Gray
      accent: 'hsl(45, 100%, 65%)', // Gold Accent
      background: 'hsl(60, 3%, 8%)',
      foreground: 'hsl(0, 0%, 95%)',
      muted: 'hsl(60, 5%, 25%)',
      border: 'hsl(60, 5%, 35%)'
    },
    fonts: {
      heading: 'Orbitron',
      body: 'Roboto Mono'
    },
    wallpapers: [
      'tactical-grid-4k',
      'forest-landscape',
      'steel-structure'
    ],
    icon: '🛡️'
  },
  {
    id: 'corporate-executive',
    name: 'Corporate Executive',
    description: 'Professional business theme for executive presentations',
    industry: 'Corporate',
    colors: {
      primary: 'hsl(220, 85%, 45%)', // Executive Blue
      secondary: 'hsl(210, 25%, 35%)', // Corporate Gray
      accent: 'hsl(340, 75%, 55%)', // Professional Accent
      background: 'hsl(0, 0%, 99%)',
      foreground: 'hsl(210, 25%, 15%)',
      muted: 'hsl(210, 25%, 90%)',
      border: 'hsl(210, 25%, 80%)'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro'
    },
    wallpapers: [
      'urban-blueprint',
      'ocean-view',
      'forest-landscape'
    ],
    icon: '💼'
  },
  {
    id: 'roadwork-specialist',
    name: 'Roadwork Specialist',
    description: 'Specialized theme for asphalt and road construction teams',
    industry: 'Road Construction',
    colors: {
      primary: 'hsl(35, 80%, 50%)', // Asphalt Orange
      secondary: 'hsl(0, 0%, 25%)', // Asphalt Black
      accent: 'hsl(55, 100%, 50%)', // Road Marking Yellow
      background: 'hsl(0, 0%, 97%)',
      foreground: 'hsl(0, 0%, 15%)',
      muted: 'hsl(0, 0%, 85%)',
      border: 'hsl(0, 0%, 75%)'
    },
    fonts: {
      heading: 'Oswald',
      body: 'Open Sans'
    },
    wallpapers: [
      'construction-site',
      'urban-blueprint',
      'steel-structure'
    ],
    icon: '🛣️'
  },
  {
    id: 'fleet-management',
    name: 'Fleet Management',
    description: 'Optimized for vehicle and equipment tracking operations',
    industry: 'Fleet Operations',
    colors: {
      primary: 'hsl(200, 85%, 45%)', // Fleet Blue
      secondary: 'hsl(210, 20%, 30%)', // Metal Gray
      accent: 'hsl(25, 90%, 55%)', // Warning Orange
      background: 'hsl(0, 0%, 98%)',
      foreground: 'hsl(210, 20%, 15%)',
      muted: 'hsl(210, 20%, 88%)',
      border: 'hsl(210, 20%, 78%)'
    },
    fonts: {
      heading: 'Roboto',
      body: 'Nunito Sans'
    },
    wallpapers: [
      'steel-structure',
      'urban-blueprint',
      'tactical-grid-4k'
    ],
    icon: '🚛'
  },
  {
    id: 'environmental-focus',
    name: 'Environmental Focus',
    description: 'Eco-friendly theme promoting sustainable construction practices',
    industry: 'Environmental',
    colors: {
      primary: 'hsl(140, 60%, 40%)', // Forest Green
      secondary: 'hsl(30, 45%, 35%)', // Earth Brown
      accent: 'hsl(190, 75%, 50%)', // Water Blue
      background: 'hsl(140, 20%, 98%)',
      foreground: 'hsl(140, 60%, 15%)',
      muted: 'hsl(140, 20%, 90%)',
      border: 'hsl(140, 20%, 80%)'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Lato'
    },
    wallpapers: [
      'forest-landscape',
      'ocean-view',
      'construction-site'
    ],
    icon: '🌱'
  },
  {
    id: 'high-tech-industrial',
    name: 'High-Tech Industrial',
    description: 'Modern technological interface for smart construction',
    industry: 'Technology',
    colors: {
      primary: 'hsl(280, 85%, 55%)', // Tech Purple
      secondary: 'hsl(200, 25%, 25%)', // Tech Gray
      accent: 'hsl(180, 85%, 55%)', // Cyan Accent
      background: 'hsl(220, 15%, 8%)',
      foreground: 'hsl(0, 0%, 95%)',
      muted: 'hsl(200, 25%, 20%)',
      border: 'hsl(200, 25%, 30%)'
    },
    fonts: {
      heading: 'Exo 2',
      body: 'JetBrains Mono'
    },
    wallpapers: [
      'tactical-grid-4k',
      'steel-structure',
      'urban-blueprint'
    ],
    icon: '⚡'
  },
  {
    id: 'safety-first',
    name: 'Safety First',
    description: 'High-visibility theme emphasizing workplace safety',
    industry: 'Safety & Compliance',
    colors: {
      primary: 'hsl(55, 100%, 50%)', // Safety Yellow
      secondary: 'hsl(15, 85%, 45%)', // Safety Orange
      accent: 'hsl(0, 85%, 55%)', // Alert Red
      background: 'hsl(0, 0%, 99%)',
      foreground: 'hsl(0, 0%, 10%)',
      muted: 'hsl(55, 30%, 90%)',
      border: 'hsl(55, 30%, 80%)'
    },
    fonts: {
      heading: 'Roboto Condensed',
      body: 'Roboto'
    },
    wallpapers: [
      'construction-site',
      'steel-structure',
      'urban-blueprint'
    ],
    icon: '⚠️'
  }
];

// Wallpaper Collections
export interface WallpaperCollection {
  id: string;
  name: string;
  description: string;
  category: string;
  images: WallpaperImage[];
}

export interface WallpaperImage {
  id: string;
  name: string;
  description: string;
  url: string;
  thumbnail: string;
  resolution: string;
  tags: string[];
}

export const WALLPAPER_COLLECTIONS: WallpaperCollection[] = [
  {
    id: 'construction-industrial',
    name: 'Construction & Industrial',
    description: 'Professional backgrounds for construction and industrial applications',
    category: 'Industry',
    images: [
      {
        id: 'construction-site',
        name: 'Active Construction Site',
        description: 'Modern construction site with equipment and infrastructure',
        url: '/wallpapers/construction-site.jpg',
        thumbnail: '/wallpapers/construction-site-thumb.jpg',
        resolution: '3840x2160',
        tags: ['construction', 'industrial', 'professional', 'equipment']
      },
      {
        id: 'steel-structure',
        name: 'Steel Framework',
        description: 'Modern steel building structure against blue sky',
        url: '/wallpapers/steel-structure.jpg',
        thumbnail: '/wallpapers/steel-structure-thumb.jpg',
        resolution: '3840x2160',
        tags: ['steel', 'architecture', 'modern', 'industrial']
      },
      {
        id: 'urban-blueprint',
        name: 'Urban Blueprint',
        description: 'Technical blueprint overlay on urban infrastructure',
        url: '/wallpapers/urban-blueprint.jpg',
        thumbnail: '/wallpapers/urban-blueprint-thumb.jpg',
        resolution: '3840x2160',
        tags: ['blueprint', 'technical', 'urban', 'planning']
      }
    ]
  },
  {
    id: 'tactical-military',
    name: 'Tactical & Military',
    description: 'Command and control inspired backgrounds',
    category: 'Tactical',
    images: [
      {
        id: 'tactical-grid-4k',
        name: 'Tactical Grid 4K',
        description: 'High-resolution tactical grid pattern for command interfaces',
        url: '/wallpapers/tactical-grid-4k.jpg',
        thumbnail: '/wallpapers/tactical-grid-4k-thumb.jpg',
        resolution: '3840x2160',
        tags: ['tactical', 'grid', 'command', 'military']
      },
      {
        id: 'command-center',
        name: 'Command Center',
        description: 'Modern command and control center interface',
        url: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['command', 'technology', 'control', 'modern']
      },
      {
        id: 'operations-room',
        name: 'Operations Room',
        description: 'Strategic operations planning environment',
        url: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['operations', 'planning', 'strategic', 'professional']
      }
    ]
  },
  {
    id: 'nature-landscapes',
    name: 'Nature & Landscapes',
    description: 'Calming natural environments for balanced work atmosphere',
    category: 'Nature',
    images: [
      {
        id: 'forest-landscape',
        name: 'Forest Landscape',
        description: 'Serene forest landscape with morning sunlight',
        url: '/wallpapers/forest-landscape.jpg',
        thumbnail: '/wallpapers/forest-landscape-thumb.jpg',
        resolution: '3840x2160',
        tags: ['forest', 'nature', 'landscape', 'peaceful']
      },
      {
        id: 'ocean-view',
        name: 'Ocean View',
        description: 'Expansive ocean view with dramatic sky',
        url: '/wallpapers/ocean-view.jpg',
        thumbnail: '/wallpapers/ocean-view-thumb.jpg',
        resolution: '3840x2160',
        tags: ['ocean', 'water', 'sky', 'horizon']
      },
      {
        id: 'mountain-peaks',
        name: 'Mountain Peaks',
        description: 'Majestic mountain peaks with golden hour lighting',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['mountains', 'peaks', 'golden hour', 'landscape']
      },
      {
        id: 'starry-night',
        name: 'Starry Night Sky',
        description: 'Clear night sky filled with stars',
        url: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['night', 'stars', 'sky', 'astronomy']
      }
    ]
  },
  {
    id: 'corporate-professional',
    name: 'Corporate & Professional',
    description: 'Clean, professional backgrounds for business environments',
    category: 'Corporate',
    images: [
      {
        id: 'modern-office',
        name: 'Modern Office',
        description: 'Contemporary office space with clean lines',
        url: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['office', 'modern', 'professional', 'clean']
      },
      {
        id: 'glass-architecture',
        name: 'Glass Architecture',
        description: 'Modern glass building facade with geometric patterns',
        url: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['architecture', 'glass', 'modern', 'geometric']
      },
      {
        id: 'executive-suite',
        name: 'Executive Suite',
        description: 'Elegant executive office environment',
        url: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=3840&h=2160&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=400&h=225&fit=crop',
        resolution: '3840x2160',
        tags: ['executive', 'elegant', 'professional', 'luxury']
      }
    ]
  }
];