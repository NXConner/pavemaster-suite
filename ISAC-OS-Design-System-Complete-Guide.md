# ISAC OS Design System - Complete Implementation Guide
*Division-Inspired Tactical Interface - Maximum Potential Documentation*

---

## 🎯 Overview

The **ISAC OS Design System** is a sophisticated, military-grade tactical interface inspired by Tom Clancy's The Division franchise. This comprehensive system creates an immersive cyberpunk/tactical command center experience with advanced visual effects, dynamic animations, and modular component architecture.

### 🎨 Core Philosophy
- **Dark Tactical Aesthetic**: Military command center with orange tactical accents
- **Cyberpunk Elements**: Glowing effects, scanning lines, grid overlays
- **Information Density**: Efficient data presentation with clear hierarchy
- **Interactive Feedback**: Responsive animations and state changes
- **Modular Architecture**: Scalable component system built on modern web standards

---

## 📋 Table of Contents

1. [🎨 Design Foundation](#-design-foundation)
2. [🏗️ Project Setup](#️-project-setup)
3. [🎭 Color System](#-color-system)
4. [📝 Typography](#-typography)
5. [✨ Animation System](#-animation-system)
6. [🧩 Component Library](#-component-library)
7. [🎪 Visual Effects](#-visual-effects)
8. [📱 Layout Patterns](#-layout-patterns)
9. [🔧 Implementation Guide](#-implementation-guide)
10. [📊 Data Visualization](#-data-visualization)
11. [🎮 Interactive Elements](#-interactive-elements)
12. [🚀 Advanced Features](#-advanced-features)

---

## 🎨 Design Foundation

### Core Principles

#### 1. **Tactical Command Interface**
- High-contrast dark theme for extended use
- Orange tactical accents for critical information
- Grid-based layouts with geometric precision
- Monospace typography for terminal authenticity

#### 2. **Information Hierarchy**
```
CRITICAL (Destructive Red) > PRIMARY (Tactical Orange) > SUCCESS (Green) > WARNING (Yellow) > MUTED (Dimmed Orange)
```

#### 3. **Visual Language**
- **Borders**: Subtle glowing effects with tactical borders
- **Backgrounds**: Layered gradients with transparency
- **Icons**: Lucide React icons for consistency
- **Spacing**: 4px grid system (Tailwind standard)

---

## 🏗️ Project Setup

### 1. Initial Setup

```bash
# Create new React project with Vite + TypeScript
npm create vite@latest isac-interface -- --template react-ts
cd isac-interface

# Install core dependencies
npm install react react-dom react-router-dom

# Install UI framework dependencies
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar @radix-ui/react-checkbox
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slider @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-tooltip @radix-ui/react-slot

# Install utility libraries
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react date-fns
npm install next-themes sonner vaul
npm install react-hook-form @hookform/resolvers zod

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/typography tailwindcss-animate
npm install -D @types/node

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 2. File Structure

```
src/
├── components/
│   ├── isac/                 # ISAC-specific components
│   │   ├── StatusBar.tsx
│   │   ├── AgentPanel.tsx
│   │   ├── MissionBoard.tsx
│   │   ├── TacticalMap.tsx
│   │   ├── SystemDiagnostics.tsx
│   │   └── index.ts
│   └── ui/                   # Base UI components
│       ├── button.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-toast.ts
│   └── use-theme.ts
├── pages/
│   ├── Index.tsx
│   ├── IsacOS.tsx
│   └── NotFound.tsx
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

---

## 🎭 Color System

### 1. HSL Color Palette

```css
:root {
  /* === CORE TACTICAL COLORS === */
  /* Background System */
  --background: 220 15% 8%;           /* Deep tactical dark */
  --background-elevated: 220 15% 10%; /* Elevated surfaces */
  --background-overlay: 220 15% 6%;   /* Modal overlays */
  
  /* Foreground System */
  --foreground: 25 95% 65%;           /* Primary text (tactical orange) */
  --foreground-muted: 25 85% 70%;     /* Secondary text */
  --foreground-subtle: 25 40% 55%;    /* Tertiary text */
  
  /* === TACTICAL ORANGE SYSTEM === */
  --primary: 25 95% 65%;              /* Main tactical orange */
  --primary-foreground: 220 15% 8%;   /* Text on orange backgrounds */
  --primary-glow: 25 100% 75%;        /* Bright glow variant */
  --primary-muted: 25 60% 45%;        /* Dimmed orange */
  --primary-subtle: 25 40% 25%;       /* Very subtle orange */
  
  /* === INTERFACE ELEMENTS === */
  --card: 220 15% 12%;                /* Card backgrounds */
  --card-foreground: 25 85% 70%;      /* Card text */
  --card-border: 25 60% 45%;          /* Card borders */
  --card-elevated: 220 15% 15%;       /* Elevated cards */
  
  --secondary: 220 15% 15%;           /* Secondary buttons/elements */
  --secondary-foreground: 25 95% 65%; /* Text on secondary */
  
  --muted: 220 15% 18%;               /* Muted backgrounds */
  --muted-foreground: 25 40% 55%;     /* Muted text */
  
  --accent: 25 85% 60%;               /* Accent elements */
  --accent-foreground: 220 15% 8%;    /* Text on accents */
  
  /* === STATUS COLORS === */
  --success: 120 60% 55%;             /* Green - operational/secure */
  --success-foreground: 220 15% 8%;   /* Text on success */
  --success-muted: 120 40% 35%;       /* Dimmed success */
  
  --warning: 45 95% 65%;              /* Yellow - caution/warning */
  --warning-foreground: 220 15% 8%;   /* Text on warning */
  --warning-muted: 45 75% 45%;        /* Dimmed warning */
  
  --destructive: 0 85% 65%;           /* Red - critical/rogue */
  --destructive-foreground: 220 15% 8%; /* Text on destructive */
  --destructive-muted: 0 65% 45%;     /* Dimmed destructive */
  
  --info: 200 90% 60%;                /* Blue - information */
  --info-foreground: 220 15% 8%;      /* Text on info */
  
  /* === INTERFACE CONTROLS === */
  --border: 25 40% 25%;               /* Default borders */
  --border-muted: 25 20% 20%;         /* Subtle borders */
  --border-bright: 25 60% 45%;        /* Prominent borders */
  
  --input: 220 15% 15%;               /* Input backgrounds */
  --input-border: 25 40% 25%;         /* Input borders */
  --input-focus: 25 60% 45%;          /* Focused input borders */
  
  --ring: 25 95% 65%;                 /* Focus rings */
  --ring-offset: 220 15% 8%;          /* Ring offset color */
  
  /* === TACTICAL GRADIENTS === */
  --gradient-primary: linear-gradient(135deg, hsl(25 95% 65%), hsl(25 100% 75%));
  --gradient-tactical: linear-gradient(45deg, hsl(220 15% 8%), hsl(220 15% 15%));
  --gradient-overlay: linear-gradient(180deg, transparent, hsl(25 95% 65% / 0.1));
  --gradient-card: linear-gradient(135deg, hsl(220 15% 12%), hsl(220 15% 15%));
  --gradient-glow: radial-gradient(circle, hsl(25 95% 65% / 0.3), transparent);
  
  /* === SHADOWS AND EFFECTS === */
  --shadow-tactical: 0 4px 20px -4px hsl(25 95% 65% / 0.3);
  --shadow-glow: 0 0 20px hsl(25 95% 65% / 0.4);
  --shadow-deep: 0 8px 32px -8px hsl(220 15% 8% / 0.8);
  --shadow-subtle: 0 2px 8px -2px hsl(220 15% 8% / 0.4);
  --shadow-inner: inset 0 0 10px hsl(25 95% 65% / 0.05);
  
  /* === ANIMATION TIMING === */
  --transition-tactical: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* === COMPONENT SPECIFIC === */
  --radius: 0.25rem;                  /* Base border radius */
  --radius-sm: 0.125rem;              /* Small radius */
  --radius-lg: 0.5rem;                /* Large radius */
  --radius-xl: 0.75rem;               /* Extra large radius */
  
  /* Sidebar specific colors */
  --sidebar-background: 220 15% 10%;
  --sidebar-foreground: 25 85% 70%;
  --sidebar-primary: 25 95% 65%;
  --sidebar-primary-foreground: 220 15% 8%;
  --sidebar-accent: 220 15% 15%;
  --sidebar-accent-foreground: 25 85% 70%;
  --sidebar-border: 25 40% 25%;
  --sidebar-ring: 25 95% 65%;
}
```

### 2. Semantic Color Usage

```typescript
// Color semantic mapping
export const TACTICAL_COLORS = {
  // Status indicators
  OPERATIONAL: 'hsl(var(--success))',      // Green - system operational
  WARNING: 'hsl(var(--warning))',          // Yellow - caution required
  CRITICAL: 'hsl(var(--destructive))',     // Red - immediate attention
  UNKNOWN: 'hsl(var(--primary))',          // Orange - status unknown
  
  // Agent states
  AGENT_ACTIVE: 'hsl(var(--success))',     // Active agent
  AGENT_ROGUE: 'hsl(var(--destructive))',  // Rogue agent
  AGENT_MIA: 'hsl(var(--warning))',        // Missing agent
  AGENT_KIA: 'hsl(var(--muted-foreground))', // Deceased agent
  
  // Mission priorities
  PRIORITY_LOW: 'hsl(var(--muted-foreground))',
  PRIORITY_MEDIUM: 'hsl(var(--warning))',
  PRIORITY_HIGH: 'hsl(var(--primary))',
  PRIORITY_CRITICAL: 'hsl(var(--destructive))',
  
  // Network status
  NETWORK_SECURE: 'hsl(var(--success))',
  NETWORK_COMPROMISED: 'hsl(var(--destructive))',
  NETWORK_UNKNOWN: 'hsl(var(--warning))',
} as const;
```

---

## 📝 Typography

### 1. Font System

```css
/* Import tactical fonts */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

/* Font family definitions */
.font-mono { font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace; }
.font-tactical { font-family: 'Orbitron', sans-serif; }
.font-display { font-family: 'Orbitron', sans-serif; }
```

### 2. Typography Scale

```typescript
export const TYPOGRAPHY = {
  // Display text (headers, titles)
  display: {
    xl: 'text-4xl font-tactical font-bold tracking-wider',
    lg: 'text-3xl font-tactical font-bold tracking-wider',
    md: 'text-2xl font-tactical font-bold tracking-wider',
    sm: 'text-xl font-tactical font-semibold tracking-wide',
  },
  
  // Body text
  body: {
    lg: 'text-lg font-mono leading-relaxed',
    md: 'text-base font-mono leading-relaxed',
    sm: 'text-sm font-mono leading-relaxed',
    xs: 'text-xs font-mono leading-relaxed',
  },
  
  // Tactical interface text
  tactical: {
    primary: 'text-tactical font-bold tracking-wider',
    secondary: 'text-primary font-semibold tracking-wide',
    muted: 'text-muted-foreground font-medium tracking-wide',
  },
  
  // Code/data text
  code: {
    lg: 'text-lg font-mono font-medium tracking-wider',
    md: 'text-base font-mono font-medium tracking-wide',
    sm: 'text-sm font-mono font-medium tracking-wide',
    xs: 'text-xs font-mono font-normal tracking-wide',
  }
} as const;
```

### 3. Text Effects

```css
/* Tactical text effects */
.text-tactical {
  @apply text-primary;
  text-shadow: 0 0 8px hsl(var(--primary) / 0.5);
}

.text-glow {
  text-shadow: 0 0 10px currentColor;
}

.text-scan {
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  background-size: 200% 100%;
  animation: text-scan 2s linear infinite;
  -webkit-background-clip: text;
  background-clip: text;
}

@keyframes text-scan {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## ✨ Animation System

### 1. Core Animations

```css
/* Keyframe definitions */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 5px hsl(var(--primary) / 0.3);
  }
  50% { 
    box-shadow: 
      0 0 20px hsl(var(--primary) / 0.6), 
      0 0 30px hsl(var(--primary) / 0.3);
  }
}

@keyframes tactical-scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100vw); }
}

@keyframes data-flow {
  0% { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes status-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes radar-sweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes interference {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

@keyframes matrix-rain {
  0% { transform: translateY(-100vh); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  2% { opacity: 0.8; }
  4% { opacity: 1; }
  6% { opacity: 0.9; }
  8% { opacity: 1; }
}

@keyframes energy-pulse {
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
  100% { 
    transform: scale(1.2); 
    opacity: 0; 
  }
}
```

### 2. Animation Classes

```css
/* Animation utility classes */
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-tactical-scan { animation: tactical-scan 3s linear infinite; }
.animate-data-flow { animation: data-flow 0.6s ease-out; }
.animate-status-blink { animation: status-blink 1.5s ease-in-out infinite; }
.animate-radar-sweep { animation: radar-sweep 4s linear infinite; }
.animate-interference { animation: interference 0.5s ease-in-out infinite; }
.animate-matrix-rain { animation: matrix-rain 3s linear infinite; }
.animate-hologram-flicker { animation: hologram-flicker 2s ease-in-out infinite; }
.animate-energy-pulse { animation: energy-pulse 1s ease-out infinite; }

/* Delayed animations */
.animate-delay-100 { animation-delay: 0.1s; }
.animate-delay-200 { animation-delay: 0.2s; }
.animate-delay-300 { animation-delay: 0.3s; }
.animate-delay-500 { animation-delay: 0.5s; }
.animate-delay-1000 { animation-delay: 1s; }
```

---

## 🧩 Component Library

### 1. Base UI Components

#### Button Component
```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-mono font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-tactical hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-subtle",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        tactical: "bg-gradient-to-r from-secondary to-muted text-foreground border border-border hover:border-primary hover:shadow-tactical hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-sm px-8",
        icon: "h-10 w-10",
        tactical: "h-12 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  glow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, glow, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "opacity-70 cursor-not-allowed",
          glow && "animate-pulse-glow"
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
```

#### Card Component
```tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glowing, scanning, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-sm border bg-card text-card-foreground shadow-subtle",
        "bg-gradient-to-br from-card to-card/80",
        glowing && "shadow-tactical animate-pulse-glow",
        scanning && "relative overflow-hidden",
        className
      )}
      {...props}
    >
      {scanning && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-tactical-scan opacity-60" />
      )}
      {props.children}
    </div>
  )
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6 border-b border-border",
        "bg-gradient-to-r from-transparent via-primary/5 to-transparent",
        className
      )}
      {...props}
    />
  )
);

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-tactical font-bold tracking-wider text-tactical",
        className
      )}
      {...props}
    />
  )
);
```

#### Progress Component
```tsx
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", animated, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300",
        variant === "default" && "bg-primary",
        variant === "success" && "bg-success",
        variant === "warning" && "bg-warning",
        variant === "destructive" && "bg-destructive",
        animated && "animate-pulse-glow"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
