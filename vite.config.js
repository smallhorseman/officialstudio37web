import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (only in build)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean), // Remove falsy plugins
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'react-markdown'
    ],
  },
  
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    
    // CSS optimization
    cssMinify: 'lightningcss',
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Supabase chunk
          supabase: ['@supabase/supabase-js'],
          
          // React-markdown chunk
          markdown: ['react-markdown']
        },
        
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize CSS file names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Minification options - less aggressive
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.logs for debugging
        drop_debugger: true,
        passes: 1, // Reduce passes to avoid over-optimization
      },
      mangle: {
        safari10: true, // Fix Safari issues
      },
      format: {
        safari10: true, // Ensure Safari compatibility
      },
    },
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
  
  // CSS processing
  css: {
    devSourcemap: true,
  },
  
  // Development server optimization
  server: {
    port: 3000,
    host: true, // Allow external connections
    
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  esbuild: {
    // Keep function names for better debugging
    keepNames: true,
    // Handle JSX properly
    jsx: 'automatic',
    // Ensure proper CSS handling
    legalComments: 'none',
  }
});

