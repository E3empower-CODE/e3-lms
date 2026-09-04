import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest transforms via esbuild, whose default JSX runtime is classic; force
  // the automatic runtime so test files need not import React. Vite 8 builds
  // with oxc, so this is scoped to test runs to avoid an "esbuild ignored"
  // warning during `vite build`.
  ...(process.env.VITEST ? { esbuild: { jsx: 'automatic' } } : {}),
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