```

### 2. Tactical-Specific Components

#### Status Indicator
```tsx
interface StatusIndicatorProps {
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  label?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'md', 
  animated = true, 
  label 
}: StatusIndicatorProps) {
  const colors = {
    OPERATIONAL: 'text-success',
    WARNING: 'text-warning',
    CRITICAL: 'text-destructive',
    UNKNOWN: 'text-primary',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center space-x-2">
      <div 
        className={cn(
          "rounded-full border-2 border-current",
          colors[status],
          sizes[size],
          animated && "animate-pulse-glow"
        )}
      />
      {label && (
        <span className={cn("text-xs font-mono", colors[status])}>
          {label}
        </span>
      )}
    </div>
  );
}
```

#### Tactical Border
```tsx
interface TacticalBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowing?: boolean;
  corners?: boolean;
  scanning?: boolean;
}

export function TacticalBorder({ 
  children, 
  glowing, 
  corners, 
  scanning, 
  className,
  ...props 
}: TacticalBorderProps) {
  return (
    <div 
      className={cn(
        "relative border border-border rounded-sm",
        glowing && "shadow-tactical animate-pulse-glow",
        className
      )}
      {...props}
    >
      {corners && (
        <>
          <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary" />
        </>
      )}
      {scanning && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-tactical-scan opacity-60" />
      )}
      {children}
    </div>
  );
}
```

#### Data Grid
```tsx
interface DataGridProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  className?: string;
}

