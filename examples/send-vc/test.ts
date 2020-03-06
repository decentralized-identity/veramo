import { Identity, Key, OMessage, MessageMetaData, Credential, Presentation, Claim } from 'daf-core'
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
    entities: [Key, Identity, OMessage, MessageMetaData, Credential, Presentation, Claim],
  })

  let identity1: Identity
  let identity2: Identity
  const identities = await core.identityManager.getIdentities()
  if (identities.length > 1) {
    identity1 = (identities[0] as any) as Identity
    identity2 = (identities[1] as any) as Identity
  } else {
    const identityProviders = await core.identityManager.getIdentityProviderTypes()
    identity1 = ((await core.identityManager.createIdentity(identityProviders[0].type)) as any) as Identity
    identity2 = ((await core.identityManager.createIdentity(identityProviders[0].type)) as any) as Identity
  }

  // console.log(identity1)
  // console.log(identity2)

  const identity3 = new Identity()
  identity3.did = 'did:web:uport.me'

  const vc = new Credential()
  vc.issuer = identity1
  vc.subject = identity2
  vc.issuedAt = new Date()
  vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
  vc.type = ['VerifiableCredential', 'PublicProfile']
  vc.setRaw('JWTvc2')
  vc.setCredentialSubject({
    name: 'Jonas',
    // profilePicture: 'https://simons.com/a.png',
    // address: {
    //   street: 'some',
    //   house: 1
    // }
  })

  const vp = new Presentation()
  vp.issuer = identity1
  vp.audience = identity3
  vp.issuedAt = new Date()
  vp.context = ['https://www.w3.org/2018/credentials/v1323']
  vp.type = ['VerifiablePresentation', 'KYC']
  vp.credentials = [vc]
  vp.setRaw('JWTvp2')

  const m = new OMessage()
  m.id = 'aaaaaaabbb'
  m.from = identity1
  m.to = [identity2]
  m.type = 'w3c.vp'
  m.raw = 'JWTvp3333'
  m.presentations = [vp]
  m.credentials = [vc]

  const meta1 = new MessageMetaData()
  meta1.type = 'TrustGraph'
  meta1.value = 'https://custom.url/'

  const meta2 = new MessageMetaData()
  meta2.type = 'JWT'
  meta2.value = 'RSA123'

  m.metaData = [meta1, meta2]

  try {
    await m.save()
    console.log(m)
  } catch (e) {
    console.log(e.message)
  }

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
}

main().catch(console.log)
