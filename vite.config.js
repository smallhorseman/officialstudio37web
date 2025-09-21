import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          dnd: ['react-beautiful-dnd'],
          markdown: ['react-markdown', 'remark-gfm']
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize assets
    assetsDir: 'assets',
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize development server
  server: {
    port: 3000,
    open: true
  },
  // Enable CSS code splitting
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
});

