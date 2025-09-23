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
    process.env.ANALYZE === 'true' ? visualizer({
      template: 'treemap',
      open: false,
      filename: 'dist/stats.html',
    }) : undefined,
  ].filter(Boolean), // Filter out false/undefined values
  
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production to reduce size
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Database
          'supabase': ['@supabase/supabase-js'],
        },
        
        // Optimize asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize for modern browsers
    target: ['es2020', 'chrome80', 'safari14'],
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    // Force pre-bundling of these dependencies
    force: true,
  },
  
  // Server configuration
  server: {
    port: 3000,
    host: true,
    // Enable HMR optimization
    hmr: {
      overlay: false, // Disable error overlay for better dev experience
    },
  },
  
  preview: {
    port: 4173,
    host: true,
  },
  
  // CSS optimization
  css: {
    devSourcemap: false, // Disable CSS sourcemaps in dev for performance
  },
  
  define: {
    // Fix the cleanup function error
    'global': 'globalThis',
  }
})

// This file should be deleted - we'll use vite.config.js instead