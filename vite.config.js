import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path
  base: './',
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    
    // Rollup options
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'scrollytelling-core': [
            './src/js/scrollytelling-engine.js',
            './src/js/animation-controller.js'
          ],
          'media-navigation': [
            './src/js/media-controller.js',
            './src/js/navigation-controller.js'
          ],
          'accessibility-progress': [
            './src/js/accessibility-controller.js',
            './src/js/progress-indicator.js'
          ]
        }
      }
    },
    
    // Terser options for minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.md', '**/*.json'],
  
  // Plugin configuration
  plugins: [],
  
  // Optimization
  optimizeDeps: {
    include: ['gsap']
  },
  
  // Preview configuration (for production preview)
  preview: {
    port: 3000,
    open: true
  }
});