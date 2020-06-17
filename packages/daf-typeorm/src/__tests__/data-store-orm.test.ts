import {
  Agent,
  IVerifiableCredential,
  IVerifiablePresentation,
  IMessage,
  IAgentBase,
  IAgentDataStore,
} from 'daf-core'
import { createConnection, Connection } from 'typeorm'
import { DataStoreORM, IAgentDataStoreORM } from '../data-store-orm'
import { FindArgs, TClaimsColumns, TCredentialColumns, TMessageColumns, TPresentationColumns } from '../types'
import { DataStore } from '../data-store'
import { Entities } from '../index'
import fs from 'fs'

type TAgent = IAgentBase & IAgentDataStore & IAgentDataStoreORM
const did1 = 'did:test:111'
const did2 = 'did:test:222'
const did3 = 'did:test:333'
const did4 = 'did:test:444'

async function populateDB(agent: TAgent) {
  const vc1: IVerifiableCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiableCredential', 'PublicProfile'],
    issuer: did1,
    issuanceDate: new Date().toISOString(),
    id: 'vc1',
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
  }

  const vp1: IVerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiablePresentation', 'PublicProfile'],
    issuer: did1,
    audience: [did2],
    issuanceDate: new Date().toISOString(),
    verifiableCredential: [vc1],
    proof: {
      jwt: 'mockJWT',
    },
  }

  const vp2: IVerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiablePresentation', 'PublicProfileMultiAudience'],
    issuer: did1,
    audience: [did2, did4],
    issuanceDate: new Date().toISOString(),
    verifiableCredential: [vc1],
    proof: {
      jwt: 'mockJWT',
    },
  }

  const m1: IMessage = {
    id: 'm1',
    from: did1,
    to: did2,
    createdAt: '2020-06-16T11:06:51.680Z',
    type: 'mock',
    raw: 'mock',
    credentials: [vc1],
    presentations: [vp1],
  }

  const m2: IMessage = {
    id: 'm2',
    from: did1,
    to: did1,
    createdAt: '2020-06-16T11:07:51.680Z',
    type: 'mock',
    raw: 'mock234',
  }

  const m3: IMessage = {
    id: 'm3',
    from: did3,
    to: did2,
    createdAt: '2020-06-16T11:08:51.680Z',
    type: 'mock',
    raw: 'mock678',
  }

  const m4: IMessage = {
    id: 'm4',
    from: did1,
    to: did2,
    createdAt: '2020-06-16T11:09:51.680Z',
    type: 'mock',
    raw: 'mockmoreaudienct',
    credentials: [vc1],
    presentations: [vp2],
  }
  await agent.dataStoreSaveMessage(m1)
  await agent.dataStoreSaveMessage(m2)
  await agent.dataStoreSaveMessage(m3)
  await agent.dataStoreSaveMessage(m4)
}

