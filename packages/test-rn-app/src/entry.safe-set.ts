// The safe set (an agent without JSON-LD), loaded as an RN app loads it: RN's JS setup, the consumer polyfills
// (at the top of index.js), then the tests. The runner reads the result from `__harnessResult`.
import './rn-runtime.js'
import './text-encoding.js'
import { runSafeSet } from './safe-set.tests.js'

;(globalThis as any).__harnessResult = runSafeSet()
