import { describe, expect, it } from 'vitest'
import { runLd } from '../../../test-rn-app/src/ld.tests'
import { LD_TEST_COUNT } from '../../../test-rn-app/src/verdict.js'

// @veramo/credential-ld in a plain browser page: no Node-stdlib aliases, no `process`/`Buffer`/`global`
// defines, no setup file (vitest.no-polyfills.config.ts). Same golden-fixture replay as the RN harness:
// verify the pre-de-fork credentials and presentations of all four suites and re-issue them
// byte-for-byte.
describe('@veramo/credential-ld without polyfills', () => {
  it('verifies and re-issues the golden fixtures of all four suites', async () => {
    const result = await runLd()
    expect(result.failures).toEqual([])
    expect(result.passed).toBe(LD_TEST_COUNT)
  })
})
