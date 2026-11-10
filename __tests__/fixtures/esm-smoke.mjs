// Runs under plain `node` (spawned by ../esm-interop.test.mts) to verify that
// built package outputs load with Node's strict ESM loader, which — unlike
// vitest's transform — reports CommonJS/ESM named-export interop problems.
// Loads each entry passed as an argument and exits non-zero on any failure.

const entries = process.argv.slice(2)

if (entries.length === 0) {
  console.error('usage: node esm-smoke.mjs <built-entry.(js|mjs)> [...]')
  process.exit(1)
}

try {
  for (const entry of entries) {
    await import(entry)
  }
} catch (error) {
  console.error(`ESM interop check failed: ${error?.message ?? error}`)
  process.exit(1)
}
