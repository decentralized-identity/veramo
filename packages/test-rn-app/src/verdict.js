// The one pass predicate, shared by scripts/run.mjs (Hermes, the gate) and
// scripts/node-sanity.mjs. The count is fixed here, not derived from what ran,
// so a test that silently stops running fails the harness.
export const SAFE_SET_TEST_COUNT = 8

export const isPass = (result) => result?.passed === SAFE_SET_TEST_COUNT && result.failed === 0
