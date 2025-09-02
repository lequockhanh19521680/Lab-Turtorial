import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'terser',
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-icons',
              '@radix-ui/react-label',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@headlessui/react',
              '@heroicons/react',
              'lucide-react',
            ],
            'state-vendor': [
              '@reduxjs/toolkit',
              'react-redux',
              '@tanstack/react-query',
            ],
            'utils-vendor': [
              'axios',
              'date-fns',
              'uuid',
              'zod',
              'clsx',
              'tailwind-merge',
              'class-variance-authority',
            ],
            'chart-vendor': [
              'recharts',
            ],
            'animation-vendor': [
              'framer-motion',
            ],
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const extType = path.extname(assetInfo.name!).slice(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Bundle size warnings
      chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'axios',
        'zod',
      ],
    },
    define: {
      // Define environment variables for the build
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    css: {
      devSourcemap: mode === 'development',
      postcss: './postcss.config.js',
    },
    // Performance optimizations
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  }
})