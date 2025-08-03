import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'templates'),
  plugins: [react()],
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src')
    }
  },
  server: {
    fs: {
      allow: [resolve(__dirname, 'src')]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    assetsDir: '.',
    rollupOptions: {
      input: resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'bundle.js'
      }
    }
  }
});

//