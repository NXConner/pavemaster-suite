// ISAC-OS Theme Configuration
export interface ISACTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
  effects: {
    glow: string;
    shadow: string;
    blur: string;
  };
}

export const ISAC_OS_THEME: ISACTheme = {
  id: 'isac-os',
  name: 'ISAC-OS Tactical',
  colors: {
    primary: 'hsl(200, 100%, 50%)', // Tactical blue
    secondary: 'hsl(120, 100%, 40%)', // Command green
    accent: 'hsl(60, 100%, 50%)', // Alert yellow
    background: 'hsl(220, 15%, 8%)', // Dark tactical
    surface: 'hsl(220, 15%, 12%)', // Slightly lighter
    text: 'hsl(0, 0%, 95%)', // High contrast white
    muted: 'hsl(0, 0%, 65%)', // Muted text
    border: 'hsl(200, 50%, 25%)', // Tactical border
    success: 'hsl(120, 100%, 40%)', // Success green
    warning: 'hsl(45, 100%, 50%)', // Warning amber
    error: 'hsl(0, 100%, 50%)', // Error red
    info: 'hsl(200, 100%, 50%)', // Info blue
  },
  fonts: {
    primary: '"Inter", "Segoe UI", system-ui, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  effects: {
    glow: '0 0 20px hsl(200, 100%, 50%, 0.3)',
    shadow: '0 4px 20px hsl(220, 15%, 0%, 0.5)',
    blur: 'blur(8px)',
  },
};

export const applyISACTheme = () => {
  const root = document.documentElement;
  const theme = ISAC_OS_THEME;
  
  // Apply CSS custom properties
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--surface', theme.colors.surface);
  root.style.setProperty('--foreground', theme.colors.text);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--destructive', theme.colors.error);
  root.style.setProperty('--info', theme.colors.info);
  
  // Apply font family
  root.style.setProperty('--font-sans', theme.fonts.primary);
  root.style.setProperty('--font-mono', theme.fonts.mono);
  
  // Apply effects
  root.style.setProperty('--glow', theme.effects.glow);
  root.style.setProperty('--shadow', theme.effects.shadow);
  root.style.setProperty('--blur', theme.effects.blur);
  
  // Add tactical class to body
  document.body.classList.add('isac-os-theme');
  
  localStorage.setItem('theme', 'isac-os');
};