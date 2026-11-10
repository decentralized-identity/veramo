import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const runNode = promisify(execFile)

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const smokeFixture = resolve(repoRoot, '__tests__/fixtures/esm-smoke.mjs')

// Vitest transforms sources leniently, which can mask CommonJS/ESM interop
// problems (e.g. named imports from CJS dependencies such as fast-uri).
// These built entry points are loaded by the veramo CLI and api-extractor,
// so each must import cleanly with plain `node`.
const builtEntries: Array<[string, string]> = [
  ['@veramo/cli objectCreator', 'packages/cli/build/lib/objectCreator.js'],
  ['@veramo/url-handler', 'packages/url-handler/build/index.js'],
  ['@veramo/remote-server', 'packages/remote-server/build/index.js'],
  ['@veramo/credential-ld', 'packages/credential-ld/build/index.js'],
]

describe('built packages load under plain Node ESM', () => {
  for (const [name, entry] of builtEntries) {
    it(`should import ${name} without ESM interop errors`, async (ctx) => {
      const entryPath = resolve(repoRoot, entry)
      if (!existsSync(entryPath)) {
        console.warn(`Skipping: ${entry} not found. Run 'pnpm build' first.`)
        return ctx.skip()
      }
      await expect(
        runNode(process.execPath, [smokeFixture, pathToFileURL(entryPath).href]),
      ).resolves.toBeTruthy()
    })
  }
})
