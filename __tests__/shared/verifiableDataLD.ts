import { TAgent, IDIDManager, IDataStore, IIdentifier } from '../../packages/core/src'
import { IDataStoreORM } from '../../packages/data-store/src'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'
import { IDIDComm } from '../../packages/did-comm/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer & IDataStore & IDataStoreORM & IDIDComm>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in LD', () => {
    let agent: ConfiguredAgent
    let didEthrIdentifier: IIdentifier
    let didKeyIdentifier: IIdentifier
    let storedCredentialHash: string
    let challenge: string

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      challenge = 'TEST_CHALLENGE_STRING'
      didEthrIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:ethr' })
      didKeyIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:key' })
    })
    afterAll(testContext.tearDown)

    it('should create verifiable credential in LD', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: didEthrIdentifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            name: 'Martin, the great',
          },
        },
        save: false,
        proofFormat: 'lds',
      })

      // Check credential:
      expect(verifiableCredential).toHaveProperty('proof')
      expect(verifiableCredential).toHaveProperty('proof.jws')
      expect(verifiableCredential.proof.verificationMethod).toEqual(`${didEthrIdentifier.did}#controller`)

      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://veramo.io/contexts/profile/v1',
        'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld',
      ])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Profile'])

      storedCredentialHash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should verify a verifiable credential in LD', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      // check that verification works
      const result = await agent.verifyCredential({
        credential: verifiableCredential,
      })

      expect(result).toEqual(true)
    })

    it('should handleMessage with VC (non-JWT)', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      const parsedMessage = await agent.handleMessage({
        raw: JSON.stringify({
          body: verifiableCredential,
          type: 'w3c.vc',
        }),
        save: false,
        metaData: [{ type: 'LDS' }],
      })
      expect(typeof parsedMessage.id).toEqual('string')
    })

    it('should fail handleMessage with wrong VC (non-JWT)', async () => {
      expect.assertions(1)

      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      verifiableCredential.credentialSubject.name = 'Martin, the not so greats'

      try {
        await agent.handleMessage({
          raw: JSON.stringify({
            body: verifiableCredential,
            type: 'w3c.vc',
          }),
          save: false,
          metaData: [{ type: 'LDS' }],
        })
      } catch (e) {
        expect(e).toEqual(Error('Error verifying LD Verifiable Credential'))
      }
    })

    it('should sign a verifiable presentation in LD', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: didEthrIdentifier.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: [verifiableCredential],
        },
        challenge,
        // TODO: QueryFailedError: SQLITE_CONSTRAINT: NOT NULL constraint failed: presentation.issuanceDate
        // Currently LD Presentations are NEVER saved. (they have no issuanceDate)
        save: true,
        proofFormat: 'lds',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jws')
    })

    it('should sign and verify a verifiable presentation in LD', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      const domain = 'TEST_DOMAIN'
      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: didEthrIdentifier.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: [verifiableCredential],
        },
        challenge,
        domain,
        proofFormat: 'lds',
      })

      // console.log(JSON.stringify(verifiablePresentation, null,  2))

      const result = await agent.verifyPresentation({
        presentation: verifiablePresentation,
        challenge,
        domain,
      })

      expect(result).toBeTruthy()
    })

    it('should handleMessage with VPs (non-JWT)', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: didEthrIdentifier.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: [verifiableCredential],
        },
        challenge: 'VERAMO',
        domain: 'VERAMO',
        proofFormat: 'lds',
      })

      const parsedMessage = await agent.handleMessage({
        raw: JSON.stringify({
          body: verifiablePresentation,
          type: 'w3c.vp',
        }),
        save: false,
        metaData: [{ type: 'LDS' }],
      })
      expect(typeof parsedMessage.id).toEqual('string')
    })

    it('should create verifiable credential in LD with did:key', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: didKeyIdentifier.did },
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://veramo.io/contexts/profile/v1'
          ],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: didKeyIdentifier.did,
            name: "Martin, the great"
          },
        },
        proofFormat: 'lds',
      })

      // Check credential:
      expect(verifiableCredential).toHaveProperty('proof')
      expect(verifiableCredential).toHaveProperty('proof.jws')
      expect(verifiableCredential.proof.verificationMethod).toEqual(`${didKeyIdentifier.did}#${didKeyIdentifier.did.substring(didKeyIdentifier.did.lastIndexOf(':') + 1)}`)

      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://veramo.io/contexts/profile/v1',
      ])
      expect(verifiableCredential['type']).toEqual(
        ['VerifiableCredential', 'Profile'])

      storedCredentialHash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof storedCredentialHash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash: storedCredentialHash })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should verify a verifiable credential in LD with did:key', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({ hash: storedCredentialHash })

      const result = await agent.verifyCredential({
        credential: verifiableCredential
      })

      expect(result).toEqual(true)
    })


  })
}
