import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Bundle analyzer (only when requested)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  build: {
    sourcemap: false, // Disable for production to reduce size
    rollupOptions: {
      output: {
        manualChunks: {
          // Fixed: Remove duplicate assignments
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['react-markdown'], // Optional UI libraries
        },
        
        // Optimize asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    
    chunkSizeWarningLimit: 1000,
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js'
    ],
  },
  
  // Server configuration
  server: {
    port: 3000,
    host: true,
  },
  
  preview: {
    port: 4173,
    host: true,
  },
})