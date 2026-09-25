// Node sanity check (NOT the gate): runs the same safe-set test module under
// Node to prove the test logic is correct. Node has crypto/TextDecoder/Buffer,
// so a pass here says nothing about React Native; any Hermes-only failure is
// then a genuine runtime finding. Uses Node's built-in TypeScript stripping.
import { main } from '../src/safe-set.tests.ts'
import { isPass } from '../src/verdict.js'

process.exit(isPass(await main()) ? 0 : 1)
