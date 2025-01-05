
import { TAgent, CredentialPayload, ICredentialIssuer, IIdentifier, VerifiableCredential, VerifiablePresentation } from '../../../core-types/src'
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager, ICredentialPlugin } from '../../../core/src'
import { DIDManager } from '../../../did-manager/src'
import { SecretBox, KeyManagementSystem } from '../../../kms-local/src'
import { CredentialPlugin } from '../../../credential-w3c/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Entities, KeyStore, DIDStore, IDataStoreORM, PrivateKeyStore, migrations, DataStoreORM } from '../../../data-store'
import { EthrDIDProvider } from '../../../did-provider-ethr/src'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { DataSource, DataSourceOptions } from 'typeorm'
import * as path from 'path';
import { CustomKeyManager } from '../custom-key-manager.js'
import { VeramoBbsBlsSignature } from '../suites/BbsBlsSignature.js'
import { CredentialProviderBBS } from '../CredentialProviderBBS.js'
import { BbsSelectiveDisclosureCredentialPlugin } from '../bbs-selective-diclosure-plugin.js'
import { BbsDefaultContexts } from '../bbs-default-contexts.js'
import { ContextDoc } from '../types.js'
import citizenVocab from "../custom_contexts/citizenVocab.json"


import { jest } from '@jest/globals'
jest.setTimeout(30000)


// This will be the secret key for the KMS
const KMS_SECRET_KEY = '11b574d316903ced6cc3f4787bbcc3047d9c72d1da4d83e36fe714ef785d10c1'
jest.setTimeout(600000)

const database_test = path.normalize(path.resolve() + '/__tests__/fixtures/bbs_database_test.sqlite.tmp')

const customContext: Record<string, ContextDoc> = {
  "https://w3id.org/citizenship/v1": citizenVocab,
}
let bbsContextMaps = [BbsDefaultContexts, customContext]
let bbsSuites = [new VeramoBbsBlsSignature()]
const bbs = new CredentialProviderBBS({
  contextMaps: bbsContextMaps,
  suites: bbsSuites
})

const challenge = 'test_challenge'
const domain = 'test_domain'

let agent: any
let issuer: any
let holder: any

let dbConnection: any
describe('Local integration tests', () => {

  beforeAll(async () => {
    dbConnection = new DataSource({
      type: 'sqlite',
      database: database_test,
      synchronize: false,
      migrations,
      migrationsRun: true,
      logging: ['error', 'info', 'warn'],
      entities: [...Entities]
    }).initialize()



    agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &
      ICredentialPlugin>({
        plugins: [
          new CustomKeyManager({
            store: new KeyStore(dbConnection),
            kms: {
              local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
            },
          }),
          new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:ethr:sepolia',
            providers: {
              'did:ethr:sepolia': new EthrDIDProvider({
                defaultKms: 'local',
                network: 'sepolia',
                rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/fTk2Z4HtEe0uc2Lt73cIww13r4_REbj8',

                name: 'sepolia',
                registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
                gas: 100000,
                ttl: 60 * 60 * 24 * 30 * 12 + 1,
              })
            },
          }),
          new DIDResolverPlugin({
            resolver: new Resolver({
              ...ethrDidResolver(
                {
                  networks: [
                    {
                      name: 'sepolia',
                      chainId: 11155111,
                      rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/fTk2Z4HtEe0uc2Lt73cIww13r4_REbj8',
                      registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
                    }
                  ]
                })
            }),
          }),
          new CredentialPlugin({ issuers: [bbs] }),
          new BbsSelectiveDisclosureCredentialPlugin({ contextMaps: bbsContextMaps, suites: bbsSuites }),
          new DataStoreORM(dbConnection),

        ],
      })
    issuer = await agent.didManagerGetByAlias({ alias: 'sepolia_1' })
    holder = await agent.didManagerGetByAlias({ alias: 'sepolia_3' })
    //holder = await agent.didManagerGetByAlias({ alias: 'sepolia_1' })

  })



  it('credencial bbs', async () => {
    let proofFormatVC = 'bbs';
    const verifiableCredential = await createCredentialGeneric(issuer, agent, proofFormatVC)
    const vcVerified = await agent.verifyCredential({ credential: verifiableCredential })
    expect(vcVerified.verified).toEqual(true)
  })

  it('credencial bbs - presentacion bbs', async () => {
    let proofFormatVC = 'bbs';
    let proofFormatVP = 'bbs';
    //The keyRef is set because the did document has more than one bbs key
    const verifiableCredential = await createCredentialGeneric(issuer, agent, proofFormatVC, 'b84ba7dac90ecdfc18cce60e37fe9f0f74ed9102150005691f285be4e61b40bd56b5d37d213363caba82f9ecdcc432931715cb5ef0914123d1cd6844460638ab25bccaf41cb34b7448926772ed2bbab5517c9119aceaf14404a78cd59451bd7d')
    const vcVerified = await agent.verifyCredential({ credential: verifiableCredential })
    expect(vcVerified.verified).toEqual(true)

    const verifiablePresentation = await createPresentationGeneric(holder, agent, verifiableCredential, proofFormatVP, challenge, domain)
    //const verifiablePresentation = await createPresentationGeneric(holder, agent, verifiableCredential, proofFormatVP, challenge, domain, 'b84ba7dac90ecdfc18cce60e37fe9f0f74ed9102150005691f285be4e61b40bd56b5d37d213363caba82f9ecdcc432931715cb5ef0914123d1cd6844460638ab25bccaf41cb34b7448926772ed2bbab5517c9119aceaf14404a78cd59451bd7d')    
    const vpVerified = await agent.verifyPresentation({
      presentation: verifiablePresentation,
      challenge,
      domain,
    })
    expect(vpVerified.verified).toEqual(true)
  })

  it('create selective disclosure credential bbs', async () => {
    let proofFormatVC = 'bbs';
    let proofFormatVP = 'bbs';
    const verifiableCredential = await createCredentialGeneric(issuer, agent, proofFormatVC)
    const vcVerified = await agent.verifyCredential({ credential: verifiableCredential })
    expect(vcVerified.verified).toEqual(true)

    const verifiablePresentation = await createPresentationGeneric(holder, agent, verifiableCredential, proofFormatVP, challenge, domain)
    const vpVerified = await agent.verifyPresentation({
      presentation: verifiablePresentation,
      challenge,
      domain,
    })
    expect(vpVerified.verified).toEqual(true)

    let selectiveDisclosureCredential = await createSelectiveDisclosureCredential(verifiableCredential)
    const selectiveDisclosureCredentialVerified = await agent.verifyDerivedProofBbs({ credential: selectiveDisclosureCredential })
    expect(selectiveDisclosureCredentialVerified.verified).toEqual(true)
  })

})

