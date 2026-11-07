import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        accessibility: resolve(import.meta.dirname, 'accessability-statement.html'),
        privacy: resolve(import.meta.dirname, 'privacy-policy.html'),
        terms: resolve(import.meta.dirname, 'terms.html')
      }
    }
  }
});
