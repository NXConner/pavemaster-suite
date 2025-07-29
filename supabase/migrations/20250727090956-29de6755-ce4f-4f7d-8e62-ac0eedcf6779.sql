-- Add new custom themes for OverWatch Operations System
-- Division Reborn Theme (Dark tactical with orange accents)
INSERT INTO themes (name, description, colors, is_system, created_at) VALUES
('Division Reborn', 'Dark tactical theme with orange accents inspired by military operations', '{
  "light": {
    "background": "220 13% 98%",
    "foreground": "220 15% 15%",
    "primary": "16 100% 50%",
    "primary-foreground": "0 0% 100%",
    "secondary": "0 0% 15%",
    "secondary-foreground": "0 0% 100%",
    "muted": "220 13% 95%",
    "muted-foreground": "220 10% 45%",
    "accent": "16 100% 90%",
    "accent-foreground": "16 100% 20%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "220 13% 91%",
    "input": "220 13% 91%",
    "ring": "16 100% 50%"
  },
  "dark": {
    "background": "0 0% 8%",
    "foreground": "16 100% 85%",
    "primary": "16 100% 55%",
    "primary-foreground": "0 0% 8%",
    "secondary": "0 0% 25%",
    "secondary-foreground": "16 100% 85%",
    "muted": "0 0% 15%",
    "muted-foreground": "0 0% 65%",
    "accent": "0 0% 20%",
    "accent-foreground": "16 100% 85%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "0 0% 20%",
    "input": "0 0% 20%",
    "ring": "16 100% 55%"
  }
}', true, now()),

-- Gemini Theme (Dual-tone with blue/purple gradients)
('Gemini', 'Modern dual-tone theme with complementary blue and purple accents', '{
  "light": {
    "background": "240 100% 99%",
    "foreground": "240 15% 15%",
    "primary": "250 85% 60%",
    "primary-foreground": "0 0% 100%",
    "secondary": "210 85% 60%",
    "secondary-foreground": "0 0% 100%",
    "muted": "240 10% 95%",
    "muted-foreground": "240 10% 45%",
    "accent": "250 85% 92%",
    "accent-foreground": "250 85% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "240 10% 91%",
    "input": "240 10% 91%",
    "ring": "250 85% 60%"
  },
  "dark": {
    "background": "240 15% 8%",
    "foreground": "240 10% 90%",
    "primary": "250 85% 65%",
    "primary-foreground": "240 15% 8%",
    "secondary": "210 85% 65%",
    "secondary-foreground": "240 15% 8%",
    "muted": "240 15% 15%",
    "muted-foreground": "240 10% 65%",
    "accent": "240 15% 20%",
    "accent-foreground": "240 10% 90%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "240 15% 20%",
    "input": "240 15% 20%",
    "ring": "250 85% 65%"
  }
}', true, now()),

-- Echo Comms Theme (Communication-focused green/teal)
('Echo Comms', 'Clean communication-focused theme with green and teal accents', '{
  "light": {
    "background": "180 20% 98%",
    "foreground": "180 15% 15%",
    "primary": "160 85% 45%",
    "primary-foreground": "0 0% 100%",
    "secondary": "180 85% 35%",
    "secondary-foreground": "0 0% 100%",
    "muted": "180 10% 95%",
    "muted-foreground": "180 10% 45%",
    "accent": "160 85% 92%",
    "accent-foreground": "160 85% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "180 10% 91%",
    "input": "180 10% 91%",
    "ring": "160 85% 45%"
  },
  "dark": {
    "background": "180 20% 8%",
    "foreground": "180 10% 90%",
    "primary": "160 85% 50%",
    "primary-foreground": "180 20% 8%",
    "secondary": "180 85% 40%",
    "secondary-foreground": "180 20% 8%",
    "muted": "180 20% 15%",
    "muted-foreground": "180 10% 65%",
    "accent": "180 20% 20%",
    "accent-foreground": "180 10% 90%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "180 20% 20%",
    "input": "180 20% 20%",
    "ring": "160 85% 50%"
  }
}', true, now()),

