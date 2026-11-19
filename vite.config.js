import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 2.9 — the last Vite line that runs on Node 12.
// Tailwind runs through PostCSS (postcss.config.cjs).
export default defineConfig({
  plugins: [react()],
  // Vite 2 defaults to port 3000; keep the same URL as before.
  server: { port: 5173 },
});
