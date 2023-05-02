// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  TAgent,
} from '../../packages/core-types/src'

import * as fs from 'fs'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialPlugin & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('credential interop', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    test.each([
      // ['cred1.json'],
      // ['cred2.json'],
      ['cred3.json'],
      ['cred4.json'],
    ])("should verify credential from the wild: '%s'", async (text) => {
      let credential = (await fs.promises.readFile(`./__tests__/fixtures/${text}`, 'utf8')).toString()
      credential = JSON.parse(credential)

      const result = await agent.verifyCredential({ credential })
      expect(result.verified).toBe(true)
    })
  })
}
