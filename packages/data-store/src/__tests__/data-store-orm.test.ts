// noinspection ES6PreferShortImport

import {
  FindArgs,
  IDataStore,
  IDataStoreORM,
  IMessage,
  TAgent,
  TCredentialColumns,
  TMessageColumns,
  TPresentationColumns,
  VerifiableCredential,
  VerifiablePresentation,
} from '../../../core-types/src'
import { Agent } from '../../../core/src'
import { DataSource } from 'typeorm'
import { DataStoreORM } from '../data-store-orm.js'
import { DataStore } from '../data-store.js'
import { Entities } from '../index.js'
import * as fs from 'fs'

const did1 = 'did:test:111'
const did2 = 'did:test:222'
const did3 = 'did:test:333'
const did4 = 'did:test:444'

async function populateDB(agent: TAgent<IDataStore & IDataStoreORM>) {
  const vc1: VerifiableCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiableCredential', 'PublicProfile'],
    issuer: { id: did1 },
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

  const vp1: VerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiablePresentation', 'PublicProfile'],
    holder: did1,
    verifier: [did2],
    issuanceDate: new Date().toISOString(),
    verifiableCredential: [vc1],
    proof: {
      jwt: 'mockJWT',
    },
  }

  const vp2: VerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
    type: ['VerifiablePresentation', 'PublicProfileMultiAudience'],
    holder: did1,
    verifier: [did2, did4],
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
  await agent.dataStoreSaveMessage({ message: m1 })
  await agent.dataStoreSaveMessage({ message: m2 })
  await agent.dataStoreSaveMessage({ message: m3 })
  await agent.dataStoreSaveMessage({ message: m4 })
}

describe('@veramo/data-store queries', () => {
  let dbConnection: Promise<DataSource>
  const databaseFile = './tmp/test-db2.sqlite'

  function makeAgent(context?: Record<string, any>): TAgent<IDataStore & IDataStoreORM> {
    // @ts-ignore
    return new Agent({
      context,
      plugins: [new DataStore(dbConnection), new DataStoreORM(dbConnection)],
    })
  }

  beforeAll(async () => {
    dbConnection = new DataSource({
      type: 'sqlite',
      database: databaseFile,
      entities: Entities,
    }).initialize()
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

  test('search presentations by verifier', async () => {
    const agent = makeAgent()
    const args: FindArgs<TPresentationColumns> = {
      where: [
        {
          column: 'verifier',
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
    let authorizedDID = did1

    presentations = await makeAgent({ authorizedDID }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)
    count = await makeAgent({ authorizedDID }).dataStoreORMGetVerifiablePresentationsCount(args)
    expect(count).toBe(1)

    // search when authenticated as another did
    authorizedDID = did3

    presentations = await makeAgent({ authorizedDID }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(0)
    count = await makeAgent({ authorizedDID }).dataStoreORMGetVerifiablePresentationsCount(args)
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

  test('with auth it only gets messages for the authorized identifier', async () => {
    const args: FindArgs<TMessageColumns> = {
      where: [
        {
          column: 'type',
          value: ['mock'],
          op: 'In',
        },
      ],
    }
    const authorizedDID = did1

    const messages = await makeAgent({ authorizedDID }).dataStoreORMGetMessages(args)
    expect(messages.length).toBe(3)
    const count = await makeAgent({ authorizedDID }).dataStoreORMGetMessagesCount(args)
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
    expect(new Date('' + messages[0].createdAt).getTime()).toBeGreaterThan(
      new Date('' + messages[1].createdAt).getTime(),
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
    expect(new Date('' + messages2[0].createdAt).getTime()).toBeLessThan(
      new Date('' + messages2[1].createdAt).getTime(),
    )
  })

  test('works with relations', async () => {
    const credentials = await makeAgent().dataStoreORMGetVerifiableCredentialsByClaims({})
    expect(credentials.length).toBe(1)
    expect(credentials[0].verifiableCredential.id).toBe('vc1')
    const count = await makeAgent().dataStoreORMGetVerifiableCredentialsByClaimsCount({})
    expect(count).toBe(3)

    const credentials2 = await makeAgent({
      authorizedDID: did3,
    }).dataStoreORMGetVerifiableCredentialsByClaims({})
    expect(credentials2.length).toBe(0)
    const count2 = await makeAgent({
      authorizedDID: did3,
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

    let presentations = await makeAgent({ authorizedDID: did1 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authorizedDID: did2 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authorizedDID: did4 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(1)

    presentations = await makeAgent({ authorizedDID: did3 }).dataStoreORMGetVerifiablePresentations(args)
    expect(presentations.length).toBe(0)
  })

  test('store credential and retrieve by id', async () => {
    const vc5: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: { id: did1 },
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
    await agent.dataStoreSaveVerifiableCredential({ verifiableCredential: vc5 })

    const args: FindArgs<TCredentialColumns> = {
      where: [
        {
          column: 'id',
          value: ['vc5'],
        },
      ],
      order: [{ column: 'issuanceDate', direction: 'DESC' }],
    }

    const credentials = await agent.dataStoreORMGetVerifiableCredentials(args)
    expect(credentials[0].verifiableCredential.id).toEqual('vc5')
    const count = await agent.dataStoreORMGetVerifiableCredentialsCount(args)
    expect(count).toEqual(1)
  })

  test('store presentation and retrieve by context and type', async () => {
    const vc6: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/666'],
      type: ['VerifiableCredential', 'PublicProfile6'],
      issuer: { id: did1 },
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

    const vp6: VerifiablePresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/99999966666'],
      type: ['VerifiablePresentation', 'PublicProfile6666'],
      holder: did1,
      verifier: [did2],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [vc6],
      proof: {
        jwt: 'mockJWT',
      },
    }

    const agent = makeAgent()
    await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation: vp6 })

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
    const cred0 = presentations[0].verifiablePresentation.verifiableCredential?.[0] as VerifiableCredential
    expect(cred0.id).toEqual('vc6')
  })

  it('should query identifiers', async () => {
    const agent = makeAgent()
    const identifiers = await agent.dataStoreORMGetIdentifiers()
    expect(identifiers.length).toEqual(4)

    const count = await agent.dataStoreORMGetIdentifiersCount()
    expect(count).toEqual(4)
  })
})
