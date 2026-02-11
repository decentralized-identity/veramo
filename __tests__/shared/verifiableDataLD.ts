// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IMessageHandler,
  TAgent,
} from '../../packages/core-types/src'
import { IDIDComm } from '../../packages/did-comm/src'
// @ts-ignore
import nock from 'nock'

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
      didEthrIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:ethr:ganache' })
      didKeyIdentifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:key' })
      pkhIdentifier = await agent.didManagerCreate({
        kms: 'local',
        provider: 'did:pkh',
        options: { chainId: '1' },
      })
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
      const proofValue = verifiableCredential.proof.jws ?? verifiableCredential.proof.proofValue
      expect(proofValue).toBeDefined()
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

    it('should create verifiable credential with external context', async () => {
      const credential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: pkhIdentifier.did },
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://veramo.io/contexts/discord-kudos/v1',
          ],
          type: ['VerifiableCredential', 'DiscordKudos'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: pkhIdentifier.did,
            kudos: 'Thank you',
          },
        },
        proofFormat: 'lds',
        fetchRemoteContexts: true,
      })

      // Check credential:
      expect(credential).toHaveProperty('proof')
      expect(credential).toHaveProperty('proof.jws')
      expect(credential['type']).toEqual(['VerifiableCredential', 'DiscordKudos'])

      const result = await agent.verifyCredential({
        credential,
        fetchRemoteContexts: true,
      })
      expect(result.verified).toBe(true)
    })

    it('should create and verify verifiable credential in LD with did:key Ed25519VerificationKey2020', async () => {
      const iss = await agent.didManagerCreate({ provider: 'did:key', options: { keyType: 'Ed25519' } })
      const credential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: iss.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: didKeyIdentifier.did,
            name: 'of the game',
          },
        },
        proofFormat: 'lds',
        resolutionOptions: {
          publicKeyFormat: 'Ed25519VerificationKey2020',
        },
      })

      // Check credential:
      expect(credential).toHaveProperty('proof')
      const proofValue = credential.proof.jws ?? credential.proof.proofValue
      expect(proofValue).toBeDefined()

      expect(credential.proof.type).toEqual('Ed25519Signature2020')

      const verification = await agent.verifyCredential({
        credential: credential,
        resolutionOptions: {
          publicKeyFormat: 'Ed25519VerificationKey2020',
        },
      })
      expect(verification.verified).toBe(true)
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
              id: 'override:me',
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

  // Mock the external context URL
  beforeAll(() => {
    nock('https://veramo.io')
      .persist() // Allow the mock to be used multiple times
      .get('/contexts/discord-kudos/v1')
      .reply(200, {
        '@context': {
          'w3ccred': 'https://www.w3.org/2018/credentials#',
          'schema-id': 'https://veramo.io/contexts/discord-kudos#',
          DiscordKudos: {
            '@id': 'schema-id',
          },
          kudos: {
            '@id': 'schema-id:kudos',
            '@type': 'http://schema.org/Text',
          },
          url: {
            '@id': 'schema-id:url',
            '@type': 'http://schema.org/Text',
          },
          discordUserId: {
            '@id': 'schema-id:discordUserId',
            '@type': 'http://schema.org/Text',
          },
          discordUserName: {
            '@id': 'schema-id:discordUserName',
            '@type': 'http://schema.org/Text',
          },
          discordUserAvatar: {
            '@id': 'schema-id:discordUserAvatar',
            '@type': 'http://schema.org/URL',
          },
          discordAuthorId: {
            '@id': 'schema-id:discordAuthorId',
            '@type': 'http://schema.org/Text',
          },
          discordAuthorName: {
            '@id': 'schema-id:discordAuthorName',
            '@type': 'http://schema.org/Text',
          },
          discordAuthorAvatar: {
            '@id': 'schema-id:discordAuthorAvatar',
            '@type': 'http://schema.org/URL',
          },
          discordChannelId: {
            '@id': 'schema-id:discordChannelId',
            '@type': 'http://schema.org/Text',
          },
          discordChannelName: {
            '@id': 'schema-id:discordChannelName',
            '@type': 'http://schema.org/Text',
          },
          discordGuildId: {
            '@id': 'schema-id:discordGuildId',
            '@type': 'http://schema.org/Text',
          },
          discordGuildName: {
            '@id': 'schema-id:discordGuildName',
            '@type': 'http://schema.org/Text',
          },
          discordGuildAvatar: {
            '@id': 'schema-id:discordGuildAvatar',
            '@type': 'http://schema.org/URL',
          },
          '@version': 1.1,
        },
      })
  })

  // Clean up nock after tests
  afterAll(() => {
    nock.cleanAll()
  })
}
