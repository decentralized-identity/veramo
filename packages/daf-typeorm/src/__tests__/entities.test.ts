import { IVerifiableCredential, IVerifiablePresentation } from 'daf-core'
import { Credential, createCredentialEntity } from '../entities/credential'
import { Presentation, createPresentationEntity } from '../entities/presentation'
import { createConnection, Connection, In, Raw } from 'typeorm'
import { Identity, Key, Message, Claim } from '../index'
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
    const did1 = 'did:test:111'
    const did2 = 'did:test:222'

    const entity = createCredentialEntity({
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: did1,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did2,
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
      proof: {
        jwt: 'mockJWT',
      },
    })
    await entity.save()

    const credential = await Credential.findOne(entity.hash, {
      relations: ['issuer', 'subject', 'claims', 'claims.issuer', 'claims.subject'],
    })
    expect(credential.issuer.did).toEqual(did1)
    expect(credential.subject.did).toEqual(did2)
    expect(credential.claims.length).toEqual(3)
    expect(credential.claims[0].issuer.did).toEqual(did1)
    expect(credential.claims[0].subject.did).toEqual(did2)
  })

  it('Saves message with credentials', async () => {
    const did1 = 'did:test:111'
    const did2 = 'did:test:222'
    const did3 = 'did:test:333'

    const vc = createCredentialEntity({
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: did1,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did2,
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
      proof: {
        jwt: 'mockJWT',
      },
    })

    const vp = createPresentationEntity({
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiablePresentation', 'PublicProfile'],
      issuer: did1,
      audience: [did2],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [vc.raw],
      proof: {
        jwt: 'mockJWT',
      },
    })

    const vp2 = createPresentationEntity({
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiablePresentation', 'PublicProfile'],
      issuer: did1,
      audience: [did3],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [vc.raw],
      proof: {
        jwt: 'mockJWT',
      },
    })

    await vp2.save()

    const m = new Message()
    m.from = new Identity()
    m.from.did = did1
    m.to = new Identity()
    m.to.did = did2
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
        'credentials.claims',
        'presentations',
        'presentations.credentials',
      ],
    })

    expect(message.credentials.length).toEqual(1)
    expect(message.credentials[0].claims.length).toEqual(3)
    expect(message.presentations.length).toEqual(1)
    expect(message.presentations[0].credentials.length).toEqual(1)

    let where = {}

    where['issuer'] = In([did1])
    where['subject'] = In([did2])
    where['type'] = 'name'

    const claims = await Claim.find({
      relations: ['credential', 'credential.issuer', 'credential.subject'],
      where,
    })

    expect(claims[0].type).toEqual('name')
    expect(claims[0].value).toEqual('Alice')
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
