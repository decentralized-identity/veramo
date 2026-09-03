import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server config that mirrors the existing CRA/craco dev server (see craco.config.cjs:
// port 4269). Kept alongside CRA so both runners can coexist on this package.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4269,
  },
  optimizeDeps: {
    // Workspace @veramo packages are consumed from source TypeScript in the new
    // runner; excluding them keeps Vite from pre-bundling their build/ output.
    exclude: ['@veramo/*'],
  },
})
