import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'templates'),
  plugins: [react()],
  build: {
    outDir: '../dist',
    assetsDir: '.',
    rollupOptions: {
      input: resolve(__dirname, 'templates/src/main.jsx'),
      output: {
        entryFileNames: 'bundle.js'
      }
    }
  }
});