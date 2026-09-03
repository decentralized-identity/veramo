// Vitest browser-mode runner for the Shared Test Suite set.
// Mirrors the structure of browserAgent.browser-test.ts (the legacy jest-puppeteer
// runner), but executes the suites INSIDE the browser via Vitest browser mode.
// Per-suite isolation (fresh context per suite) is ticket 03 — this keeps the
// legacy single testContext structure.
import { getAgent, setup } from '../src/veramo/setup.js'

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

describe('Browser integration tests (Vitest)', () => {
  describe('shared tests', () => {
    const testContext = { getAgent, setup, tearDown: async () => true }
    verifiableDataJWT(testContext)
    verifiableDataLD(testContext)
    handleSdrMessage(testContext)
    resolveDid(testContext)
    webDidFlow(testContext)
    saveClaims(testContext)
    documentationExamples(testContext)
    keyManager(testContext)
    didManager(testContext)
    messageHandler(testContext)
    utils(testContext)
    didCommPacking(testContext)
  })
})
