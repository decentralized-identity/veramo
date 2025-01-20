// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent,
  VerifiableCredential,
  VerifiablePresentation,
  CredentialPayload,
  ICredentialIssuer,
  IResolver,
  IKeyManager
} from '../../packages/core-types/src'

type ConfiguredAgent = TAgent<
  IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  ICredentialPlugin
>

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

async function createSelectiveDisclosureCredential(verifiableCredential: VerifiableCredential, agent: TAgent<ICredentialIssuer>): Promise<VerifiableCredential> {

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

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in BBS', () => {
    let agent: ConfiguredAgent
    let issuer: any
    let holder: any
    const challenge = 'test_challenge'
    const domain = 'test_domain'

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      issuer = await agent.didManagerGetByAlias({ alias: 'sepolia_1' })
      holder = await agent.didManagerGetByAlias({ alias: 'sepolia_3' })
    })
    //afterAll(testContext.tearDown)

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

      let selectiveDisclosureCredential = await createSelectiveDisclosureCredential(verifiableCredential, agent)
      const selectiveDisclosureCredentialVerified = await agent.verifyDerivedProofBbs({ credential: selectiveDisclosureCredential })
      expect(selectiveDisclosureCredentialVerified.verified).toEqual(true)
    })


  })


}
