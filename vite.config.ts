import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    hmr: {
      overlay: true
    },
    headers: {
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/javascript'
    },
    fs: {
      allow: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules')
      ]
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk configuration for better code splitting
        manualChunks: {
          // Core React and routing
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components and utilities
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-progress',
            '@radix-ui/react-toast',
            'lucide-react',
            'clsx',
            'tailwind-merge'
          ],
          
          // Charts and data visualization
          'charts-vendor': ['recharts'],
          
          // Forms and validation
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Date handling
          'date-vendor': ['date-fns', 'react-day-picker'],
          
          // State management and queries
          'query-vendor': ['@tanstack/react-query', 'zustand'],
          
          // Authentication and database
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // API and documentation
          'api-vendor': ['swagger-ui-react'],
          
          // Mapping libraries - split into chunks for better loading
          'leaflet-vendor': [
            'leaflet',
            'react-leaflet'
          ],
          'mapbox-vendor': [
            'mapbox-gl',
            'react-map-gl'
          ],
          'openlayers-vendor': [
            'ol'
          ],
          'deck-vendor': [
            'deck.gl'
          ],
          'geo-utils': [
            '@turf/turf',
            'proj4',
            'geolib',
            'wellknown',
            'h3-js',
            'geotiff'
          ],
          'maplibre-vendor': [
            'maplibre-gl'
          ],
          'three-vendor': [
            'three'
          ]
        }
      }
    },
    
    // Target modern browsers
    target: 'esnext',
    
    // Enable source maps in development
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    },
    
    // Asset handling
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    
    // Output options
    outDir: 'dist',
    emptyOutDir: true,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'leaflet',
      'react-leaflet',
      'mapbox-gl',
      'react-map-gl',
      'ol',
      '@turf/turf',
      'proj4'
    ]
  },
  
  define: {
    // Define global constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    global: 'globalThis',
  },
  
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/variables.scss";`
      }
    }
  },
  
  esbuild: {
    target: 'esnext',
    platform: 'browser'
  }
});
