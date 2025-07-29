import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    command === 'serve' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle size
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    
    // Enable advanced code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          
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
        }
      }
    },
    
    // Optimize build performance
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    
    // Enable advanced optimizations
    cssCodeSplit: true,
    sourcemap: false, // Disable in production for smaller bundle
    
    // Remove terser options since we're using esbuild
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
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
}));
