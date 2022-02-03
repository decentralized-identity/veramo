import { IDIDDiscovery } from '../../packages/did-discovery/src'
import { IAgentOptions, IDIDManager, TAgent } from '../../packages/core/src'
import { IDataStoreORM } from '../../packages/data-store/src'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'
import { getConnection } from 'typeorm'

type ConfiguredAgent = TAgent<IDIDManager & IDIDDiscovery & IDataStoreORM & ICredentialIssuer>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (agentOptions: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DID discovery', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup({ context: { dbName: 'did-discovery-test' } })
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should discover did by alias', async () => {
      const identifier = await agent.didManagerGetOrCreate({
        alias: 'alice',
      })

      const result = await agent.discoverDid({ query: 'alice' })

      expect(result.results[0].matches[0]).toEqual({
        did: identifier.did,
        metaData: {
          alias: 'alice',
        },
      })
    })

    it('should discover did by profile vc', async () => {
      const identifier = await agent.didManagerCreate({})

      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            name: 'bobby',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      const result = await agent.discoverDid({ query: 'bobby' })

      expect(result.results[0].matches[0]).toEqual({
        did: identifier.did,
        metaData: { verifiableCredential },
      })
    })

    it('should discover did by alias and profile vc', async () => {
      const identifier = await agent.didManagerGetOrCreate({
        alias: 'bob',
      })

      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            name: 'bobby',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      const result = await agent.discoverDid({ query: 'bob' })

      expect(result.results).toHaveLength(2)
      expect(result.results[0].matches).toHaveLength(1)
      expect(result.results[1].matches).toHaveLength(2)

      expect(result.results[0].matches[0]).toEqual({
        did: identifier.did,
        metaData: {
          alias: 'bob',
        },
      })

      expect(result.results[1].matches[1]).toEqual({
        did: identifier.did,
        metaData: { verifiableCredential },
      })
    })

    // THIS HAS TO BE THE LAST TEST IN THIS FILE!
    it('should return errors', async () => {
      const connection = getConnection('did-discovery-test')
      await connection.close()
      const result = await agent.discoverDid({ query: 'bob' })
      expect(result?.errors?.profile).toMatch(
        /(Connection with sqlite database is not established)|(Cannot read property 'connect' of undefined)/,
      )
    })
  })
}
