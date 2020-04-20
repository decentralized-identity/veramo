import { createConnection, Connection, In } from 'typeorm'
import { Identity, Key, Message, Credential, Presentation, Claim } from '../index'
import { Entities, Gql, Agent, Resolver } from '../index'
import { DafResolver } from 'daf-resolver'
import fs from 'fs'
import { resolvers } from '../graphql/graphql-identity-manager'
import { FindArgs } from '../graphql/graphql-core'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const didResolver: Resolver = new DafResolver({
  infuraProjectId,
})

async function populateDB() {
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
  vp.audience = id2
  vp.issuanceDate = new Date()
  vp.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
  vp.type = ['VerifiablePresentation', 'PublicProfile']
  vp.raw = 'mockJWT'
  vp.credentials = [vc]

  const m = new Message()
  m.from = id1
  m.to = id2
  m.type = 'mock'
  m.raw = 'mock'
  m.createdAt = new Date()
  m.credentials = [vc]
  m.presentations = [vp]

  await m.save()

  const m2 = new Message()
  m2.from = id1
  m2.to = id1
  m2.type = 'mock'
  m2.raw = 'mock234'
  m2.createdAt = new Date()

  await m2.save()

  const m3 = new Message()
  m3.from = id3
  m3.to = id2
  m3.type = 'mock'
  m3.raw = 'mock678'
  m3.createdAt = new Date()

  await m3.save()
}

describe('daf-core entities', () => {
  let connection: Connection
  const databaseFile = './test-db2.sqlite'

  function makeAgent(): Agent {
    return new Agent({
      dbConnection: (async () => connection)(),
      identityProviders: [],
      didResolver,
    })
  }

  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: databaseFile,
      entities: Entities,
    })
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
    await populateDB()
  })

  afterAll(async () => {
    await connection.close()
    fs.unlinkSync(databaseFile)
  })

  test('without auth it fetches all messages that match the query', async () => {
    const agent = makeAgent()
    const query: FindArgs = {
      input: {
        where: [
          {
            column: 'type',
            value: ['mock'],
            op: 'In',
          },
        ],
      },
    }

    const messages = await Gql.Core.resolvers.Query.messages({}, query, { agent })
    expect(messages.length).toBe(3)
  })

  test('with auth it only gets messages for the authorized identity', async () => {
    const agent = makeAgent()
    const authenticatedDid = 'did:test:111'

    const query: FindArgs = {
      input: {
        where: [
          {
            column: 'type',
            value: ['mock'],
            op: 'In',
          },
        ],
      },
    }

    const messages = await Gql.Core.resolvers.Query.messages({}, query, { agent, authenticatedDid })
    expect(messages.length).toBe(2)
  })

  test('works for counts too', async () => {
    const agent = makeAgent()
    const query: FindArgs = {
      input: {
        where: [
          {
            column: 'type',
            value: ['mock'],
            op: 'In',
          },
        ],
      },
    }

    const messagesCount = await Gql.Core.resolvers.Query.messagesCount({}, query, { agent })
    expect(messagesCount).toBe(3)
    const authenticatedDid = 'did:test:111'

    const messagesCount2 = await Gql.Core.resolvers.Query.messagesCount({}, query, {
      agent,
      authenticatedDid,
    })
    expect(messagesCount2).toBe(2)
  })

  test('supports ordering', async () => {
    const agent = makeAgent()
    const query: FindArgs = {
      input: {
        where: [
          {
            column: 'type',
            value: ['mock'],
            op: 'In',
          },
        ],
        order: [
          {
            column: 'createdAt',
            direction: 'DESC',
          },
        ],
      },
    }

    const messages = await Gql.Core.resolvers.Query.messages({}, query, { agent })
    expect(messages[0].createdAt.getTime()).toBeGreaterThan(messages[1].createdAt.getTime())

    const query2: FindArgs = {
      input: {
        where: [
          {
            column: 'type',
            value: ['mock'],
            op: 'In',
          },
        ],
        order: [
          {
            column: 'createdAt',
            direction: 'ASC',
          },
        ],
      },
    }

    const messages2 = await Gql.Core.resolvers.Query.messages({}, query2, { agent })
    expect(messages2[0].createdAt.getTime()).toBeLessThan(messages2[1].createdAt.getTime())
  })

  test('works with relations', async () => {
    const agent = makeAgent()
    const query = {}

    const claims = await Gql.Core.resolvers.Query.claims({}, query, { agent })
    expect(claims.length).toBe(3)
    expect(claims[0].credential.hash).toBe(
      '616858dd40c4ca838e9a94a368613a057871761d5940e3b57b4f17591799e7d3e5bbe3b7e9b2cb582406737997fe79f99a609c455ee3cd5d5a95b31db7e1c3c7',
    )
    const agent2 = makeAgent()
    const authenticatedDid = 'did:test:333'

    const claims2 = await Gql.Core.resolvers.Query.claims({}, query, { agent, authenticatedDid })
    expect(claims2.length).toBe(0)
  })
  test('works with single item queries', async () => {
    const agent = makeAgent()
    const query = {
      id:
        'fd57aa2fa89f65096c211c89f386b9d4e31e03d2e36b7cddc844bf22aa614f89f29ddce8c0aa557dc19b9bb6d5826bdf622798b649354374ffa0c54eff29c238',
    }

    const message = await Gql.Core.resolvers.Query.message({}, query, { agent })
    expect(message.raw).toBe('mock')
    let authenticatedDid = 'did:test:111'

    const message2 = await Gql.Core.resolvers.Query.message({}, query, { agent, authenticatedDid })
    expect(message.raw).toBe('mock')

    authenticatedDid = 'did:test:333'

    const message3 = await Gql.Core.resolvers.Query.message({}, query, { agent, authenticatedDid })
    expect(message3).toBeUndefined()
  })
})
