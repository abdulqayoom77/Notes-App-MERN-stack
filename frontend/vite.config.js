import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Make sure the output directory is 'dist'
  },
  base: '/', // Ensure base is correct for deployment
});
