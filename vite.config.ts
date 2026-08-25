import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@radix-ui/react-checkbox', '@radix-ui/react-switch', '@radix-ui/react-collapsible', '@radix-ui/react-progress', '@radix-ui/react-avatar', '@radix-ui/react-label', '@radix-ui/react-separator', '@radix-ui/react-slot'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
        },
      },
    },
  },
  server: {
    port: 3001,
  },
})
