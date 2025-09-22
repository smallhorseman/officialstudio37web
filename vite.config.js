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
    sourcemap: 'hidden', // Only generate source maps, don't include in bundle
    
    // CSS optimization
    cssMinify: 'lightningcss',
    
    // Advanced chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('react-markdown')) {
              return 'markdown';
            }
            // Group other vendor libraries
            return 'vendor';
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            if (id.includes('Chatbot') || id.includes('EnhancedCRM') || id.includes('EnhancedCMS')) {
              return 'admin-components';
            }
            return 'components';
          }
          
          // Utils and hooks
          if (id.includes('/hooks/') || id.includes('/utils/')) {
            return 'utils';
          }
        },
        
        // Optimize chunk and asset names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.(jsx|tsx)$/, '') : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2, // Multiple passes for better optimization
      },
      mangle: {
        safari10: true,
      },
      format: {
        safari10: true,
        comments: false // Remove all comments
      },
    },
    
    // Chunk size optimization
    chunkSizeWarningLimit: 500, // Lower limit to encourage splitting
    
    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    
    // Additional optimizations
    reportCompressedSize: false, // Faster builds
    assetsInlineLimit: 4096, // Inline smaller assets
  },
  
  // CSS processing optimization
  css: {
    devSourcemap: true,
    modules: {
      // CSS modules optimization
      localsConvention: 'camelCase',
      generateScopedName: process.env.NODE_ENV === 'production' 
        ? '[hash:base64:5]' 
        : '[name]__[local]__[hash:base64:5]'
    }
  },
  
  // Development server optimization
  server: {
    port: 3000,
    host: true,
    
    // Enhanced HMR
    hmr: {
      overlay: true,
      port: 3001 // Separate HMR port
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
    __DEV__: process.env.NODE_ENV === 'development',
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
    keepNames: process.env.NODE_ENV === 'development',
    jsx: 'automatic',
    legalComments: 'none',
    target: 'es2020',
    // Tree shaking optimization
    treeShaking: true,
    // Remove unused imports
    ignoreAnnotations: false,
  }
});

