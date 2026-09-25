// Node sanity check (NOT the gate): runs the same test modules under Node to
// prove the test logic is correct. Node has crypto/TextDecoder/Buffer, so a
// pass here says nothing about React Native; any Hermes-only failure is then a
// genuine runtime finding. Uses Node's built-in TypeScript stripping.
import { main } from '../src/safe-set.tests.ts'
import { runLd } from '../src/ld.tests.ts'
import { runLdLib } from '../src/ld-lib.tests.ts'
import { dcc } from '../src/stacks/dcc.ts'
import { upstream } from '../src/stacks/upstream.ts'
import { veramoEd25519Signature2020 } from '../src/stacks/veramo.ts'
import { isPass, LD_LIB_TEST_COUNT, LD_TEST_COUNT, SAFE_SET_TEST_COUNT } from '../src/verdict.js'

const results = [
  ['safe set', await main(), SAFE_SET_TEST_COUNT],
  ['ld-veramo', await runLd(veramoEd25519Signature2020()), LD_TEST_COUNT],
  ['ld-dcc', await runLdLib(dcc), LD_LIB_TEST_COUNT],
  ['ld-upstream', await runLdLib(upstream), LD_LIB_TEST_COUNT],
]
let ok = true
for (const [name, result, expected] of results) {
  const pass = isPass(result, expected)
  console.log(
    `${name}: ${pass ? 'PASS' : 'FAIL'} (passed=${result.passed} failed=${result.failed} expected=${expected})`,
  )
  ok &&= pass
}
process.exit(ok ? 0 : 1)
