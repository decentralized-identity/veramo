import { createConnection, Connection } from 'typeorm'
import { Identity, Key, Message, Credential, Presentation, Claim, MessageMetaData } from '../index'
import { Entities } from '../index'

describe('daf-core', () => {
  let connection: Connection

  beforeAll(
    async () =>
      (connection = await createConnection({
        type: 'sqlite',
        database: 'test-db.sqlite',
        entities: Entities,
      })),
  )

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.close()
  })

  it('Saves identity to DB', async () => {
    const identity = new Identity()
    identity.did = 'did:test:123'
    await identity.save()

    const fromDb = await Identity.findOne(identity.did)
    expect(fromDb.did).toEqual(identity.did)
  })

  it('Saves credential with claims', async () => {
    const id1 = new Identity()
    id1.did = 'did:test:111'

    const id2 = new Identity()
    id2.did = 'did:test:222'

    const vc = new Credential()
    vc.issuer = id1
    vc.subject = id2
    vc.issuanceDate = new Date()
    vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
    vc.type = ['VerifiableCredential', 'PublicProfile']
    vc.raw = 'mockJWT'
    vc.credentialSubject = {
      name: 'Alice',
      profilePicture: 'https://example.com/a.png',
      address: {
        street: 'Some str.',
        house: 1,
      },
    }

    await vc.save()

    const credential = await Credential.findOne(vc.hash, {
      relations: ['issuer', 'subject', 'claims', 'claims.issuer', 'claims.subject'],
    })
    expect(credential.issuer.did).toEqual(id1.did)
    expect(credential.subject.did).toEqual(id2.did)
    expect(credential.claims.length).toEqual(3)
    expect(credential.claims[0].issuer.did).toEqual(id1.did)
    expect(credential.claims[0].subject.did).toEqual(id2.did)
    // TODO
  })

  it('Saves message with credentials', async () => {
    const id1 = new Identity()
    id1.did = 'did:test:111'

    const id2 = new Identity()
    id2.did = 'did:test:222'

    const vc = new Credential()
    vc.issuer = id1
    vc.subject = id2
    vc.issuanceDate = new Date()
    vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
    vc.type = ['VerifiableCredential', 'PublicProfile']
    vc.raw = 'mockJWT'
    vc.credentialSubject = {
      name: 'Alice',
      profilePicture: 'https://example.com/a.png',
      address: {
        street: 'Some str.',
        house: 1,
      },
    }

    const m = new Message()
    m.from = id1
    m.to = id2
    m.type = 'mock'
    m.raw = 'mock'
    m.createdAt = new Date()
    m.credentials = [vc]

    await m.save()

    const message = await Message.findOne(m.id, {
      relations: ['credentials', 'credentials.issuer', 'credentials.subject'],
    })

    console.log(message)

    expect(message.credentials.length).toEqual(1)
    // TODO
  })
})