describe('daf-core entities', () => {
  let dbConnection: Promise<Connection>
  const databaseFile = './test-db2.sqlite'

  function makeAgent(context?: Record<string, any>): TAgent {
    return new Agent({
      context,
      plugins: [new DataStore(dbConnection), new DataStoreORM(dbConnection)],
    })
  }

  beforeAll(async () => {
    dbConnection = createConnection({
      type: 'sqlite',
      database: databaseFile,
      entities: Entities,
    })
  })

  beforeEach(async () => {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).synchronize()
    await populateDB(makeAgent())
  })

  afterAll(async () => {
    ;(await dbConnection).close()
    fs.unlinkSync(databaseFile)
  })

  test('search presentations by audience', async () => {
    const agent = makeAgent()
    const args: FindArgs<TPresentationColumns> = {
      where: [
        {
          column: 'audience',
          value: [did4],
          op: 'In',
        },
      ],
    }

    let presentations = await makeAgent().dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)
    let count = await makeAgent().dataStoreORMGetVerifiablePresentationsCount(args)
    expect(count).toBe(1)
    // search when authenticated as the issuer
    let authenticatedDid = did1

    presentations = await makeAgent({ authenticatedDid }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)
    count = await makeAgent({ authenticatedDid }).dataStoreORMGetVerifiablePresentationsCount(args)
    expect(count).toBe(1)

    // search when authenticated as another did
    authenticatedDid = did3

    presentations = await makeAgent({ authenticatedDid }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(0)
    count = await makeAgent({ authenticatedDid }).dataStoreORMGetVerifiablePresentationsCount(args)
    expect(count).toBe(0)
  })

  test('without auth it fetches all messages that match the query', async () => {
    const args: FindArgs<TMessageColumns> = {
      where: [
        {
          column: 'type',
          value: ['mock'],
          op: 'In',
        },
      ],
    }

    const messages = await makeAgent().dataStoreORMGetMessages(args)
    expect(messages.length).toBe(4)

    const count = await makeAgent().dataStoreORMGetMessagesCount(args)
    expect(count).toBe(4)
  })

  test('with auth it only gets messages for the authorized identity', async () => {
    const args: FindArgs<TMessageColumns> = {
      where: [
        {
          column: 'type',
          value: ['mock'],
          op: 'In',
        },
      ],
    }
    const authenticatedDid = did1

    const messages = await makeAgent({ authenticatedDid }).dataStoreORMGetMessages(args)
    expect(messages.length).toBe(3)
    const count = await makeAgent({ authenticatedDid }).dataStoreORMGetMessagesCount(args)
    expect(count).toBe(3)
  })

  test('supports ordering', async () => {
    const agent = makeAgent()
    const args: FindArgs<TMessageColumns> = {
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
    }

    const messages = await agent.dataStoreORMGetMessages(args)
    expect(new Date(messages[0].createdAt).getTime()).toBeGreaterThan(
      new Date(messages[1].createdAt).getTime(),
    )

    const args2: FindArgs<TMessageColumns> = {
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
    }

    const messages2 = await agent.dataStoreORMGetMessages(args2)
    expect(new Date(messages2[0].createdAt).getTime()).toBeLessThan(
      new Date(messages2[1].createdAt).getTime(),
    )
  })

  test('works with relations', async () => {
    const credentials = await makeAgent().dataStoreORMGetVerifiableCredentialsByClaims({})
    expect(credentials.length).toBe(3)
    expect(credentials[0].id).toBe('vc1')
    const count = await makeAgent().dataStoreORMGetVerifiableCredentialsByClaimsCount({})
    expect(count).toBe(1)

    const credentials2 = await makeAgent({
      authenticatedDid: did3,
    }).dataStoreORMGetVerifiableCredentialsByClaims({})
    expect(credentials2.length).toBe(0)
    const count2 = await makeAgent({
      authenticatedDid: did3,
    }).dataStoreORMGetVerifiableCredentialsByClaimsCount({})
    expect(count2).toBe(0)
  })

  test('multiple audience members can retrieve a credential', async () => {
    const args: FindArgs<TPresentationColumns> = {
      where: [
        {
          column: 'type',
          value: ['VerifiablePresentation,PublicProfileMultiAudience'],
          op: 'Equal',
        },
      ],
    }

    let presentations = await makeAgent({ authenticatedDid: did1 }).dataStoreORMGetVerifiablePresentations(
      args,
    )
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authenticatedDid: did2 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authenticatedDid: did4 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authenticatedDid: did3 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(0)
  })

  test('store credential and retrieve by id', async () => {
    const vc5: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: did1,
      issuanceDate: new Date().toISOString(),
      id: 'vc5',
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
    }

    const agent = makeAgent()
    await agent.dataStoreSaveVerifiableCredential(vc5)

    const args: FindArgs<TCredentialColumns> = {
      where: [
        {
          column: 'id',
          value: ['vc5'],
        },
      ],
    }

    const credentials = await agent.dataStoreORMGetVerifiableCredentials(args)
    expect(credentials[0].id).toEqual('vc5')
    const count = await agent.dataStoreORMGetVerifiableCredentialsCount(args)
    expect(count).toEqual(1)
  })

  test('store presentation and retrieve by context and type', async () => {
    const vc6: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/666'],
      type: ['VerifiableCredential', 'PublicProfile6'],
      issuer: did1,
      issuanceDate: new Date().toISOString(),
      id: 'vc6',
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
    }

    const vp6: IVerifiablePresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/99999966666'],
      type: ['VerifiablePresentation', 'PublicProfile6666'],
      issuer: did1,
      audience: [did2],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [vc6],
      proof: {
        jwt: 'mockJWT',
      },
    }

    const agent = makeAgent()
    await agent.dataStoreSaveVerifiablePresentation(vp6)

    const args: FindArgs<TPresentationColumns> = {
      where: [
        {
          column: 'type',
          value: ['VerifiablePresentation,PublicProfile6666'],
        },
        {
          column: 'context',
          value: ['https://www.w3.org/2018/credentials/v1323,https://www.w3.org/2020/demo/99999966666'],
        },
      ],
    }

    const presentations = await agent.dataStoreORMGetVerifiablePresentations(args)
    expect(presentations[0].verifiableCredential[0].id).toEqual('vc6')
  })
})