-- Construction Command Theme (Heavy machinery inspired)
('Construction Command', 'Industrial theme inspired by heavy machinery with yellow and black safety colors', '{
  "light": {
    "background": "50 20% 98%",
    "foreground": "50 15% 15%",
    "primary": "48 100% 50%",
    "primary-foreground": "0 0% 0%",
    "secondary": "0 0% 20%",
    "secondary-foreground": "0 0% 100%",
    "muted": "50 10% 95%",
    "muted-foreground": "50 10% 45%",
    "accent": "48 100% 92%",
    "accent-foreground": "48 100% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "50 10% 91%",
    "input": "50 10% 91%",
    "ring": "48 100% 50%"
  },
  "dark": {
    "background": "0 0% 8%",
    "foreground": "48 100% 85%",
    "primary": "48 100% 55%",
    "primary-foreground": "0 0% 8%",
    "secondary": "0 0% 25%",
    "secondary-foreground": "48 100% 85%",
    "muted": "0 0% 15%",
    "muted-foreground": "0 0% 65%",
    "accent": "0 0% 20%",
    "accent-foreground": "48 100% 85%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "0 0% 20%",
    "input": "0 0% 20%",
    "ring": "48 100% 55%"
  }
}', true, now()),

-- Security Operations Theme (High-security red/black)
('Security Operations', 'High-security theme with red and black colors for critical operations', '{
  "light": {
    "background": "0 20% 98%",
    "foreground": "0 15% 15%",
    "primary": "0 85% 50%",
    "primary-foreground": "0 0% 100%",
    "secondary": "0 0% 20%",
    "secondary-foreground": "0 0% 100%",
    "muted": "0 10% 95%",
    "muted-foreground": "0 10% 45%",
    "accent": "0 85% 92%",
    "accent-foreground": "0 85% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "0 10% 91%",
    "input": "0 10% 91%",
    "ring": "0 85% 50%"
  },
  "dark": {
    "background": "0 15% 8%",
    "foreground": "0 10% 90%",
    "primary": "0 85% 55%",
    "primary-foreground": "0 15% 8%",
    "secondary": "0 0% 25%",
    "secondary-foreground": "0 10% 90%",
    "muted": "0 15% 15%",
    "muted-foreground": "0 10% 65%",
    "accent": "0 15% 20%",
    "accent-foreground": "0 10% 90%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "0 15% 20%",
    "input": "0 15% 20%",
    "ring": "0 85% 55%"
  }
}', true, now()),

-- Tactical Operations Theme (Military olive/camo)
('Tactical Operations', 'Military-grade interface with olive and camo-inspired colors', '{
  "light": {
    "background": "80 20% 98%",
    "foreground": "80 15% 15%",
    "primary": "90 40% 35%",
    "primary-foreground": "0 0% 100%",
    "secondary": "60 30% 25%",
    "secondary-foreground": "0 0% 100%",
    "muted": "80 10% 95%",
    "muted-foreground": "80 10% 45%",
    "accent": "90 40% 92%",
    "accent-foreground": "90 40% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "80 10% 91%",
    "input": "80 10% 91%",
    "ring": "90 40% 35%"
  },
  "dark": {
    "background": "80 20% 8%",
    "foreground": "80 10% 90%",
    "primary": "90 40% 40%",
    "primary-foreground": "80 20% 8%",
    "secondary": "60 30% 30%",
    "secondary-foreground": "80 10% 90%",
    "muted": "80 20% 15%",
    "muted-foreground": "80 10% 65%",
    "accent": "80 20% 20%",
    "accent-foreground": "80 10% 90%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "80 20% 20%",
    "input": "80 20% 20%",
    "ring": "90 40% 40%"
  }
}', true, now()),

-- Urban Infrastructure Theme (City planning aesthetic)
('Urban Infrastructure', 'Professional theme for municipal operations with gray and blue colors', '{
  "light": {
    "background": "210 20% 98%",
    "foreground": "210 15% 15%",
    "primary": "210 85% 45%",
    "primary-foreground": "0 0% 100%",
    "secondary": "220 20% 40%",
    "secondary-foreground": "0 0% 100%",
    "muted": "210 10% 95%",
    "muted-foreground": "210 10% 45%",
    "accent": "210 85% 92%",
    "accent-foreground": "210 85% 22%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "210 10% 91%",
    "input": "210 10% 91%",
    "ring": "210 85% 45%"
  },
  "dark": {
    "background": "210 20% 8%",
    "foreground": "210 10% 90%",
    "primary": "210 85% 50%",
    "primary-foreground": "210 20% 8%",
    "secondary": "220 20% 35%",
    "secondary-foreground": "210 10% 90%",
    "muted": "210 20% 15%",
    "muted-foreground": "210 10% 65%",
    "accent": "210 20% 20%",
    "accent-foreground": "210 10% 90%",
    "destructive": "0 84% 60%",
    "destructive-foreground": "210 40% 98%",
    "border": "210 20% 20%",
    "input": "210 20% 20%",
    "ring": "210 85% 50%"
  }
}', true, now());