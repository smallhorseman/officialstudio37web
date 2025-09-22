import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      // Enable SWC for faster builds and smaller bundles
      jsxRuntime: 'automatic',
    }),
    // Bundle analyzer (only in build)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // Better visualization
    }),
  ].filter(Boolean),
  
  // Optimize dependencies with better tree shaking
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclude large optional dependencies
      'react-markdown'
    ]
  },
  
  build: {
    // Enable source maps for better debugging
    sourcemap: false, // Disable source maps to prevent SW issues
    
    // CSS optimization
    cssMinify: 'esbuild', // Use esbuild instead of lightningcss
    
    // Advanced chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        },
        
        // Simpler asset naming to prevent SW cache issues
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Aggressive minification
    minify: 'esbuild', // Use esbuild instead of terser for better compatibility
    chunkSizeWarningLimit: 1000,
    target: 'es2015', // More compatible target
    assetsInlineLimit: 4096, // Inline smaller assets
  },
  
  // CSS processing optimization
  css: {
    devSourcemap: true,
  },
  
  // Development server optimization
  server: {
    port: 3000,
    host: true,
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

  // Enhanced esbuild configuration
  esbuild: {
    keepNames: process.env.NODE_ENV === 'development',
    jsx: 'automatic',
    legalComments: 'none',
    target: 'es2020',
    // Tree shaking optimization
    treeShaking: true,
    // Remove unused imports
    ignoreAnnotations: false,
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
});
w
