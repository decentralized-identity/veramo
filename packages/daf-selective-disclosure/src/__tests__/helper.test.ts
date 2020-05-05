import { Identity, Presentation, Credential, Claim } from 'daf-core'
import { SelectiveDisclosureRequest } from '../action-handler'
import { validatePresentationAgainstSdr } from '../helper'

describe('daf-selective-disclosure-helper', () => {
  it('should validate presentation for sdr', () => {
    const sdr: SelectiveDisclosureRequest = {
      issuer: 'did:example:123',
      replyUrl: 'https://example.com/didcomm',
      tag: 'session-123',
      claims: [
        {
          reason: 'We are required by law to collect this information',
          claimType: 'firstName',
          essential: true,
        },
        {
          reason: 'You can get %30 discount if you are a member of the club',
          credentialContext: 'https://www.w3.org/2018/credentials/v1',
          credentialType: 'ClubMembership',
          claimType: 'status',
          claimValue: 'member',
          issuers: [
            {
              did: 'did:ethr:567',
              url: 'https://join-the-club.partner1.com',
            },
            {
              did: 'did:ethr:659',
              url: 'https://ecosystem.io',
            },
          ],
        },
      ],
      credentials: ['JWT-public-profile...'],
    }

    const identity = new Identity()
    identity.did = 'did:example:555'

    const claim1 = new Claim()
    claim1.issuer = identity
    claim1.subject = identity
    claim1.type = 'firstName'
    claim1.value = 'Alice'
    claim1.isObj = false

    const claim2 = new Claim()
    claim2.issuer = identity
    claim2.subject = identity
    claim2.type = 'lastName'
    claim2.value = 'Smith'
    claim2.isObj = false

    const credential1 = new Credential()
    credential1.issuer = identity
    credential1.subject = identity
    credential1.context = ['https://www.w3.org/2018/credentials/v1']
    credential1.type = ['VerifiableCredential']
    credential1.claims = [claim1, claim2]

    const identity1 = new Identity()
    identity1.did = 'did:ethr:659'

    const claim3 = new Claim()
    claim3.issuer = identity1
    claim3.subject = identity
    claim3.type = 'status'
    claim3.value = 'member'
    claim3.isObj = false

    const credential3 = new Credential()
    credential3.issuer = identity1
    credential3.subject = identity
    credential3.context = ['https://www.w3.org/2018/credentials/v1']
    credential3.type = ['VerifiableCredential', 'ClubMembership']
    credential3.claims = [claim3]

    const presentation = new Presentation()
    presentation.issuer = identity
    presentation.audience = [identity]
    presentation.context = ['https://www.w3.org/2018/credentials/v1']
    presentation.type = ['VerifiablePresentation']
    presentation.credentials = [credential1, credential3]

    const result = validatePresentationAgainstSdr(presentation, sdr)

    expect(result.claims[0].credentials[0].claims[0].type).toEqual('firstName')
    expect(result.valid).toEqual(true)
  })

  it('should invalidate presentation for sdr', () => {
    const sdr: SelectiveDisclosureRequest = {
      issuer: 'did:example:123',
      claims: [
        {
          reason: 'We are required by law to collect this information',
          claimType: 'firstName',
          essential: true,
        },
      ],
    }

    const identity = new Identity()
    identity.did = 'did:example:555'

    const claim2 = new Claim()
    claim2.issuer = identity
    claim2.subject = identity
    claim2.type = 'lastName'
    claim2.value = 'Smith'
    claim2.isObj = false

    const credential1 = new Credential()
    credential1.issuer = identity
    credential1.subject = identity
    credential1.context = ['https://www.w3.org/2018/credentials/v1']
    credential1.type = ['VerifiableCredential']
    credential1.claims = [claim2]

    const presentation = new Presentation()
    presentation.issuer = identity
    presentation.audience = [identity]
    presentation.context = ['https://www.w3.org/2018/credentials/v1']
    presentation.type = ['VerifiablePresentation']
    presentation.credentials = [credential1]

    const result = validatePresentationAgainstSdr(presentation, sdr)

    expect(result.valid).toEqual(false)
  })
})
