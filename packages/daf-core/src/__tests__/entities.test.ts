import { createConnection, Connection, In, Raw } from 'typeorm'
import { Identity, Key, Message, Credential, Presentation, Claim } from '../index'
import { Entities } from '../index'
import { blake2bHex } from 'blakejs'
import fs from 'fs'

describe('daf-core', () => {
  let connection: Connection
  const databaseFile = './test-db.sqlite'

  beforeAll(
    async () =>
      (connection = await createConnection({
        type: 'sqlite',
        database: databaseFile,
        entities: Entities,
      })),
  )

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.close()
    fs.unlinkSync(databaseFile)
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

    const id3 = new Identity()
    id3.did = 'did:test:333'

    const vc = new Credential()
    vc.issuer = id1
    vc.subject = id2
    vc.issuanceDate = new Date()
    vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
    vc.type = ['VerifiableCredential']
    vc.raw = 'mockJWT'
    vc.credentialSubject = {
      name: 'Alice',
      profilePicture: 'https://example.com/a.png',
      address: {
        street: 'Some str.',
        house: 1,
      },
    }

    const vp = new Presentation()
    vp.issuer = id1
    vp.audience = [id2]
    vp.issuanceDate = new Date()
    vp.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
    vp.type = ['VerifiablePresentation', 'PublicProfile']
    vp.raw = 'mockJWT'
    vp.credentials = [vc]

    const vp2 = new Presentation()
    vp2.issuer = id1
    vp2.audience = [id3]
    vp2.issuanceDate = new Date()
    vp2.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
    vp2.type = ['VerifiablePresentation', 'PublicProfile', 'Specific']
    vp2.raw = 'mockJWT'
    vp2.credentials = [vc]

    await vp2.save()

    const m = new Message()
    m.from = id1
    m.to = id2
    m.type = 'mock'
    m.raw = 'mock'
    m.createdAt = new Date()
    m.credentials = [vc]
    m.presentations = [vp]

    await m.save()

    const message = await Message.findOne(m.id, {
      relations: [
        'credentials',
        'credentials.issuer',
        'credentials.subject',
        'presentations',
        'presentations.credentials',
      ],
    })

    expect(message.credentials.length).toEqual(1)
    expect(message.credentials[0].claims.length).toEqual(3)
    expect(message.presentations.length).toEqual(1)
    expect(message.presentations[0].credentials.length).toEqual(1)

    let where = {}

    where['issuer'] = In([id1.did])
    where['subject'] = In([id2.did])
    where['type'] = 'name'

    const claims = await Claim.find({
      relations: ['credential', 'credential.issuer', 'credential.subject'],
      where,
    })

    expect(claims[0].type).toEqual('name')
    expect(claims[0].value).toEqual('Alice')

    const presentations = await Presentation.find({
      relations: ['audience'],
      where: Raw(alias => `audience.did = "did:test:333"`),
    })

    expect(presentations.length).toEqual(1)
  })

  it('Message can have externally set id', async () => {
    const customId = blake2bHex('hash123')

    const message = new Message()
    message.type = 'custom'
    message.id = customId

    await message.save()

    const fromDb = await Message.findOne(customId)

    expect(fromDb.id).toEqual(customId)
    expect(fromDb.type).toEqual('custom')
  })
})
