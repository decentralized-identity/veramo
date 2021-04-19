import { TAgent, IDIDManager, IDataStore, IIdentifier } from '../../packages/core/src'
import { IDataStoreORM } from '../../packages/data-store/src'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in LD', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
      identifier = await agent.didManagerCreate({ kms: 'local' })
      expect(identifier).toHaveProperty('did')
    })

    it('should resolve identifier', async () => {
      const didDoc = (await agent.resolveDid({ didUrl: identifier.did })).didDocument
      console.log(JSON.stringify(didDoc, null, 2));
      expect(didDoc).toHaveProperty('verificationMethod')
    })


    it('should create verifiable credential in LD', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://veramo.io/contexts/socialmedia/v1'
          ],
          type: ['VerifiableCredential', 'VerifableSocialMediaPosting'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            // id: 'did:web:example.com',
            // you: 'Rock',
          },
        },
        proofFormat: 'lds',
      })

      console.log(JSON.stringify(verifiableCredential, null, 2))
      console.log(`JWS: ${verifiableCredential.proof.jws}`)
      // check that verification works

      const result = await agent.verifyVerifiableCredential({
        credential: verifiableCredential
      })

      expect(result).toEqual(true)

      // expect(verifiableCredential).toHaveProperty('proof.jwt')
      // expect(verifiableCredential['@context']).toEqual([
      //   'https://www.w3.org/2018/credentials/v1',
      //   'https://example.com/1/2/3',
      // ])
      // expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Custom'])
      //
      // const hash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      // expect(typeof hash).toEqual('string')
      //
      // const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash })
      // expect(verifiableCredential).toEqual(verifiableCredential2)
    })

  })
}
