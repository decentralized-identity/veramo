// The harness app's index.js. As at the top of an RN app's index.js: RN's JS setup, then the polyfills a Veramo RN app
// installs. Then the test files register their tests (harness/vitest.ts), and the runner reads the result of running
// them from `__harnessResult`. To add a test file, import it here.
import './rn-runtime.js'
// TextDecoder: Hermes has only TextEncoder, and did-jwt's multiformats needs it at module load (Expo ships one)
import 'fast-text-encoding'
import '../tests/agent.test.js'
import '../tests/credential-ld.test.js'
import { run } from './vitest.js'

;(globalThis as any).__harnessResult = run()