export function DataGrid({ data, columns, className }: DataGridProps) {
  return (
    <div className={cn("tactical-border overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-secondary to-muted px-4 py-2 border-b border-border">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((column) => (
            <div key={column.key} className="text-xs font-tactical font-bold text-tactical">
              {column.label}
            </div>
          ))}
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {data.map((row, index) => (
          <div 
            key={index} 
            className="grid gap-4 px-4 py-2 border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((column) => (
              <div key={column.key} className="text-xs font-mono">
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎪 Visual Effects

### 1. Background Effects

#### Tactical Grid Overlay
```css
.bg-tactical-grid {
  background-image: 
    linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
}

.bg-tactical-grid-fine {
  background-image: 
    linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px);
  background-size: 10px 10px;
}
```

#### Ambient Background
```tsx
export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />
      
      {/* Tactical grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-5" />
      
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-primary/30" />
      
      {/* Scanning lines */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-tactical-scan" />
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-tactical-scan animate-delay-1000" />
    </div>
  );
}
```

### 2. Interactive Effects

#### Holographic Button
```tsx
export function HolographicButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-primary/20 to-primary/10",
        "border border-primary/50",
        "hover:border-primary hover:shadow-tactical",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent",
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        "animate-hologram-flicker"
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

#### Glitch Effect
```tsx
export function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-destructive animate-interference"
        style={{ animationDelay: '0.1s' }}
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-primary animate-interference"
        style={{ animationDelay: '0.2s' }}
      >
        {children}
      </span>
    </span>
  );
}
```

---

## 📱 Layout Patterns

### 1. Command Center Layout
```tsx
export function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AmbientBackground />
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Main Content Area */}
      <main className="relative z-10 p-6 space-y-6">
        {children}
      </main>
      
      {/* Footer Status */}
      <footer className="relative z-10 border-t border-border bg-card/50 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>ISAC OS v2.1.3 | Build 2024.01.15</span>
          <span>Uptime: 72:15:42</span>
        </div>
      </footer>
    </div>
  );
}
```

### 2. Dashboard Grid
```tsx
export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  );
}
```

### 3. Responsive Panels
```tsx
export function ResponsivePanels() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6">
      {/* Main Panel */}
      <div className="xl:col-span-8 space-y-6">
        <MissionBoard />
        <TacticalMap />
      </div>
      
      {/* Side Panel */}
      <div className="xl:col-span-4 space-y-6">
        <AgentPanel />
        <SystemDiagnostics />
      </div>
    </div>
  );
}
```

---

## 📊 Data Visualization

### 1. Tactical Chart Components

#### System Performance Chart
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TacticalLineChart({ data, dataKey, color = "var(--primary)" }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          strokeOpacity={0.3}
        />
        <XAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.25rem',
            color: 'hsl(var(--foreground))',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### Threat Level Radar
```tsx
export function ThreatRadar({ data }: { data: Array<{ area: string; threat: number }> }) {
  const maxThreat = Math.max(...data.map(d => d.threat));
  
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Radar background */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/30">
        {/* Concentric circles */}
        {[0.33, 0.66, 1].map((scale) => (
          <div 
            key={scale}
            className="absolute border border-primary/20 rounded-full"
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              top: `${(1 - scale) * 50}%`,
              left: `${(1 - scale) * 50}%`,
            }}
          />
        ))}
        
        {/* Radar sweep */}
        <div className="absolute inset-0">
          <div className="w-full h-0.5 bg-gradient-to-r from-primary to-transparent absolute top-1/2 origin-left animate-radar-sweep" />
        </div>
      </div>
      
      {/* Threat indicators */}
      {data.map((item, index) => {
        const angle = (index * 360) / data.length;
        const radius = (item.threat / maxThreat) * 40; // Max 40% from center
        const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
        const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
        
        return (
          <div
            key={item.area}
            className="absolute w-2 h-2 bg-destructive rounded-full animate-pulse-glow"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
}
```

### 2. Real-time Metrics

#### Live Metric Display
```tsx
export function LiveMetric({ 
  label, 
  value, 
  unit, 
  status, 
  trend 
}: {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}) {
  const statusColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  return (
    <div className="tactical-border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">{label}</span>
        <StatusIndicator status={status.toUpperCase() as any} size="sm" />
      </div>
      
      <div className="flex items-baseline space-x-1">
        <span className={cn("text-2xl font-mono font-bold", statusColors[status])}>
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
        {trend && (
          <div className={cn(
            "text-xs",
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎮 Interactive Elements

### 1. Command Input
```tsx
export function CommandInput({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory(prev => [...prev, input]);
      onCommand(input);
      setInput('');
    }
  };

  return (
    <div className="tactical-border bg-card/50">
      <div className="p-3 border-b border-border">
        <span className="text-xs text-tactical font-mono">COMMAND INTERFACE</span>
      </div>
      
      <div className="p-4 space-y-2">
        {/* Command history */}
        <div className="h-32 overflow-y-auto text-xs font-mono space-y-1">
          {history.map((cmd, index) => (
            <div key={index} className="text-muted-foreground">
              <span className="text-primary">{'>'}</span> {cmd}
            </div>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-primary font-mono">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm"
            placeholder="Enter command..."
          />
        </form>
      </div>
    </div>
  );
}
```

### 2. Tactical Switch
```tsx
export function TacticalSwitch({ 
  checked, 
  onCheckedChange, 
  label 
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full border-2 transition-all duration-300",
          checked 
            ? "bg-primary/20 border-primary" 
            : "bg-secondary border-border"
        )}
      >
        <div
          className={cn(
            "absolute w-4 h-4 rounded-full transition-all duration-300",
            "top-0.5 transform",
            checked 
              ? "translate-x-6 bg-primary shadow-glow" 
              : "translate-x-0.5 bg-muted-foreground"
          )}
        />
      </button>
      <span className="text-sm font-mono text-foreground">{label}</span>
    </div>
  );
}
```

---

## 🚀 Advanced Features

### 1. Holographic Interface
```tsx
export function HolographicPanel({ children, className }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "relative p-6 rounded-sm",
      "bg-gradient-to-br from-card/80 to-card/40",
      "border border-primary/30",
      "backdrop-blur-md",
      "shadow-tactical",
      "animate-hologram-flicker",
      className
    )}>
      {/* Holographic scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-primary/10"
            style={{ top: `${i * 10}%` }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

### 2. Neural Network Visualization
```tsx
export function NeuralNetwork() {
  const nodes = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, 
        () => Math.floor(Math.random() * 20)
      ).filter(c => c !== i)
    })), []
  );

  return (
    <div className="relative w-full h-64 bg-card/20 rounded-sm border border-border overflow-hidden">
      <svg className="w-full h-full">
        {/* Connections */}
        {nodes.map(node => 
          node.connections.map(connId => {
            const connNode = nodes[connId];
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${connNode.x}%`}
                y2={`${connNode.y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                opacity="0.3"
                className="animate-pulse"
              />
            );
          })
        )}
        
        {/* Nodes */}
        {nodes.map(node => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="hsl(var(--primary))"
            className="animate-pulse-glow"
          />
        ))}
      </svg>
    </div>
  );
}
```

### 3. Matrix Rain Effect
```tsx
export function MatrixRain() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 font-mono text-primary/30 text-sm animate-matrix-rain"
          style={{
            left: `${i * 5}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          {Array.from({ length: 15 }).map((_, j) => (
            <div key={j} className="mb-1">
              {chars[Math.floor(Math.random() * chars.length)]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Implementation Guide

### 1. Complete Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          muted: "hsl(var(--primary-muted))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          muted: "hsl(var(--destructive-muted))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          border: "hsl(var(--card-border))",
          elevated: "hsl(var(--card-elevated))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          muted: "hsl(var(--success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          muted: "hsl(var(--warning-muted))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.6), 0 0 30px hsl(var(--primary) / 0.3)" },
        },
        "tactical-scan": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
        "data-flow": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "status-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0.3" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "interference": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-2px)" },
          "40%": { transform: "translateX(2px)" },
          "60%": { transform: "translateX(-1px)" },
          "80%": { transform: "translateX(1px)" },
        },
        "matrix-rain": {
          "0%": { transform: "translateY(-100vh)", opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "hologram-flicker": {
          "0%, 100%": { opacity: "1" },
          "2%": { opacity: "0.8" },
          "4%": { opacity: "1" },
          "6%": { opacity: "0.9" },
          "8%": { opacity: "1" },
        },
        "energy-pulse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "tactical-scan": "tactical-scan 3s linear infinite",
        "data-flow": "data-flow 0.6s ease-out",
        "status-blink": "status-blink 1.5s ease-in-out infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
        "interference": "interference 0.5s ease-in-out infinite",
        "matrix-rain": "matrix-rain 3s linear infinite",
        "hologram-flicker": "hologram-flicker 2s ease-in-out infinite",
        "energy-pulse": "energy-pulse 1s ease-out infinite",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Monaco", "Menlo", "monospace"],
        tactical: ["Orbitron", "sans-serif"],
        display: ["Orbitron", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 2. Complete CSS Implementation

```css
/* src/index.css - Complete ISAC OS Styling */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* === FONT IMPORTS === */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

/* === CSS VARIABLES === */
@layer base {
  :root {
    /* === CORE TACTICAL COLORS === */
    --background: 220 15% 8%;
    --background-elevated: 220 15% 10%;
    --background-overlay: 220 15% 6%;
    --foreground: 25 95% 65%;
    --foreground-muted: 25 85% 70%;
    --foreground-subtle: 25 40% 55%;

    /* === TACTICAL ORANGE SYSTEM === */
    --primary: 25 95% 65%;
    --primary-foreground: 220 15% 8%;
    --primary-glow: 25 100% 75%;
    --primary-muted: 25 60% 45%;
    --primary-subtle: 25 40% 25%;

    /* === INTERFACE ELEMENTS === */
    --card: 220 15% 12%;
    --card-foreground: 25 85% 70%;
    --card-border: 25 60% 45%;
    --card-elevated: 220 15% 15%;

    --secondary: 220 15% 15%;
    --secondary-foreground: 25 95% 65%;

    --muted: 220 15% 18%;
    --muted-foreground: 25 40% 55%;

    --accent: 25 85% 60%;
    --accent-foreground: 220 15% 8%;

    --popover: 220 15% 10%;
    --popover-foreground: 25 85% 70%;

    /* === STATUS COLORS === */
    --success: 120 60% 55%;
    --success-foreground: 220 15% 8%;
    --success-muted: 120 40% 35%;

    --warning: 45 95% 65%;
    --warning-foreground: 220 15% 8%;
    --warning-muted: 45 75% 45%;

    --destructive: 0 85% 65%;
    --destructive-foreground: 220 15% 8%;
    --destructive-muted: 0 65% 45%;

    --info: 200 90% 60%;
    --info-foreground: 220 15% 8%;

    /* === INTERFACE CONTROLS === */
    --border: 25 40% 25%;
    --border-muted: 25 20% 20%;
    --border-bright: 25 60% 45%;

    --input: 220 15% 15%;
    --input-border: 25 40% 25%;
    --input-focus: 25 60% 45%;

    --ring: 25 95% 65%;
    --ring-offset: 220 15% 8%;

    /* === TACTICAL GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, hsl(25 95% 65%), hsl(25 100% 75%));
    --gradient-tactical: linear-gradient(45deg, hsl(220 15% 8%), hsl(220 15% 15%));
    --gradient-overlay: linear-gradient(180deg, transparent, hsl(25 95% 65% / 0.1));
    --gradient-card: linear-gradient(135deg, hsl(220 15% 12%), hsl(220 15% 15%));
    --gradient-glow: radial-gradient(circle, hsl(25 95% 65% / 0.3), transparent);

    /* === SHADOWS AND EFFECTS === */
    --shadow-tactical: 0 4px 20px -4px hsl(25 95% 65% / 0.3);
    --shadow-glow: 0 0 20px hsl(25 95% 65% / 0.4);
    --shadow-deep: 0 8px 32px -8px hsl(220 15% 8% / 0.8);
    --shadow-subtle: 0 2px 8px -2px hsl(220 15% 8% / 0.4);
    --shadow-inner: inset 0 0 10px hsl(25 95% 65% / 0.05);

    /* === ANIMATION TIMING === */
    --transition-tactical: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    /* === COMPONENT SPECIFIC === */
    --radius: 0.25rem;
    --radius-sm: 0.125rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;

    /* Sidebar colors */
    --sidebar-background: 220 15% 10%;
    --sidebar-foreground: 25 85% 70%;
    --sidebar-primary: 25 95% 65%;
    --sidebar-primary-foreground: 220 15% 8%;
    --sidebar-accent: 220 15% 15%;
    --sidebar-accent-foreground: 25 85% 70%;
    --sidebar-border: 25 40% 25%;
    --sidebar-ring: 25 95% 65%;
  }

  /* === BASE STYLES === */
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-mono;
    background-image: 
      radial-gradient(circle at 20% 80%, hsl(25 95% 65% / 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, hsl(25 95% 65% / 0.03) 0%, transparent 50%);
    overflow-x: hidden;
  }

  /* === SCROLLBAR STYLING === */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-secondary;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-primary/50 rounded;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-primary/70;
  }

  /* === SELECTION STYLING === */
  ::selection {
    @apply bg-primary/30 text-primary-foreground;
  }
}

/* === COMPONENT LAYER === */
@layer components {
  /* === TACTICAL COMPONENTS === */
  .tactical-border {
    @apply border border-border rounded-sm;
    box-shadow: 
      0 0 10px hsl(var(--primary) / 0.2), 
      inset 0 0 10px hsl(var(--primary) / 0.05);
  }

  .tactical-glow {
    @apply transition-all duration-300;
    box-shadow: var(--shadow-glow);
  }

  .status-panel {
    @apply bg-card border tactical-border rounded-sm p-4;
    background: linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)) 50%, hsl(var(--muted)));
  }

  .data-grid {
    background-image: 
      linear-gradient(hsl(var(--border)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.3;
  }

  .agent-status {
    @apply relative overflow-hidden rounded-sm;
    background: linear-gradient(45deg, transparent, hsl(var(--primary) / 0.1), transparent);
  }

  .tactical-button {
    @apply bg-secondary hover:bg-accent text-foreground border border-border rounded-sm px-4 py-2;
    @apply transition-all duration-300 hover:shadow-tactical hover:scale-105;
    background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)));
  }

  .critical-alert {
    @apply animate-pulse;
    box-shadow: 0 0 20px hsl(var(--destructive) / 0.5);
  }

  .holographic {
    @apply relative;
    background: linear-gradient(135deg, 
      hsl(var(--card) / 0.8), 
      hsl(var(--card) / 0.4)
    );
    backdrop-filter: blur(10px);
    border: 1px solid hsl(var(--primary) / 0.3);
  }

  .neural-grid {
    background-image: 
      linear-gradient(45deg, hsl(var(--primary) / 0.1) 1px, transparent 1px),
      linear-gradient(-45deg, hsl(var(--primary) / 0.1) 1px, transparent 1px);
    background-size: 15px 15px;
  }

  /* === LAYOUT COMPONENTS === */
  .command-center {
    @apply min-h-screen bg-background text-foreground relative;
  }

  .dashboard-grid {
    @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
  }

  .metric-card {
    @apply tactical-border p-4 space-y-2 hover:shadow-tactical transition-all duration-300;
  }

  .threat-indicator {
    @apply w-3 h-3 rounded-full border-2 border-current animate-pulse-glow;
  }

  /* === GLASS MORPHISM === */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .glass-tactical {
    background: hsla(var(--card) / 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid hsl(var(--primary) / 0.2);
  }
}

/* === UTILITY LAYER === */
@layer utilities {
  /* === TEXT EFFECTS === */
  .text-tactical {
    @apply text-primary;
    text-shadow: 0 0 8px hsl(var(--primary) / 0.5);
  }

  .text-glow {
    text-shadow: 0 0 10px currentColor;
  }

  .text-scan {
    background: linear-gradient(90deg, transparent, currentColor, transparent);
    background-size: 200% 100%;
    animation: text-scan 2s linear infinite;
    -webkit-background-clip: text;
    background-clip: text;
  }

  /* === BACKGROUND PATTERNS === */
  .bg-tactical-grid {
    background-image: 
      linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  .bg-tactical-grid-fine {
    background-image: 
      linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px);
    background-size: 10px 10px;
  }

  .bg-circuit {
    background-image: 
      radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.3) 1px, transparent 0);
    background-size: 20px 20px;
  }

  /* === GLOW EFFECTS === */
  .glow-primary {
    box-shadow: 0 0 20px hsl(var(--primary) / 0.4);
  }

  .glow-success {
    box-shadow: 0 0 20px hsl(var(--success) / 0.4);
  }

  .glow-warning {
    box-shadow: 0 0 20px hsl(var(--warning) / 0.4);
  }

  .glow-destructive {
    box-shadow: 0 0 20px hsl(var(--destructive) / 0.4);
  }

  /* === HOVER EFFECTS === */
  .hover-tactical {
    @apply transition-all duration-300 hover:scale-105 hover:shadow-tactical;
  }

  .hover-glow {
    @apply transition-all duration-300 hover:shadow-glow;
  }

  /* === RESPONSIVE UTILITIES === */
  .responsive-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
  }

  .tactical-spacing {
    @apply space-y-6 lg:space-y-8;
  }
}

