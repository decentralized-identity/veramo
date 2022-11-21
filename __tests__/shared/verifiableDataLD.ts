// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IMessageHandler,
  TAgent,
  VerifiableCredential,
  VerifiablePresentation,
} from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'

type ConfiguredAgent = TAgent<
  IDIDManager & ICredentialPlugin & IDataStore & IDataStoreORM & IDIDComm & IMessageHandler
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in LD', () => {
    let agent: ConfiguredAgent
    let didEthrIdentifier: IIdentifier
    let didKeyIdentifier: IIdentifier
    let pkhIdentifier: IIdentifier
    let storedCredentialHash: string
    let storedPkhCredentialHash: string
    let challenge: string

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      challenge = 'TEST_CHALLENGE_STRING'
      didEthrIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:ethr' })
      didKeyIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:key' })
      pkhIdentifier = await agent.didManagerCreate({ kms: 'local', provider: "did:pkh", options: { chainId: "1"} })
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
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
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

      expect(result.verified).toEqual(true)
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

      // tamper with credential
      verifiableCredential.credentialSubject.name = 'Martin, the not so greats'

      await expect(
        agent.handleMessage({
          raw: JSON.stringify({
            body: verifiableCredential,
            type: 'w3c.vc',
          }),
          save: false,
          metaData: [{ type: 'LDS' }],
        }),
      ).rejects.toThrow(/Verification error/)
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

      expect(result.verified).toEqual(true)
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
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: didKeyIdentifier.did,
            name: 'Martin, the great',
          },
        },
        proofFormat: 'lds',
      })

      // Check credential:
      expect(verifiableCredential).toHaveProperty('proof')
      expect(verifiableCredential).toHaveProperty('proof.jws')
      expect(verifiableCredential.proof.verificationMethod).toEqual(
        `${didKeyIdentifier.did}#${didKeyIdentifier.did.substring(
          didKeyIdentifier.did.lastIndexOf(':') + 1,
        )}`,
      )

      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://veramo.io/contexts/profile/v1',
      ])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Profile'])

      storedCredentialHash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof storedCredentialHash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should verify a verifiable credential in LD with did:key', async () => {
      const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
        hash: storedCredentialHash,
      })

      const result = await agent.verifyCredential({
        credential: verifiableCredential,
      })

      expect(result.verified).toEqual(true)
    })

    it('should create verifiable credential in LD with did:pkh', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: pkhIdentifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: pkhIdentifier.did,
            name: 'Martin, the great',
          },
        },
        proofFormat: 'lds',
      })

      // Check credential:
      expect(verifiableCredential).toHaveProperty('proof')
      expect(verifiableCredential).toHaveProperty('proof.jws')
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Profile'])

      storedPkhCredentialHash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof storedPkhCredentialHash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({
        hash: storedPkhCredentialHash,
      })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    describe('credential verification policies', () => {
      it('can verify credential at a particular time', async () => {
        const issuanceDate = '2019-08-19T09:15:20.000Z' // 1566206120
        const expirationDate = '2019-08-20T10:42:31.000Z' // 1566297751
        let credential = await agent.createVerifiableCredential({
          proofFormat: 'lds',
          credential: {
            issuer: { id: didKeyIdentifier.did },
            '@context': ['https://veramo.io/contexts/profile/v1'],
            type: ['Profile'],
            issuanceDate,
            expirationDate,
            credentialSubject: {
              id: didKeyIdentifier.did,
              name: 'hello',
            },
          },
          now: 1566206120,
        })

        const result = await agent.verifyCredential({ credential })
        expect(result.verified).toBe(false)

        const result2 = await agent.verifyCredential({
          credential,
          policies: { now: 1566297000 },
        })
        expect(result2.verified).toBe(true)
      })

      it('can override credentialStatus check', async () => {
        const cred = await agent.createVerifiableCredential({
          proofFormat: 'lds',
          credential: {
            issuer: { id: didKeyIdentifier.did },
            '@context': ['https://veramo.io/contexts/profile/v1'],
            type: ['Profile'],
            credentialSubject: {
              id: didKeyIdentifier.did,
              name: 'hello',
            },
            credentialStatus: {
              id: 'override me',
              type: 'ThisMethodDoesNotExist2022',
            },
          },
          now: 1566206120,
        })
        await expect(agent.verifyCredential({ credential: cred })).rejects.toThrow(/^invalid_setup:/)

        const result2 = await agent.verifyCredential({
          credential: cred,
          policies: { credentialStatus: false },
        })
        expect(result2.verified).toBe(true)
      })
    })
  })
}
