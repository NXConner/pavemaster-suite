import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import legacy from '@vitejs/plugin-legacy';
import { compression } from 'vite-plugin-compression2';
import { createHtmlPlugin } from 'vite-plugin-html';
import { splitVendorChunkPlugin } from 'vite';
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
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      
      // Chunk and code splitting
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Advanced code splitting
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('/src/components/')) {
              return 'components';
            }
            if (id.includes('/src/services/')) {
              return 'services';
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
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      cssMinify: true
    },
    
    // Plugins configuration
    plugins: [
      // React plugin with SWC for faster compilation
      react(),
      
      // Progressive Web App support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: env.VITE_APP_NAME || 'Pavement Performance Suite',
          short_name: env.VITE_APP_SHORT_NAME || 'PaveMaster',
          description: env.VITE_APP_DESCRIPTION || 'AI-assisted pavement analysis and performance tracking',
          theme_color: '#ffffff',
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
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.pavementperformancesuite\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 // 1 hour
                }
              }
            }
          ]
        }
      }),
      
      // Legacy browser support
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      
      // Compression plugin
      compression({
        algorithm: 'brotli',
        exclude: [/\.(br)$/, /\.(gz)$/]
      }),
      
      // HTML plugin for dynamic HTML generation
      createHtmlPlugin({
        minify: mode === 'production',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'Pavement Performance Suite',
            description: env.VITE_APP_DESCRIPTION || 'AI-assisted pavement analysis'
          }
        }
      }),
      
      // Vendor chunk splitting
      splitVendorChunkPlugin(),
      
      // Bundle visualization (only in production)
      mode === 'production' && visualizer({
        filename: './stats.html',
        title: 'Pavement Performance Suite - Bundle Analysis',
        open: false
      })
    ],
    
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
    }
  };
});
