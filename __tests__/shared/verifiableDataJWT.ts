// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent,
  TKeyType,
  VerifiableCredential,
  VerifiablePresentation,
} from '../../packages/core-types/src'
import { decodeJWT } from 'did-jwt'
import { VC_JWT_ERROR } from 'did-jwt-vc'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialPlugin & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in JWT', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      identifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:key' })
    })
    afterAll(testContext.tearDown)

    it('should create verifiable credential in JWT', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiableCredential', 'Custom'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof hash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should create verifiable credential (simple)', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Example'],
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential).toHaveProperty('issuanceDate')
      expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Example'])

      const token = verifiableCredential.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.vc.credentialSubject.id).not.toBeDefined()
    })

    it('should create verifiable credential (simple) using did:jwk identifier', async () => {
      const ident = await agent.didManagerCreate({
        kms: 'local',
        provider: 'did:jwk',
      })
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: ident.did },
          type: ['Example'],
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })
      const verifyResult = await agent.verifyCredential({credential: verifiableCredential})

      expect(verifyResult.verified).toBe(true)
      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential).toHaveProperty('issuanceDate')
      expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Example'])

      const token = verifiableCredential.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.vc.credentialSubject.id).not.toBeDefined()
    })

    it('should create verifiable credential keeping original fields', async () => {
      expect.assertions(5)
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Example'],
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
        removeOriginalFields: false,
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential).toHaveProperty('issuanceDate')
      expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Example'])

      const token = verifiableCredential.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.vc.credentialSubject.id).toEqual('did:web:example.com')
    })

    it('should create verifiable presentation', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiablePresentation', 'Custom'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(verifiablePresentation2)
    })

    it('should create verifiable presentation (simple)', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Example'],
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          type: ['Example'],
          verifier: [],
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Example'])

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(verifiablePresentation2)

      const token = verifiablePresentation.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.holder).not.toBeDefined()
    })

    it('should create verifiable presentation (simple) keeping original fields', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Example'],
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          type: ['Example'],
          verifier: [],
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
        removeOriginalFields: false,
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Example'])

      const token = verifiablePresentation.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.holder).toEqual(identifier.did)
    })

    it('should query for credentials', async () => {
      const allCredentials = await agent.dataStoreORMGetVerifiableCredentials({})
      expect(allCredentials[0]).toHaveProperty('hash')
      expect(allCredentials[0]).toHaveProperty('verifiableCredential')
      const credentialCount = await agent.dataStoreORMGetVerifiableCredentialsCount()
      expect(allCredentials.length).toEqual(credentialCount)
    })

    it('should query for presentations', async () => {
      const allPresentations = await agent.dataStoreORMGetVerifiablePresentations({})
      expect(allPresentations[0]).toHaveProperty('hash')
      expect(allPresentations[0]).toHaveProperty('verifiablePresentation')
      const presentationCount = await agent.dataStoreORMGetVerifiablePresentationsCount()
      expect(allPresentations.length).toEqual(presentationCount)
    })

    it('should throw error for non existing verifiable credential', async () => {
      await expect(
        agent.dataStoreGetVerifiableCredential({
          hash: 'foobar',
        }),
      ).rejects.toThrow('Verifiable credential not found')
    })

    it('should throw error for non existing verifiable presentation', async () => {
      await expect(
        agent.dataStoreGetVerifiablePresentation({
          hash: 'foobar',
        }),
      ).rejects.toThrow('Verifiable presentation not found')
    })

    describe('using testvectors', () => {
      const importedDID = {
        did: 'did:ethr:goerli:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
        provider: 'did:ethr:goerli',
        controllerKeyId:
          '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
        keys: [
          {
            kid: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
            kms: 'local',
            type: <TKeyType>'Secp256k1',
            publicKeyHex:
              '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
            privateKeyHex: '31d1ec15ff8110442012fef0d1af918c0e09b2e2ab821bba52ecc85f8655ec63',
          },
        ],
        services: [],
      }

      beforeAll(async () => {
        await agent.didManagerImport(importedDID)
      })

      it('signs JWT with ES256K', async () => {
        const credentialInput = {
          credentialSubject: { id: 'did:example:subject', name: 'Alice' },
          issuer: { id: importedDID.did },
          type: ['Example'],
        }
        const { proof, issuanceDate, ...comparableOutput } = await agent.createVerifiableCredential({
          credential: credentialInput,
          proofFormat: 'jwt',
          save: false,
          removeOriginalFields: true,
        })
        expect(comparableOutput).toEqual({
          credentialSubject: { name: 'Alice', id: 'did:example:subject' },
          issuer: {
            id: 'did:ethr:goerli:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
          },
          type: ['VerifiableCredential', 'Example'],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
        })
      })
    })

    describe('credential verification policies', () => {
      let credential: VerifiableCredential

      beforeAll(async () => {
        const issuanceDate = '2019-08-19T09:15:20.000Z' // 1566206120
        const expirationDate = '2019-08-20T10:42:31.000Z' // 1566297751
        credential = await agent.createVerifiableCredential({
          proofFormat: 'jwt',
          credential: {
            issuer: identifier.did,
            issuanceDate,
            expirationDate,
            credentialSubject: {
              hello: 'world',
            },
          },
        })
      })

      it('can verify credential at a particular time', async () => {
        const result = await agent.verifyCredential({ credential })
        expect(result.verified).toBe(false)
        expect(result?.error?.errorCode).toEqual(VC_JWT_ERROR.INVALID_JWT)

        const result2 = await agent.verifyCredential({
          credential,
          policies: { now: 1566297000 },
        })
        expect(result2.verified).toBe(true)
      })

      it('can override expiry check', async () => {
        const result = await agent.verifyCredential({
          credential,
          policies: { expirationDate: false },
        })
        expect(result.verified).toBe(true)
      })

      it('can override issuance check', async () => {
        const result = await agent.verifyCredential({
          credential,
          policies: { issuanceDate: false, now: 1565000000 },
        })
        expect(result.verified).toBe(true)
      })

      it('can override audience check', async () => {
        const cred = await agent.createVerifiableCredential({
          proofFormat: 'jwt',
          credential: {
            issuer: identifier.did,
            aud: 'override me',
            credentialSubject: {
              hello: 'world',
            },
          },
        })
        const result = await agent.verifyCredential({ credential: cred })
        expect(result.verified).toBe(false)
        expect(result.error?.errorCode).toEqual(VC_JWT_ERROR.INVALID_AUDIENCE)

        const result2 = await agent.verifyCredential({ credential: cred, policies: { audience: false } })
        expect(result2.verified).toBe(true)
      })

      it('can override credentialStatus check', async () => {
        const cred = await agent.createVerifiableCredential({
          proofFormat: 'jwt',
          credential: {
            issuer: identifier.did,
            credentialSubject: {
              hello: 'world',
            },
            credentialStatus: {
              id: 'override me',
              type: 'ThisMethodDoesNotExist2022',
            },
          },
        })
        await expect(agent.verifyCredential({ credential: cred })).rejects.toThrow(/^invalid_setup:/)

        const result2 = await agent.verifyCredential({
          credential: cred,
          policies: { credentialStatus: false },
        })
        expect(result2.verified).toBe(true)
      })
    })

    describe('presentation verification policies', () => {
      let credential: VerifiableCredential
      let presentation: VerifiablePresentation

      beforeAll(async () => {
        const issuanceDate = '2019-08-19T09:15:20.000Z' // 1566206120
        const expirationDate = '2019-08-20T10:42:31.000Z' // 1566297751
        credential = await agent.createVerifiableCredential({
          proofFormat: 'jwt',
          credential: {
            issuer: identifier.did,
            credentialSubject: {
              hello: 'world',
            },
          },
        })
        presentation = await agent.createVerifiablePresentation({
          proofFormat: 'jwt',
          presentation: {
            holder: identifier.did,
            verifiableCredential: [credential],
            issuanceDate,
            expirationDate,
          },
        })
      })

      it('can verify presentation at a particular time', async () => {
        const result = await agent.verifyPresentation({ presentation })
        expect(result.verified).toBe(false)
        expect(result?.error?.errorCode).toEqual(VC_JWT_ERROR.INVALID_JWT)

        const result2 = await agent.verifyPresentation({
          presentation,
          policies: { now: 1566297000 },
        })
        expect(result2.verified).toBe(true)
      })

      it('can override expiry check', async () => {
        const result = await agent.verifyPresentation({
          presentation,
          policies: { expirationDate: false },
        })
        expect(result.verified).toBe(true)
      })

      it('can override issuance check', async () => {
        const result = await agent.verifyPresentation({
          presentation,
          policies: { issuanceDate: false, now: 1565000000 },
        })
        expect(result.verified).toBe(true)
      })

      it('can override audience check', async () => {
        const pres = await agent.createVerifiablePresentation({
          proofFormat: 'jwt',
          presentation: {
            holder: identifier.did,
            verifiableCredential: [credential],
          },
          challenge: '1234',
          domain: 'example.com',
        })
        const result = await agent.verifyPresentation({ presentation: pres })
        expect(result.verified).toBe(false)
        expect(result.error?.errorCode).toEqual(VC_JWT_ERROR.INVALID_AUDIENCE)

        const result2 = await agent.verifyPresentation({
          presentation: pres,
          policies: { audience: false },
        })
        expect(result2.verified).toBe(true)
      })
    })
  })
}
