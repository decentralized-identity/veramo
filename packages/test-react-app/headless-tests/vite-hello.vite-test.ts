import { describe, expect, it } from 'vitest'
import resolveDid from '../../../__tests__/shared/resolveDid'

// Smoke test for the Vitest browser-mode runner: proves the harness boots a
// headless Chromium and transpiles the Shared Test Suite source TypeScript
// (including its `../../packages/core-types/src` imports) on the fly, without a
// `pnpm build` pre-step.
describe('Vitest browser-mode smoke test', () => {
  it('imports the shared resolveDid suite directly from source', () => {
    expect(typeof resolveDid).toBe('function')
  })
})
