import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
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
  ].filter(Boolean),
  
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
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Fixed: Remove duplicate assignment - keep react-router-dom only in vendor
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          // Include react-markdown since it's in dependencies
          markdown: ['react-markdown']
        },
        
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.jsx', '').replace('.tsx', '') : 'chunk';
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
    
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
  },
  
  // CSS processing - let PostCSS config handle this
  css: {
    devSourcemap: true,
  },
  
  // Development server optimization
  server: {
    port: 3000,
    host: true,
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
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },

  esbuild: {
    // Keep function names for better debugging
    keepNames: true,
    // Handle JSX properly
    jsx: 'automatic',
    drop: ['console', 'debugger']
  }
})