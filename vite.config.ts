import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

  server: {
    host: "::",
    port: 8080,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
