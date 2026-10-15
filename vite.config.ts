import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /iskycast/; Vercel and local dev serve from /.
  base: mode === 'ghpages' ? '/iskycast/' : '/',
  build: {
    outDir: 'dist',
    // Recharts is lazy-loaded in its own chunk (~150 kB gzip); it is not on the critical path.
    chunkSizeWarningLimit: 600,
  },
}));
