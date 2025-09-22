import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true
  },
  preview: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable to avoid source map errors
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['react-beautiful-dnd']
        }
      },
      // Suppress warnings about external modules
      external: (id) => {
        return id.includes('hubspot') || id.includes('hs-scripts')
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      // Prevent mangling of component names to fix PhoneIcon issues
      mangle: {
        keep_fnames: true,
        reserved: ['PhoneIcon', 'MailIcon', 'MapPinIcon']
      }
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'react-beautiful-dnd'],
    // Force pre-bundling of problematic dependencies
    force: true
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    postcss: {
      plugins: [
        // Add autoprefixer to handle vendor prefixes properly
        {
          postcssPlugin: 'custom-fixes',
          Once(root) {
            // Remove problematic webkit rules that cause parsing errors
            root.walkRules(rule => {
              if (rule.selector.includes('-webkit-text-size-adjust')) {
                rule.remove()
              }
              // Fix invalid media queries with color values
              if (rule.parent && rule.parent.type === 'atrule' && 
                  rule.parent.name === 'media' && 
                  rule.parent.params.includes('#')) {
                rule.parent.remove()
              }
            })
          }
        }
      ]
    }
  },
  define: {
    // Optimize production builds and fix undefined issues
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Define globals to prevent undefined errors
    'global': 'globalThis',
    '__DEV__': process.env.NODE_ENV === 'development'
  },
  resolve: {
    alias: {
      // Add aliases to prevent import issues
      '@': '/src',
      'components': '/src/components',
      'hooks': '/src/hooks'
    }
  },
  // Add error handling for external script failures
  esbuild: {
    // Keep function names for better debugging
    keepNames: true,
    // Handle JSX properly
    jsx: 'automatic'
  }
})

