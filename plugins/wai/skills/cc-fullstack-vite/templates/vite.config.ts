import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
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
    allowedHosts: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://assets.life.gov.sg",
        "font-src 'self' https://assets.life.gov.sg",
        "connect-src 'self' ws: wss:",
        "img-src 'self' data:",
      ].join('; '),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:__BACKEND_PORT__',
        changeOrigin: true,
      },
    },
  },
});
