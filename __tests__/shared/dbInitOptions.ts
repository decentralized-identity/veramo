// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  ICredentialIssuer,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../packages/core/src'
import { IDIDComm, IPackedDIDCommMessage } from '../../packages/did-comm/src'
import { extractIssuer } from '../../packages/utils/src'

type ConfiguredAgent = TAgent<
  IDataStoreORM &
    IDataStore &
    IDIDManager &
    IKeyManager &
    ICredentialIssuer &
    IDIDComm &
    IMessageHandler &
    IResolver
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (agentOptions: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('when database is initialized', () => {
    describe('using sqlite and synchronize=true', () => {
      createTestsUsingOptions({
        context: {
          databaseFile: 'sqlite-sync-init-test.sqlite',
          dbConnectionOptions: {
            name: 'sqlite-sync-init-test',
            type: 'sqlite',
            synchronize: true,
            migrationsRun: false,
          },
        },
      })
    })
    describe('using sqlite and migrations', () => {
      createTestsUsingOptions({
        context: {
          databaseFile: 'sqlite-migration-init-test.sqlite',
          dbConnectionOptions: {
            name: 'sqlite-migration-init-test',
            type: 'sqlite',
            synchronize: false,
            migrationsRun: true,
          },
        },
      })
    })

    if (process.env.INCLUDE_POSTGRES_TESTS === 'true') {
      // //docker run -p 5432:5432 -it --rm -e POSTGRES_PASSWORD=test123 postgres
      describe('using postgres and migrations', () => {
        createTestsUsingOptions({
          context: {
            dbConnectionOptions: {
              name: 'postgres-migration-init-test',
              type: 'postgres',
              database: undefined,
              synchronize: false,
              migrationsRun: true,
              host: process.env.POSTGRES_HOST || 'localhost',
              port: process.env.POSTGRES_PORT || 5432,
              password: process.env.POSTGRES_PASSWORD || 'test123',
              username: process.env.POSTGRES_USER || 'postgres',
            },
          },
        })
      })

      describe('using postgres and sync', () => {
        createTestsUsingOptions({
          context: {
            dbConnectionOptions: {
              name: 'postgres-sync-init-test',
              type: 'postgres',
              database: undefined,
              synchronize: true,
              migrationsRun: false,
              host: process.env.POSTGRES_HOST || 'localhost',
              port: process.env.POSTGRES_PORT || 5432,
              password: process.env.POSTGRES_PASSWORD || 'test123',
              username: process.env.POSTGRES_USER || 'postgres',
            },
          },
        })
      })
    }

    function createTestsUsingOptions(options: IAgentOptions) {
      describe('agent', () => {
        let agent: ConfiguredAgent
        beforeAll(async () => {
          await testContext.setup(options)
          agent = testContext.getAgent()
          return true
        })
        afterAll(testContext.tearDown)

        let identifier: IIdentifier
        it('should create DID', async () => {
          identifier = await agent.didManagerGetOrCreate({ provider: 'did:fake', alias: 'migrationDID' })
          expect(identifier.did).toMatch(/did:fake:.*/)
        })
        it('should create and add key', async () => {
          const key: IKey = await agent.keyManagerCreate({
            type: 'Ed25519',
            kms: 'local',
          })

          await agent.didManagerAddKey({
            did: identifier.did,
            key: key,
          })

          identifier = await agent.didManagerGet({ did: identifier.did })
          expect(identifier.keys.length).toBeGreaterThanOrEqual(2)
        })

        it('should add service', async () => {
          await agent.didManagerAddService({
            did: identifier.did,
            service: {
              id: 'fake-service',
              type: 'DIDCommMessaging',
              serviceEndpoint: 'http://localhost:6123',
            },
          })
          identifier = await agent.didManagerGet({ did: identifier.did })
          expect(identifier.services.length).toBe(1)
        })

        let credentialRaw: string
        it('should sign and save credential', async () => {
          const credential = await agent.createVerifiableCredential({
            proofFormat: 'jwt',
            credential: {
              credentialSubject: { id: identifier.did, pseudonym: 'FakeAlice' },
              type: ['Example'],
              issuer: identifier.did,
            },
          })
          const credentialId = await agent.dataStoreSaveVerifiableCredential({
            verifiableCredential: credential,
          })
          const retrieved = await agent.dataStoreGetVerifiableCredential({
            hash: credentialId,
          })
          credentialRaw = retrieved.proof.jwt
          expect(extractIssuer(retrieved)).toEqual(identifier.did)
        })

        let packedMessage: IPackedDIDCommMessage
        it('should pack anon message', async () => {
          packedMessage = await agent.packDIDCommMessage({
            packing: 'authcrypt',
            message: {
              to: identifier.did,
              from: identifier.did,
              id: 'test-message-123',
              type: 'w3c.vc',
              body: credentialRaw,
            },
          })
          expect(packedMessage.message.length).toBeGreaterThan(0)
        })

        it('should unpack anon message', async () => {
          const msg = await agent.handleMessage({ raw: packedMessage.message })
          expect(msg.type).toBe('w3c.vc')
        })

        it('should get credentials from message by claim', async () => {
          const incomingCredential = await agent.createVerifiableCredential({
            proofFormat: 'jwt',
            credential: {
              type: ['Example'],
              credentialSubject: {
                incoming: 'yes',
              },
              issuer: identifier.did,
            },
            save: false,
          })
          const message = await agent.handleMessage({ raw: incomingCredential.proof.jwt, save: false })
          const msgId = await agent.dataStoreSaveMessage({ message })
          const retrievedCredential = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
            where: [{ column: 'type', value: ['incoming'] }],
          })
          expect(retrievedCredential.length).toBeGreaterThan(0)
        })
      })
    }
  })
}
