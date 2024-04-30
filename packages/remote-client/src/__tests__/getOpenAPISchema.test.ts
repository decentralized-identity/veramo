import { DIDComm } from '../../../did-comm/src'
import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { AliasDiscoveryProvider, DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { type DIDDocument, Resolver } from 'did-resolver'
import { type IDIDComm } from '../../../did-comm/src/types/IDIDComm.js'
import { getOpenApiSchema } from '../openApi.js'
import { KeyValueStore } from '../../../kv-store/src/key-value-store.js'
import { MediationManagerPlugin, MediationResponse, PreMediationRequestPolicy, RequesterDid } from '../../../mediation-manager/src/index.js'
import { DataSource } from 'typeorm'
import { DataStore, DataStoreDiscoveryProvider, DataStoreORM, Entities, migrations } from '../../../data-store/src/index.js'
import { CredentialPlugin } from '../../../credential-w3c/src/action-handler.js'
import { CredentialIssuerEIP712 } from '../../../credential-eip712/src/index.js'
import { CredentialIssuerLD } from '../../../credential-ld/src/action-handler.js'
import { LdDefaultContexts } from '../../../credential-ld/src/ld-default-contexts.js'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import { VeramoEcdsaSecp256k1RecoverySignature2020, VeramoEd25519Signature2018, VeramoEd25519Signature2020, VeramoJsonWebSignature2020 } from '../../../credential-ld/src/index.js'
import { SelectiveDisclosure } from '../../../selective-disclosure/src/action-handler.js'
import { DIDDiscovery } from '../../../did-discovery/src/action-handler.js'

let dbConnection: DataSource

describe('didComm', () => {
    let memoryJsonStore = { notifyUpdate: () => Promise.resolve() }
    dbConnection = new DataSource({
        name: 'test',
        type: 'sqlite',
        database: ':memory:',
        synchronize: false,
        migrations: migrations,
        migrationsRun: true,
        logging: false,
        entities: Entities,
      })
    let policyStore = new KeyValueStore<PreMediationRequestPolicy>({
      namespace: 'mediation_policy',
      store: new Map<string, PreMediationRequestPolicy>(),
    })
  
    let mediationStore = new KeyValueStore<MediationResponse>({
      namespace: 'mediation_response',
      store: new Map<string, MediationResponse>(),
    })
  
    let recipientDidStore = new KeyValueStore<RequesterDid>({
      namespace: 'recipient_did',
      store: new Map<string, RequesterDid>(),
    })

  let senderDID: IIdentifier
  let recipientDID: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>

  beforeAll(async () => {
    agent = createAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidKeyResolver(),
          }),
        }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        new DIDComm(),
        // @ts-ignore
        new MediationManagerPlugin(true, policyStore, mediationStore, recipientDidStore),
        new CredentialPlugin(),
        new CredentialIssuerEIP712(),
        new CredentialIssuerLD({
          contextMaps: [LdDefaultContexts, credential_contexts as any],
          suites: [
            new VeramoEcdsaSecp256k1RecoverySignature2020(),
            new VeramoEd25519Signature2018(),
            new VeramoJsonWebSignature2020(),
            new VeramoEd25519Signature2020(),
          ],
        }),
        new SelectiveDisclosure(),
        new DIDDiscovery({
          providers: [
            new AliasDiscoveryProvider(),
            new DataStoreDiscoveryProvider(),
          ],
        }),
    ],
    })
  })



  describe('getOpenAPISchema', () => {
    it('should getOpenAPISchema', async () => {
      const schema = getOpenApiSchema(agent, '/agent', agent.availableMethods())
      console.log("schema 1: ", schema)
      expect(schema).toBeDefined()
    })

    it('should getOpenAPISchema', async () => {
        
        let exposedMethods = agent.availableMethods()
        exposedMethods = exposedMethods.filter(e => {
        return e !== 'sendMessageDIDCommAlpha1' && 
            e !== 'matchKeyForLDSuite' && 
            e !== 'matchKeyForEIP712' && 
            e !== 'matchKeyForJWT' &&
            e !== 'isMediateDefaultGrantAll' &&
            e !== 'mediationManagerSaveMediationPolicy' &&
            e !== 'mediationManagerRemoveMediationPolicy' &&
            e !== 'mediationManagerGetMediationPolicy' &&
            e !== 'mediationManagerListMediationPolicies' &&
            e !== 'mediationManagerSaveMediation' &&
            e !== 'mediationManagerGetMediation' && 
            e !== 'mediationManagerRemoveMediation' && 
            e !== 'mediationManagerGetAllMediations' &&
            e !== 'mediationManagerAddRecipientDid' &&
            e !== 'mediationManagerRemoveRecipientDid' &&
            e !== 'mediationManagerGetRecipientDid' &&
            e !== 'mediationManagerListRecipientDids' &&
            e !== 'mediationManagerIsMediationGranted' &&
            e !== 'createSelectiveDisclosureRequest' &&
            e !== 'getVerifiableCredentialsForSdr' &&
            e !== 'validatePresentationAgainstSdr' &&
            e !== 'createProfilePresentation' &&
            e !== 'discoverDid'
        })
        const schema = getOpenApiSchema(agent, '/agent', exposedMethods)
        console.log("schema 2: ", schema)
        expect(schema).toBeDefined()
      })
  })
})
