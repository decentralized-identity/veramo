import { CredentialStatus } from 'credential-status'
import {
  CredentialPayload,
  IAgentOptions,
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IDataManager,
  TAgent,
  IIdentifier,
  VerifiableCredential,
} from '../../packages/core/src'
import { CredentialStatusPlugin } from '../../packages/credential-status/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialPlugin & IDataManager>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  let agent: ConfiguredAgent
  let identifier: IIdentifier
  let verifiableCredential: VerifiableCredential
  let verifiableCredential2: VerifiableCredential
  let id: string

  describe('DataManager', () => {
    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    // beforeEach(async () => {
    //   //await agent.clear({ options: { store: 'local' } })
    // })
    afterAll(testContext.tearDown)
    describe('DataManager functions', () => {
      it('should save a VC-like object', async () => {
        const credential = {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          id: 'http://example.gov/credentials/3732',
          type: ['VerifiableCredential'],
          issuer: 'did:example:123',
        }
        const saveRes = await agent.save({ data: credential, options: { store: 'local' } })
        id = saveRes[0].id
        const res = await agent.query({ options: { store: 'local' } })
        expect(res).toHaveLength(1)
        expect(res[0].data).toEqual(credential)
        expect(res[0].metadata.store).toEqual('local')
        expect.assertions(3)
      })
      it('should delete object from agent', async () => {
        const res = await agent.delete({ id })
        const data = await agent.query()
        expect(res).toEqual([true])
        expect(data).toHaveLength(0)
        expect.assertions(2)
      })

      it('should save a VC generated with Agent', async () => {
        identifier = await agent.didManagerCreate({ kms: 'local', provider: 'did:key' })

        verifiableCredential = await agent.createVerifiableCredential({
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
        const saveRes = await agent.save({ data: verifiableCredential, options: { store: 'local' } })
        id = saveRes[0].id
        const res = await agent.query()
        expect(res).toHaveLength(1)
        expect(res[0].data).toEqual(verifiableCredential)
        expect(res[0].metadata.store).toEqual('local')
        expect.assertions(3)
      })
      it('should query VC with id', async () => {
        const res = await agent.query({
          filter: {
            type: 'id',
            filter: id,
          },
        })
        expect(res).toHaveLength(1)
        expect(res[0].data).toEqual(verifiableCredential)
        expect.assertions(2)
      })
      it('should query VC with JSONPath', async () => {
        const res = await agent.query({
          filter: {
            type: 'jsonpath',
            filter: `$[?(@.data.credentialSubject.id == "did:web:example.com")]`,
          },
        })
        expect(res).toHaveLength(1)
        expect(res[0].data).toEqual(verifiableCredential)
        expect.assertions(2)
      })
      it('should query multiple VCs with JSONPath', async () => {
        verifiableCredential2 = await agent.createVerifiableCredential({
          credential: {
            issuer: { id: identifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
            type: ['VerifiableCredential', 'Custom'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: 'did:web:example.com',
              you: 'Scissors',
            },
          },
          proofFormat: 'jwt',
        })
        await agent.save({ data: verifiableCredential2, options: { store: 'local' } })

        const res = await agent.query({
          filter: {
            type: 'jsonpath',
            filter: `$[?(@.data.credentialSubject.id == "did:web:example.com")]`,
          },
        })
        console.log(res)
        expect(res).toHaveLength(2)
        expect(res[0].data).toEqual(verifiableCredential)
        expect(res[1].data).toEqual(verifiableCredential2)
        expect.assertions(3)
      })
    })
  })
}
