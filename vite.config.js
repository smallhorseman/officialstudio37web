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
  ],
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ],
  },
  
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Supabase chunk
          supabase: ['@supabase/supabase-js'],
          
          // Utils chunk
          utils: ['react-markdown', 'remark-gfm'],
        },
        
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
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
    jsx: 'automatic'
  }
});

