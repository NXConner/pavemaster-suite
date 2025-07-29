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
      external: [
        '@mui/material', 
        '@mui/icons-material', 
        '@emotion/react', 
        '@emotion/styled'
      ],
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
          
          // Date and utility libraries
          'utils-vendor': ['date-fns'],
          
          // Supabase and database
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          
          // API and documentation
          'api-vendor': ['swagger-ui-react'],
          
          // Feature-based chunks
          'quantum-ops': [
            './src/components/QuantumOperationsCenter',
            './src/components/UltimateEnhancedMissionControl'
          ],
          'ai-systems': [
            './src/components/AIOperationsCenter',
            './src/components/AIAssistant'
          ],
          'analytics': [
            './src/components/AdvancedAnalytics',
            './src/components/PredictiveAnalytics',
            './src/components/PerformanceDashboard'
          ],
          'overwatch': [
            './src/components/OverWatchTOSS'
          ],
          'mobile': [
            './src/components/MobileCompanion',
            './src/components/MobileFieldInterface'
          ],
          'enterprise': [
            './src/components/EnterpriseIntegrations',
            './src/components/MissionControlCenter'
          ]
        }
      }
    },
    
    // Optimize chunk names
    chunkFileNames: (chunkInfo) => {
      const facadeModuleId = chunkInfo.facadeModuleId 
        ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
        : 'chunk';
      return `js/${facadeModuleId}-[hash].js`;
    },
    
    // Optimize asset names
    assetFileNames: (assetInfo) => {
      const info = assetInfo.name?.split('.') || [];
      const ext = info[info.length - 1];
      
      if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
        return `images/[name]-[hash][extname]`;
      }
      if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
        return `fonts/[name]-[hash][extname]`;
      }
      return `assets/[name]-[hash][extname]`;
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Optimize build performance
    reportCompressedSize: false,
    cssCodeSplit: true,
    sourcemap: false // Disable in production for smaller bundle
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-progress',
      '@radix-ui/react-toast'
    ],
    exclude: [
      // Exclude heavy dependencies that should be loaded dynamically
      'swagger-ui-react'
    ]
  },
  
  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    drop: ['console', 'debugger'], // Remove console.log and debugger in production
  },
  
  // CSS optimizations
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        charset: false
      }
    }
  }
});
