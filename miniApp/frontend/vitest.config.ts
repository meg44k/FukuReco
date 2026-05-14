import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    enviroment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include:['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude:['**/node_modules/**', '/tests/**/*.spec.ts','**/tests-examples/**'],
    alias: {
      '@' : path.resolve(__dirname, './'),
    },
  },
})
