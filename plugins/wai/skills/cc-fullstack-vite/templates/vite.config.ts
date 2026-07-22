import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  build: {
    outDir: 'dist/client',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:__BACKEND_PORT__',
        changeOrigin: true,
      },
    },
  },
});