/* === KEYFRAMES === */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px hsl(var(--primary) / 0.3);
  }
  50% {
    box-shadow: 
      0 0 20px hsl(var(--primary) / 0.6), 
      0 0 30px hsl(var(--primary) / 0.3);
  }
}

@keyframes tactical-scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100vw); }
}

@keyframes data-flow {
  0% { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes status-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes radar-sweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes interference {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

@keyframes matrix-rain {
  0% { transform: translateY(-100vh); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  2% { opacity: 0.8; }
  4% { opacity: 1; }
  6% { opacity: 0.9; }
  8% { opacity: 1; }
}

@keyframes energy-pulse {
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
  100% { 
    transform: scale(1.2); 
    opacity: 0; 
  }
}

@keyframes text-scan {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes glitch {
  0%, 100% { 
    clip: rect(0, 9999px, 0, 0); 
    transform: skew(0.5deg);
  }
  5% { 
    clip: rect(30px, 9999px, 35px, 0); 
    transform: skew(0.3deg);
  }
  10% { 
    clip: rect(40px, 9999px, 45px, 0); 
    transform: skew(0.1deg);
  }
  15% { 
    clip: rect(10px, 9999px, 15px, 0); 
    transform: skew(0.8deg);
  }
  20% { 
    clip: rect(0, 9999px, 0, 0); 
    transform: skew(0.4deg);
  }
}

/* === RESPONSIVE BREAKPOINTS === */
@media (max-width: 768px) {
  .status-panel {
    @apply p-3;
  }
  
  .tactical-spacing {
    @apply space-y-4;
  }
  
  .dashboard-grid {
    @apply grid-cols-1 gap-4;
  }
}

@media (max-width: 640px) {
  .command-center {
    @apply text-sm;
  }
  
  .tactical-border {
    @apply p-3;
  }
}

/* === PRINT STYLES === */
@media print {
  .tactical-glow,
  .animate-pulse-glow,
  .animate-tactical-scan {
    animation: none !important;
    box-shadow: none !important;
  }
  
  .bg-tactical-grid {
    background: none !important;
  }
}

/* === HIGH CONTRAST MODE === */
@media (prefers-contrast: high) {
  :root {
    --primary: 25 100% 70%;
    --border: 25 50% 40%;
    --shadow-tactical: none;
  }
}

/* === REDUCED MOTION === */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 Complete Project Structure

```
isac-os-interface/
├── src/
│   ├── components/
│   │   ├── isac/
│   │   │   ├── StatusBar.tsx
│   │   │   ├── AgentPanel.tsx
│   │   │   ├── MissionBoard.tsx
│   │   │   ├── TacticalMap.tsx
│   │   │   ├── SystemDiagnostics.tsx
│   │   │   ├── CommandCenter.tsx
│   │   │   ├── HolographicPanel.tsx
│   │   │   ├── NeuralNetwork.tsx
│   │   │   ├── ThreatRadar.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── index.ts
│   │   ├── effects/
│   │   │   ├── AmbientBackground.tsx
│   │   │   ├── MatrixRain.tsx
│   │   │   ├── ScanningLines.tsx
│   │   │   ├── GlitchText.tsx
│   │   │   └── index.ts
│   │   └── layout/
│   │       ├── CommandCenterLayout.tsx
│   │       ├── DashboardGrid.tsx
│   │       ├── ResponsivePanels.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── use-theme.ts
│   │   ├── use-tactical-data.ts
│   │   ├── use-real-time.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── tactical-colors.ts
│   │   ├── animations.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── tactical.ts
│   │   ├── agents.ts
│   │   ├── missions.ts
│   │   └── index.ts
│   ├── data/
│   │   ├── mock-agents.ts
│   │   ├── mock-missions.ts
│   │   ├── mock-metrics.ts
│   │   └── index.ts
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── IsacOS.tsx
│   │   ├── NotFound.tsx
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── public/
│   ├── fonts/
│   ├── audio/
│   └── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎮 Usage Examples

### 1. Basic Implementation
```tsx
import { CommandCenterLayout, StatusBar, DashboardGrid } from '@/components/isac';
import { AgentPanel, MissionBoard, TacticalMap, SystemDiagnostics } from '@/components/isac';

export function App() {
  return (
    <CommandCenterLayout>
      <DashboardGrid>
        <AgentPanel />
        <MissionBoard />
        <TacticalMap />
        <SystemDiagnostics />
      </DashboardGrid>
    </CommandCenterLayout>
  );
}
```

### 2. Advanced Features
```tsx
import { HolographicPanel, NeuralNetwork, ThreatRadar } from '@/components/isac';
import { MatrixRain, GlitchText } from '@/components/effects';

export function AdvancedDashboard() {
  return (
    <div className="command-center">
      <MatrixRain />
      
      <HolographicPanel>
        <GlitchText>CLASSIFIED OPERATION</GlitchText>
        <NeuralNetwork />
        <ThreatRadar data={threatData} />
      </HolographicPanel>
    </div>
  );
}
```

---

## 🚀 Deployment

### 1. Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

### 2. Performance Optimizations
```typescript
// src/lib/performance.ts
export const preloadFonts = () => {
  const fonts = [
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap'
  ];
  
  fonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

export const optimizeAnimations = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (reducedMotion.matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
};
```

---

## 📖 Best Practices

### 1. Component Guidelines
- Use semantic HTML elements
- Implement proper ARIA attributes
- Follow responsive design principles
- Optimize for performance
- Maintain consistent spacing

### 2. Color Usage
- Use semantic colors for status indicators
- Maintain sufficient contrast ratios
- Implement dark mode considerations
- Test with color blindness simulators

### 3. Animation Guidelines
- Respect reduced motion preferences
- Use GPU-accelerated properties
- Implement proper animation timing
- Avoid excessive simultaneous animations

### 4. Accessibility
- Provide keyboard navigation
- Implement screen reader support
- Use semantic markup
- Test with assistive technologies

---

## 🎯 Conclusion

The **ISAC OS Design System** provides a complete, production-ready tactical interface solution with:

- ✅ **Complete Color System** with semantic meaning
- ✅ **Advanced Animation Framework** with performance optimizations
- ✅ **Modular Component Library** built on modern standards
- ✅ **Responsive Layout System** for all screen sizes
- ✅ **Accessibility Features** for inclusive design
- ✅ **Performance Optimizations** for smooth operation
- ✅ **TypeScript Support** for type safety
- ✅ **Modern Build System** with Vite and Tailwind CSS

This system creates an immersive, professional-grade tactical interface perfect for dashboards, command centers, gaming interfaces, and cyberpunk-themed applications.

---

*Last Updated: 2024 | Version 2.1.3 | ISAC OS Design System*