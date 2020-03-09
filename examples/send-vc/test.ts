import { Identity, Key, Message, MessageMetaData, Credential, Presentation, Claim } from 'daf-core'
import { core } from './setup'
import { createConnection, Like } from 'typeorm'

const main = async () => {
  await createConnection({
    // Sqlite
    type: 'sqlite',
    database: 'database.sqlite',

    //Postgres
    // type: 'postgres',
    // host: 'localhost',
    // port: 5432,
    // username: 'simonas',
    // password: '',
    // database: 'simonas',

    synchronize: true,
    logging: true,
    entities: [Key, Identity, Message, MessageMetaData, Credential, Presentation, Claim],
  })

  // let identity1: Identity
  // let identity2: Identity
  // const identities = await core.identityManager.getIdentities()
  // if (identities.length > 1) {
  //   identity1 = (identities[0] as any) as Identity
  //   identity2 = (identities[1] as any) as Identity
  // } else {
  //   const identityProviders = await core.identityManager.getIdentityProviderTypes()
  //   identity1 = ((await core.identityManager.createIdentity(identityProviders[0].type)) as any) as Identity
  //   identity2 = ((await core.identityManager.createIdentity(identityProviders[0].type)) as any) as Identity
  // }

  // console.log(identity1)
  // console.log(identity2)

  // const identity3 = new Identity()
  // identity3.did = 'did:web:uport.me'

  // const vc = new Credential()
  // vc.issuer = identity1
  // vc.subject = identity2
  // vc.issuedAt = new Date()
  // vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
  // vc.type = ['VerifiableCredential', 'PublicProfile']
  // vc.setRaw('JWTvc2')
  // vc.setCredentialSubject({
  //   name: 'Jonas',
  //   // profilePicture: 'https://simons.com/a.png',
  //   // address: {
  //   //   street: 'some',
  //   //   house: 1
  //   // }
  // })

  // const vp = new Presentation()
  // vp.issuer = identity1
  // vp.audience = identity3
  // vp.issuedAt = new Date()
  // vp.context = ['https://www.w3.org/2018/credentials/v1323']
  // vp.type = ['VerifiablePresentation', 'KYC']
  // vp.credentials = [vc]
  // vp.setRaw('JWTvp2')

  // const m = new OMessage()
  // m.id = 'aaaaaaabbb'
  // m.from = identity1
  // m.to = [identity2]
  // m.type = 'w3c.vp'
  // m.raw = 'JWTvp3333'
  // m.presentations = [vp]
  // m.credentials = [vc]

  // const meta1 = new MessageMetaData()
  // meta1.type = 'TrustGraph'
  // meta1.value = 'https://custom.url/'

  // const meta2 = new MessageMetaData()
  // meta2.type = 'JWT'
  // meta2.value = 'RSA123'

  // m.metaData = [meta1, meta2]

  // try {
  //   await m.save()
  //   console.log(m)
  // } catch (e) {
  //   console.log(e.message)
  // }

  // const res = await Claim.find({
  //   relations: ['issuer', 'subject', 'credential'],
  //   where: {
  //     issuer: identity1,
  //     type: 'name'
  //   }
  // })

  // const res = await Credential.find({
  //   where: {
  //     type: Like('%Public%'),
  //   },
  // })

  // console.dir(res, { depth: 10 })

  // const msg = new Message({raw: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk4NzUsImF1ZCI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidGFnIjoieHl6LTEyMyIsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5rc3RVaUo5LmV5SnBZWFFpT2pFMU9ESTJNVGsyTnpZc0luTjFZaUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJaXdpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaVhTd2lkSGx3WlNJNld5SldaWEpwWm1saFlteGxRM0psWkdWdWRHbGhiQ0pkTENKamNtVmtaVzUwYVdGc1UzVmlhbVZqZENJNmV5SnVZVzFsSWpvaVFXeHBZMlVpZlgwc0ltbHpjeUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJbjAuSUdGMUxGT2M0X1BjR1ZlcTdZdzdPR3o0R2o3eFhaSzZwOGJQOUNTRUlYejdtTkZQTTB2MG51ZXZUWjQ3YTBJOFhnTGZDRk5rVXJJSXNjakg4TUZ4X3dFIl19LCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4M2MzNTdiYTQ1ODkzM2ExOWMxZGYxYzdmNmI0NzNiMzMwMmJiYmU2MSJ9.7gIGq437moBKMwF3PUrycjCP4Op6dL6IJV6GygSq1KGV7QU0II16YzETsr412AlHl_kaYgUJjRav7unJdyJL0wA'})
  // const msg = new Message({
  //   raw:
  //     'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE',
  // })
  // const validated = await core.validateMessage(msg)
  // // console.dir({validated}, {depth: 10})
  // await validated.save()
  //   console.log('after ----------')
  //   console.dir({ validated }, { depth: 10 })
  //

  // const hash = '77f02854ccbf36b2d670cb62efc8807e3f76e8536279ca515a1d3abe564ab0b7d191579740d39e8a9a661fcd1bb7dafe4cface430081f4a08833f14d8e18392c'

  // const credential = await Credential.findOne(hash, {
  //   relations: ['messages', 'messages.from', 'messages.to']
  // })

  // console.log(credential.messages)

  // const i1 = new Identity()
  // i1.did = 'did:example:3'

  const i2 = new Identity()
  i2.did = 'did:example:2'

  // const m1 = new Message()
  // m1.type = 'vp'
  // m1.raw = '333'
  // m1.from = i1
  // m1.to = [i2]

  // await m1.save()

  const messages = await Message.find({
    relations: ['from', 'to'],
    where: {
      to: {
        did: 'did:example:2',
      },
    },
  })

  console.dir({ messages }, { depth: 10 })
}

main().catch(console.log)
