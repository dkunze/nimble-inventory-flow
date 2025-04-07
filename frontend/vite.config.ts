import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import environment from 'vite-plugin-environment';

// Centralizar el puerto en una constante
const SERVER_PORT = 8080;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: SERVER_PORT, // Usar la constante en lugar de un valor fijo
  },
  plugins: [    
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['pg', 'pg-native'],
  }
}));
