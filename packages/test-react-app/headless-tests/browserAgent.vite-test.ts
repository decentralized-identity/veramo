// Vitest browser-mode runner for the Shared Test Suite set.
// Mirrors the structure of the legacy browserAgent runner it replaces, but
// executes the suites INSIDE the browser via Vitest browser mode.
//
// Each suite runs in its own fresh world: every `describe` block below supplies
// a testContext wired to the real setup()/tearDown() from src/veramo/setup.ts.
// Each suite's own beforeAll calls setup() (fresh ganache provider + freshly
// deployed ERC1056 registry + fresh agent + reset in-memory store) and its
// afterAll calls tearDown() (stops the previous ganache provider, resets the
// store), so no state leaks between suites. The suite functions themselves are
// called exactly as before — they receive the testContext and register their
// own hooks.
//
// Set VITE_REVERSE_SUITES=1 to run the suites in reverse order (used to prove
// there is no ordering dependency between suites).
import { getAgent, setup, tearDown } from '../src/veramo/setup.js'

import verifiableDataJWT from '../../../__tests__/shared/verifiableDataJWT.js'
import verifiableDataLD from '../../../__tests__/shared/verifiableDataLD.js'
import handleSdrMessage from '../../../__tests__/shared/handleSdrMessage.js'
import resolveDid from '../../../__tests__/shared/resolveDid.js'
import webDidFlow from '../../../__tests__/shared/webDidFlow.js'
import saveClaims from '../../../__tests__/shared/saveClaims.js'
import documentationExamples from '../../../__tests__/shared/documentationExamples.js'
import didCommPacking from '../../../__tests__/shared/didCommPacking.js'
import keyManager from '../../../__tests__/shared/keyManager.js'
import didManager from '../../../__tests__/shared/didManager.js'
import messageHandler from '../../../__tests__/shared/messageHandler.js'
import utils from '../../../__tests__/shared/utils.js'

const suites = [
  { name: 'verifiableDataJWT', fn: verifiableDataJWT },
  { name: 'verifiableDataLD', fn: verifiableDataLD },
  { name: 'handleSdrMessage', fn: handleSdrMessage },
  { name: 'resolveDid', fn: resolveDid },
  { name: 'webDidFlow', fn: webDidFlow },
  { name: 'saveClaims', fn: saveClaims },
  { name: 'documentationExamples', fn: documentationExamples },
  { name: 'keyManager', fn: keyManager },
  { name: 'didManager', fn: didManager },
  { name: 'messageHandler', fn: messageHandler },
  { name: 'utils', fn: utils },
  { name: 'didCommPacking', fn: didCommPacking },
]

const orderedSuites = import.meta.env?.VITE_REVERSE_SUITES ? [...suites].reverse() : suites

describe('Browser integration tests (Vitest)', () => {
  for (const { name, fn } of orderedSuites) {
    describe(name, () => {
      const testContext = { getAgent, setup, tearDown }
      fn(testContext)
    })
  }
})
