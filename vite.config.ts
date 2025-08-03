import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';
import path from 'path';

export default defineConfig(({ mode }) => ({
  base: '/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    host: "::",
    port: 8080,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
  },
  
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
  ],
}));