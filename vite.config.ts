import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import legacy from '@vitejs/plugin-legacy';
import { compression } from 'vite-plugin-compression2';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Base configuration
    base: env.VITE_APP_BASE_URL || '/',
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
        '@stores': path.resolve(__dirname, './src/stores')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    
    // Server configuration
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: true
      }
    },
    
    // Build configuration - PHASE 9 OPTIMIZATION
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      
      // Mobile-optimized build settings
      target: ['es2015', 'safari11'],
      cssTarget: 'chrome61',
      
      // PHASE 9: Advanced chunk and code splitting for optimal performance
      rollupOptions: {
        output: {
          // Optimized chunk strategy for <500KB chunks
          manualChunks: (id) => {
            // Core vendor chunks (most critical)
            if (id.includes('node_modules')) {
              // React ecosystem - keep small and critical
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'react-core';
              }
              if (id.includes('react-router') || id.includes('@tanstack/react-query')) {
                return 'react-routing';
              }
              
              // UI Library chunks - split by frequency
              if (id.includes('@radix-ui')) {
                return 'radix-ui';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              if (id.includes('tailwind') || id.includes('class-variance-authority')) {
                return 'ui-utils';
              }
              
              // Data visualization - separate heavy charts
              if (id.includes('recharts') || id.includes('chart')) {
                return 'charts';
              }
              
              // Capacitor mobile features
              if (id.includes('@capacitor')) {
                return 'capacitor';
              }
              
              // Backend services
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              
              // Form handling
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'forms';
              }
              
              // Date utilities
              if (id.includes('date-fns')) {
                return 'date-utils';
              }
              
              // Other utilities
              if (id.includes('zod') || id.includes('zustand')) {
                return 'utils';
              }
              
              // Large libraries get their own chunks
              if (id.includes('react-beautiful-dnd')) {
                return 'dnd';
              }
              if (id.includes('swagger')) {
                return 'swagger';
              }
              
              // Default vendor chunk for remaining dependencies
              return 'vendor';
            }
            
            // PHASE 9: Feature-based chunks optimized for lazy loading
            
            // Core pages (most accessed)
            if (id.includes('src/pages/Index') || id.includes('src/pages/Auth')) {
              return 'core-pages';
            }
            
            // Management pages group
            if (id.includes('src/pages/TeamManagement') || 
                id.includes('src/pages/EquipmentManagement') ||
                id.includes('src/pages/FinancialManagement')) {
              return 'management-pages';
            }
            
            // Project-related pages
            if (id.includes('src/pages/Projects') || 
                id.includes('src/pages/ParkingLotDesigner') ||
                id.includes('src/pages/PhotoReports')) {
              return 'project-pages';
            }
            
            // Analytics and reporting
            if (id.includes('src/pages/Analytics') ||
                id.includes('src/components/AdvancedAnalytics') ||
                id.includes('src/components/PredictiveAnalytics')) {
              return 'analytics';
            }
            
            // AI and ML features
            if (id.includes('src/pages/AIHub') ||
                id.includes('src/components/AIOperationsCenter') ||
                id.includes('src/services/ai') || 
                id.includes('src/services/ml')) {
              return 'ai-features';
            }
            
            // Mobile and PWA features
            if (id.includes('src/pages/Mobile') ||
                id.includes('src/components/MobileCompanion')) {
              return 'mobile-features';
            }
            
            // Advanced operations
            if (id.includes('src/components/QuantumOperationsCenter') ||
                id.includes('src/components/UltimateEnhancedMissionControl') ||
                id.includes('src/components/MissionControlCenter')) {
              return 'operations-center';
            }
            
            // IoT and monitoring
            if (id.includes('src/components/IoTDashboard') ||
                id.includes('src/components/PerformanceMonitor')) {
              return 'iot-monitoring';
            }
            
            // Enterprise features
            if (id.includes('src/components/EnterpriseIntegrations') ||
                id.includes('src/lib/integrationHub') ||
                id.includes('src/lib/partnerEcosystem')) {
              return 'enterprise';
            }
            
            // Global and expansion features
            if (id.includes('src/components/GlobalExpansion') ||
                id.includes('src/pages/VeteranResources') ||
                id.includes('src/pages/CompanyResources')) {
              return 'expansion';
            }
            
            // Geospatial features
            if (id.includes('src/geospatial')) {
              return 'geospatial';
            }
            
            // Command center features
            if (id.includes('src/command_center')) {
              return 'command-center';
            }
            
            // Shared components (loaded frequently)
            if (id.includes('src/components/ui/') ||
                id.includes('src/components/Loading') ||
                id.includes('src/components/ErrorBoundary')) {
              return 'ui-components';
            }
            
            // Services and utilities
            if (id.includes('src/services/') && !id.includes('ai') && !id.includes('ml')) {
              return 'services';
            }
            if (id.includes('src/utils/') || id.includes('src/lib/')) {
              return 'utilities';
            }
            
            // Store management
            if (id.includes('src/stores/') || id.includes('src/contexts/')) {
              return 'state-management';
            }
          },
          
          // PHASE 9: Optimized asset handling
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            // Optimize asset organization for caching
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          
          // PHASE 9: Optimized chunk file naming
          chunkFileNames: (chunkInfo) => {
            return `js/[name]-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      
      // PHASE 9: Enhanced Terser configuration
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2
        },
        mangle: {
          properties: {
            regex: /^_/
          }
        }
      },
      
      // PHASE 9: Performance optimizations
      chunkSizeWarningLimit: 500, // Reduced from 1000 to enforce <500KB chunks
      cssCodeSplit: true,
      cssMinify: true,
      reportCompressedSize: false, // Faster builds
    },
    
    // PHASE 9: Enhanced Plugins configuration
    plugins: [
      // React plugin with SWC for faster compilation
      react({
        // PHASE 9: Enhanced React optimization
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      }),
      
      // PHASE 9: Enhanced Progressive Web App support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: env.VITE_APP_NAME || 'PaveMaster Suite',
          short_name: env.VITE_APP_SHORT_NAME || 'PaveMaster',
          description: env.VITE_APP_DESCRIPTION || 'AI-assisted pavement analysis and performance tracking',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // PHASE 9: Simplified caching strategy that works
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
          maximumFileSizeToCacheInBytes: 5000000,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        }
      }),
      
      // Legacy browser support
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: [
          'es.symbol',
          'es.array.filter',
          'es.promise',
          'es.promise.finally',
          'es/map',
          'es/set',
          'es.array.for-each',
          'es.object.define-properties',
          'es.object.define-property',
          'es.object.get-own-property-descriptor',
          'es.object.get-own-property-descriptors',
          'es.object.keys',
          'es.object.to-string',
          'web.dom-collections.for-each',
          'esnext.global-this',
          'esnext.string.match-all'
        ]
      }),
      
      // PHASE 9: Enhanced compression
      compression({
        algorithm: 'brotli',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 512, // Compress smaller files too
        minRatio: 0.7, // More aggressive compression
        deleteOriginFile: false
      }),
      
      // PHASE 9: Gzip compression as fallback
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 512,
        minRatio: 0.8
      }),
      
      // HTML plugin for dynamic HTML generation
      createHtmlPlugin({
        minify: mode === 'production',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'PaveMaster Suite',
            description: env.VITE_APP_DESCRIPTION || 'AI-assisted pavement analysis'
          }
        }
      }),
      
      // PHASE 9: Enhanced bundle visualization
      mode === 'production' && visualizer({
        filename: './stats.html',
        title: 'PaveMaster Suite - Phase 9 Bundle Analysis',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap' // Better visualization
      })
    ].filter(Boolean),
    
    // CSS preprocessor options
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      devSourcemap: true,
      // PHASE 9: Enhanced CSS optimization
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    
    // Test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html']
      }
    },

    // PHASE 9: Enhanced dependencies optimization for mobile
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@capacitor/core',
        '@capacitor/camera',
        '@capacitor/geolocation',
        '@capacitor/device',
        '@capacitor/network',
        '@capacitor/preferences',
        '@radix-ui/react-slot',
        'lucide-react'
      ],
      exclude: ['@capacitor/ios', '@capacitor/android'],
      // PHASE 9: Enhanced pre-bundling
      esbuildOptions: {
        target: 'es2015'
      }
    },
    
    // PHASE 9: Enhanced preview configuration
    preview: {
      port: 4173,
      strictPort: true,
      open: true
    }
  };
});
