// The pass predicate, shared by scripts/run.mjs (Hermes, the gate) and
// scripts/node-sanity.mjs. Counts are fixed here, not derived from what ran,
// so a test that silently stops running fails the harness.
export const SAFE_SET_TEST_COUNT = 8
// 4 suites x (verify credential, verify presentation, byte-identical re-issue)
export const LD_TEST_COUNT = 12

export const isPass = (result, expected) => result?.passed === expected && result.failed === 0

/** Prints the one machine-readable line the runner parses. */
export const report = (result) => {
  console.log('RN_HARNESS_RESULT ' + JSON.stringify(result))
  return result
}
