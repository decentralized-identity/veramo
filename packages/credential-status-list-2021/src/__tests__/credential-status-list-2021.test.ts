import { createAgent, ICredentialStatus, ICredentialStatusManager, ICredentialStatusVerifier, IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent, VerifiableCredential } from '@veramo/core'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { Resolver } from 'did-resolver'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { KeyManagementSystem } from '@veramo/kms-local'
import { CredentialStatusList2021Plugin, CredentialStatusRequestArgs, StatusListStorage, StatusList2021CredentialSigned } from '../credential-status-list-2021'

const statusList2021CredentialSignedMatcher = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  id: expect.anything(),
  type: ["VerifiableCredential", "StatusList2021Credential"],
  issuer: expect.anything(),
  issuanceDate: expect.anything(),
  credentialSubject: {
    id: expect.anything(),
    type: "StatusList2021",
    statusPurpose: expect.anything(),
    encodedList: expect.anything()
  }
}

describe('@veramo/credential-status-list-2021', () => {
  const ids = new Map<string, string>()
  const memoryStorage: StatusListStorage = {
    set: async (id: string, value: string): Promise<void> => new Promise((resolve) => { ids.set(id, value); resolve() }),
    get: async (id: string): Promise<string | undefined> => new Promise((resolve) => { resolve(ids.get(id)) }),
    keys: () => Array.from(ids.keys())
  }

  let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialIssuer & ICredentialStatus>
  let didKeyIdentifier: IIdentifier
  let referenceCredential: VerifiableCredential

  beforeAll(async () => {
    agent = createAgent({
      plugins: [
        new CredentialStatusList2021Plugin(memoryStorage),
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: { local: new KeyManagementSystem(new MemoryPrivateKeyStore()) },
        }),
        new DIDManager({
          providers: { 'did:key': new KeyDIDProvider({ defaultKms: 'local' }) },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({ resolver: new Resolver({ ...getDidKeyResolver() }) }),
        new CredentialIssuer(),
      ],
    })

    didKeyIdentifier = await agent.didManagerCreate()

    referenceCredential = {
      '@context': [],
      issuanceDate: new Date().toISOString(),
      proof: {},
      issuer: didKeyIdentifier.did,
      credentialSubject: {}
    }
  })

  describe('Full succesfull credential revocation flow', () => {

    it('Should generate a `credentialStatus` field for a VC', async () => {
      expect.assertions(4)

      const statusUrl = "https://example.com"
      const args = {
        type: 'StatusList2021Entry',
        vc: referenceCredential,
        statusListCredentialUrl: statusUrl
      }

      const result = await agent.credentialStatusGenerate(args)
      expect(result).toStrictEqual({
        type: "StatusList2021Entry",
        id: expect.stringContaining(statusUrl),
        statusListCredential: statusUrl,
        statusPurpose: 'revocation',
        statusListIndex: 0
      });

      // For next test
      referenceCredential.credentialStatus = result

      // Should bring index incremented
      const result2 = await agent.credentialStatusGenerate(args)
      expect(result2.statusListIndex).toEqual(1);

      // Should bring index incremented
      const result3 = await agent.credentialStatusGenerate(args)
      expect(result3.statusListIndex).toEqual(2);

      // Should bring index passed as argument
      const result4 = await agent.credentialStatusGenerate({ ...args, statusListIndex: 7 })
      expect(result4.statusListIndex).toEqual(7);
    })

    it('Check if the VC is not revoked before any status update', async () => {
      expect.assertions(2)

      const result1 = await agent.credentialStatusRead(<CredentialStatusRequestArgs>{
        credential: referenceCredential
      })

      expect(result1).toMatchObject(statusList2021CredentialSignedMatcher)

      const result2 = await agent.checkCredentialStatus({
        credential: referenceCredential
      });

      expect(result2).toStrictEqual({
        verified: true
      })
    })

    it('Succesfully revoke the VC', async () => {
      expect.assertions(1)

      const result = await agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: { value: false }
      })

      expect(result).toBeUndefined()
    })

    it('Confirm VC revocation by verifying its status', async () => {
      expect.assertions(1)

      const result1 = await agent.credentialStatusRead({
        credentialStatus: referenceCredential.credentialStatus
      })

      expect(result1).toStrictEqual({
        verified: false
      })
    })
  })

  describe('Exception flows', () => {
    it('Should fail updating VC status using another status method', async () => {
      expect.assertions(1)

      const wrongMethod = "NotTheStatusList2021Entry"
      referenceCredential.credentialStatus = {
        type: wrongMethod,
        id: "any-id"
      }

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError(`invalid_argument: unrecognized method '${wrongMethod}'. Expected 'StatusList2021Entry'.`)
    })

    it('Should fail updating VC without `credentialStatus` entry', async () => {
      expect.assertions(1)

      delete referenceCredential.credentialStatus

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError("invalid_argument: `credentialStatus.id` must be defined in the credential")
    })

    it('Should fail if `credentialStatus` references an invalid ID', async () => {
      expect.assertions(2)

      const statusListCredentialUrl = "https://example.com/credentials/status/3"
      referenceCredential.credentialStatus = {
        id: `${statusListCredentialUrl}#94567`,
        type: "StatusList2021Entry",
        statusPurpose: "revocation",
        statusListIndex: "94567",
        statusListCredential: statusListCredentialUrl
      }

      expect(await memoryStorage.get(statusListCredentialUrl)).toBeUndefined()

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError(`invalid_state: the status list "${statusListCredentialUrl}" was not found`)
    })
  })
})

