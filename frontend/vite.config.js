import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure build outputs to the 'dist' directory
    rollupOptions: {
      input: '/index.html', // Ensure the entry point is correct
    }
  },
  base: '/', // Ensure the base path is set correctly, especially for Netlify deployments
});
