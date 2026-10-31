// The harness app's index.js. As at the top of an RN app's index.js: RN's JS setup (a Veramo RN app needs no polyfill
// on RN 0.88: Hermes has TextDecoder since then). Then the test files register their tests (harness/vitest.ts), and
// the runner reads the result of running them from `__harnessResult`. To add a test file, import it here.
import './rn-runtime.js'
import '../tests/agent.test.js'
import '../tests/credential-ld.test.js'
import { run } from './vitest.js'

;(globalThis as any).__harnessResult = run()
