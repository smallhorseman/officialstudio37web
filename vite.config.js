import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      // Bundle analyzer (only when requested)
      ...(process.env.ANALYZE === 'true' ? [visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })] : [])
    ],
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      cssMinify: 'esbuild',
      minify: isProduction ? 'terser' : false,
      
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            ui: ['react-markdown']
          },
          
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
