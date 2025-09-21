import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-beautiful-dnd', 'react-markdown', 'remark-gfm'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3000
  }
});
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

