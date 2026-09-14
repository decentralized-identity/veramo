import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server config for the React app (port 4269, the same port the former
// craco dev server used).
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
