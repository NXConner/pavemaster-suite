import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/lib'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
      },
    },

    server: {
      host: '::',
      port: 8080,
      open: true,
      cors: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            
            // UI Component libraries
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-switch',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip'
            ],
            
            // Map and visualization
            'mapping': ['mapbox-gl', '@turf/turf'],
            
            // AI and ML
            'ai-ml': [
              '@tensorflow/tfjs',
              '@tensorflow/tfjs-backend-cpu',
              '@tensorflow/tfjs-backend-webgl',
              '@tensorflow/tfjs-converter'
            ],
            
            // Charts and visualization
            'charts': ['recharts', 'fabric'],
            
            // Form handling
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // State management and data fetching
            'state': ['zustand', '@tanstack/react-query'],
            
            // Utilities
            'utils': ['date-fns', 'clsx', 'tailwind-merge', 'axios', 'uuid'],
            
            // DnD and interactions
            'interactions': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            
            // Supabase
            'supabase': ['@supabase/supabase-js'],
            
            // Capacitor mobile
            'capacitor': [
              '@capacitor/core',
              '@capacitor/app',
              '@capacitor/camera',
              '@capacitor/device',
              '@capacitor/filesystem',
              '@capacitor/geolocation',
              '@capacitor/haptics',
              '@capacitor/keyboard',
              '@capacitor/network',
              '@capacitor/preferences'
            ]
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : []
        },
        mangle: {
          safari10: true
        }
      },
    },

    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
      }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'recharts',
        'lucide-react',
        'clsx',
        'tailwind-merge'
      ],
      exclude: [
        '@tensorflow/tfjs-node',
        'sharp'
      ],
    },

    // Performance optimizations
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'esnext'
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});