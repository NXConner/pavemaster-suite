import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react({
      // Enable React DevTools in development
      devTarget: "es2022",
      // Use React 19 JSX runtime
      jsxRuntime: "automatic",
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'PaveMaster Suite',
        short_name: 'PaveMaster',
        description: 'Comprehensive pavement management and construction business suite',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['business', 'productivity', 'utilities'],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'PaveMaster Dashboard'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'PaveMaster Mobile'
          }
        ],
        shortcuts: [
          {
            name: 'New Project',
            short_name: 'New Project',
            description: 'Create a new project',
            url: '/projects/new',
            icons: [{ src: 'shortcut-new-project.png', sizes: '96x96' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View dashboard',
            url: '/dashboard',
            icons: [{ src: 'shortcut-dashboard.png', sizes: '96x96' }]
          }
        ],
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://pavemaster.app/manifest.json'
          }
        ],
        prefer_related_applications: false
      },
      devOptions: {
        enabled: mode === 'development',
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - core dependencies
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Large chart libraries
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            
            // UI component libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            
            // State management
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }
            
            // Utility libraries
            if (id.includes('date-fns') || id.includes('lodash') || id.includes('clsx')) {
              return 'vendor-utils';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            
            // PDF and export libraries
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx')) {
              return 'vendor-export';
            }
            
            // Supabase and auth
            if (id.includes('@supabase') || id.includes('crypto-js')) {
              return 'vendor-auth';
            }
            
            // All other vendor packages
            return 'vendor-misc';
          }
          
          // Application chunks - feature-based splitting
          
          // Admin and user management
          if (id.includes('/admin/') || id.includes('/users/') || id.includes('/roles/')) {
            return 'feature-admin';
          }
          
          // Analytics and reporting
          if (id.includes('/analytics/') || id.includes('/reports/') || id.includes('/charts/')) {
            return 'feature-analytics';
          }
          
          // Project management
          if (id.includes('/projects/') || id.includes('/tasks/') || id.includes('/scheduling/')) {
            return 'feature-projects';
          }
          
          // Financial modules
          if (id.includes('/estimates/') || id.includes('/invoices/') || id.includes('/billing/')) {
            return 'feature-financial';
          }
          
          // Inventory and assets
          if (id.includes('/inventory/') || id.includes('/assets/') || id.includes('/equipment/')) {
            return 'feature-inventory';
          }
          
          // Client and customer management
          if (id.includes('/clients/') || id.includes('/contacts/') || id.includes('/communications/')) {
            return 'feature-clients';
          }
          
          // Settings and configuration
          if (id.includes('/settings/') || id.includes('/config/') || id.includes('/preferences/')) {
            return 'feature-settings';
          }
          
          // UI components that are shared
          if (id.includes('/components/ui/')) {
            return 'shared-ui';
          }
          
          // Shared utilities and hooks
          if (id.includes('/hooks/') || id.includes('/utils/') || id.includes('/lib/')) {
            return 'shared-utils';
          }
          
          // Default chunk for remaining code
          return 'main';
        },
      },
    },
    // Reduce bundle size warnings - accept larger chunks for feature-rich application
    chunkSizeWarningLimit: 800,
    // PWA optimizations
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'recharts',
      'date-fns',
      '@tanstack/react-query',
      'zustand'
    ],
    exclude: [
      // Exclude large libraries from pre-bundling to allow chunking
      'jspdf',
      'html2canvas',
      'xlsx'
    ]
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}));