async function createCredentialGeneric(issuer: IIdentifier, agent: TAgent<ICredentialIssuer>, proofFormat: any, keyRef?: string): Promise<VerifiableCredential> {
  //KeyRef should only be set if the did document has more than one bbs key
  const credential: CredentialPayload = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/citizenship/v1",
      "https://w3id.org/security/bbs/v1"
    ],
    "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
    "type": ["VerifiableCredential", "PermanentResidentCard"],
    "issuer": issuer.did,
    "identifier": "83627465",
    "name": "Permanent Resident Card",
    "description": "Government of Example Permanent Resident Card.",
    "issuanceDate": "2019-12-03T12:19:52Z",
    "expirationDate": "2029-12-03T12:19:52Z",
    "credentialSubject": {
      "id": "did:example:b34ca6cd37bbf23",
      "type": ["PermanentResident", "Person"],
      "givenName": "JOHN",
      "familyName": "SMITH",
      "gender": "Male",
      "image": "data:image/png;base64,iVBORw0KGgokJggg==",
      "residentSince": "2015-01-01",
      "lprCategory": "C09",
      "lprNumber": "999-999-999",
      "commuterClassification": "C1",
      "birthCountry": "Bahamas",
      "birthDate": "1958-07-17"
    }
  }
  const verifiableCredential = await agent.createVerifiableCredential({
    credential,
    proofFormat: proofFormat,
    //keyRef: (proofFormat != 'bbs') ? undefined : 'b84ba7dac90ecdfc18cce60e37fe9f0f74ed9102150005691f285be4e61b40bd56b5d37d213363caba82f9ecdcc432931715cb5ef0914123d1cd6844460638ab25bccaf41cb34b7448926772ed2bbab5517c9119aceaf14404a78cd59451bd7d'
    keyRef: keyRef
    //The keyRef is set because the did document has more than one bbs key
  })
  return verifiableCredential
}

async function createPresentationGeneric(holder: IIdentifier, agent: TAgent<ICredentialIssuer>, verifiableCredential: VerifiableCredential, proofFormat: any, challenge: any, domain: any, keyRef?: string):
  Promise<VerifiablePresentation> {
  //KeyRef should only be set if the did document has more than one bbs key

  return await agent.createVerifiablePresentation({
    presentation: {
      holder: holder.did,
      type: ['Example'],
      verifier: [],
      verifiableCredential: [verifiableCredential],
    },
    proofFormat: proofFormat,
    //keyRef: (proofFormat != 'bbs') ? undefined : 'b84ba7dac90ecdfc18cce60e37fe9f0f74ed9102150005691f285be4e61b40bd56b5d37d213363caba82f9ecdcc432931715cb5ef0914123d1cd6844460638ab25bccaf41cb34b7448926772ed2bbab5517c9119aceaf14404a78cd59451bd7d',
    keyRef: keyRef,
    challenge: challenge,
    domain: domain
  })
}

async function createSelectiveDisclosureCredential(verifiableCredential: VerifiableCredential): Promise<VerifiableCredential> {

  let revealDocument = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/citizenship/v1",
      "https://w3id.org/security/bbs/v1"
    ],
    "type": ["VerifiableCredential", "PermanentResidentCard"],
    "credentialSubject": {
      "@explicit": true,
      "type": ["PermanentResident", "Person"],
      "givenName": {},
      "familyName": {},
      "gender": {}
    }
  }

  let selectiveDisclosureCredential = await agent.createSelectiveDisclosureCredentialBbs({ proofDocument: verifiableCredential, revealDocument })
  return selectiveDisclosureCredential;
}
