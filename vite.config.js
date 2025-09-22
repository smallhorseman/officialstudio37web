import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react({
        // Enable SWC for faster builds and smaller bundles
        jsxRuntime: 'automatic',
      }),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          // Add offline fallback
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
        },
        manifest: {
          name: 'Studio37 Photography',
          short_name: 'Studio37',
          description: 'Professional photography and content strategy services in Houston, TX',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      }),
      // Only add visualizer in analyze mode
      ...(process.env.ANALYZE === 'true' ? [visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })] : [])
    ],
    
    build: {
      outDir: 'dist',
      // Enable source maps for better debugging
      sourcemap: false, // Disable source maps to prevent SW issues
      
      // CSS optimization
      cssMinify: 'esbuild', // Use esbuild instead of lightningcss,
      minify: isProduction ? 'terser' : false,
      
      // Fixed chunk splitting - removed duplicate assignments
      rollupOptions: {
        output: {
          manualChunks: {
            // Fixed: Remove duplicate router chunk that conflicts with vendor
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            ui: ['react-markdown']
          },
          
          // Clean asset naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop() || '';
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
      
      // Production optimizations
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        mangle: {
          safari10: true
        }
      } : {},
      
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
    },
    
    server: {
      port: 3000,
      host: true,
      open: true
    },
    
    preview: {
      port: 4173,
      host: true
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    
    css: {
      devSourcemap: !isProduction,
    }
  };
});
