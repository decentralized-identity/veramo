// @veramo/credential-ld through its public entry point, replaying the golden fixtures (src/ld.tests.ts), loaded as an
// RN app loads it. Unlike the safe set it gets no crypto.getRandomValues: credential-ld does not need it.
import './rn-runtime.js'
import './text-encoding.js'
import { runLd } from './ld.tests.js'

;(globalThis as any).__harnessResult = runLd()
