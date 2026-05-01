import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise warning limit slightly — our chunks are intentionally split
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor libs into separate cached chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom") || id.includes("react-router")) return "vendor-router"
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux") || id.includes("immer")) return "vendor-redux"
            if (id.includes("react-hot-toast")) return "vendor-toast"
            if (id.includes("react-dom") || id.includes("react/")) return "vendor-react"
          }
        },
      },
    },

    // Faster minification with esbuild (default, but explicit)
    minify: "esbuild",

    // Generate source maps only in dev
    sourcemap: false,

    // Target modern browsers — smaller output, no legacy polyfills
    target: "es2020",
  },

  // Pre-bundle deps for faster dev server cold start
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "react-hot-toast",
    ],
  },
})
