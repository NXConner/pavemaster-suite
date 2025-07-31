import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import legacy from '@vitejs/plugin-legacy';
import { compression } from 'vite-plugin-compression2';
import { createHtmlPlugin } from 'vite-plugin-html';
import { componentTagger } from 'lovable-tagger';
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
        '@assets': path.resolve(__dirname, './src/assets')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    
    // Server configuration
    server: {
      host: "::",
      port: 8080,
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
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      
      // Mobile-optimized build settings
      target: ['es2015', 'safari11'],
      cssTarget: 'chrome61',
      
      // Advanced chunk and code splitting for optimal performance
      rollupOptions: {
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@capacitor')) {
                return 'capacitor-vendor';
              }
              if (id.includes('@radix-ui') || id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              if (id.includes('recharts') || id.includes('chart')) {
                return 'charts-vendor';
              }
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              if (id.includes('react-router') || id.includes('@tanstack')) {
                return 'routing-state-vendor';
              }
              return 'vendor';
            }
            
            // Feature-based chunks
            if (id.includes('src/lib/integrationHub')) {
              return 'integration-hub';
            }
            if (id.includes('src/lib/partnerEcosystem')) {
              return 'partner-ecosystem';
            }
            if (id.includes('src/components/QuantumOperationsCenter')) {
              return 'quantum-operations';
            }
            if (id.includes('src/components/GlobalExpansion')) {
              return 'global-expansion';
            }
            if (id.includes('src/services/ai') || id.includes('src/services/ml') || id.includes('src/lib/aiMlEngine')) {
              return 'ai-services';
            }
            if (id.includes('src/lib/voiceInterface') || id.includes('src/components/VoiceInterface')) {
              return 'voice-interface';
            }
            if (id.includes('src/lib/sustainabilityEngine')) {
              return 'sustainability';
            }
            if (id.includes('src/services/contract')) {
              return 'contract-services';
            }
            if (id.includes('src/geospatial')) {
              return 'geospatial';
            }
            if (id.includes('src/command_center')) {
              return 'command-center';
            }
          }
        }
      },
      
      // Terser configuration for production
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      
      // Performance optimizations
      chunkSizeWarningLimit: 500, // Reduced for better loading performance
      cssCodeSplit: true,
      cssMinify: true
    },
    
    // Plugins configuration
    plugins: [
      // React plugin with SWC for faster compilation
      react(),
      
      // Component tagger for Lovable development features
      mode === 'development' && componentTagger(),
      
      // Progressive Web App support
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
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2,webp}'],
          maximumFileSizeToCacheInBytes: 5000000, // Increased for voice/AI assets
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.pavementperformancesuite\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 2 // 2 hours
                }
              }
            },
            {
              urlPattern: /.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: /.*\.(js|css|woff2)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
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
      
      // Compression plugin
      compression({
        algorithms: ['brotli'],
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024
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
      
      // Bundle visualization (only in production)
      mode === 'production' && visualizer({
        filename: './stats.html',
        title: 'PaveMaster Suite - Bundle Analysis',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    
    // CSS preprocessor options
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      devSourcemap: true
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

    // Optimize dependencies for mobile
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@capacitor/core',
        '@capacitor/camera',
        '@capacitor/geolocation',
        '@capacitor/device',
        '@capacitor/network',
        '@capacitor/preferences'
      ],
      exclude: ['@capacitor/ios', '@capacitor/android']
    }
  };
});
