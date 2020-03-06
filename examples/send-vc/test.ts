import { Identity, Key, OMessage, MessageMetaData, Credential, Presentation, Claim, Action } from 'daf-core'
import { core } from './setup'
import { createConnection, Like } from 'typeorm'

const main = async () => {
  await createConnection({
    // Sqlite
    // "type": "sqlite",
    // "database": "database.sqlite",

    //Postgres
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'simonas',
    password: '',
    database: 'simonas',

    synchronize: true,
    logging: true,
    entities: [Key, Identity, OMessage, MessageMetaData, Credential, Presentation, Claim, Action],
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

  // const vc = new Credential()
  // vc.issuer = identity1
  // vc.subject = identity2
  // vc.issuedAt = 1235456
  // vc.notBefore = 1232424
  // vc.expiresAt = 32423423
  // vc.raw = '4123123123'
  // vc.context = ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323']
  // vc.type = ['VerifiableCredential', 'PublicProfile']
  // vc.setCredentialSubject({
  //   name: 'Simonas',
  //   profilePicture: 'https://simons.com/a.png',
  //   address: {
  //     street: 'some',
  //     house: 1
  //   }
  // })

  // try {
  //   await vc.save()
  // } catch(e) {
  //   console.log(e.message)
  // }

  // console.log(vc)

  // const res = await Claim.find({
  //   relations: ['issuer', 'subject', 'credential'],
  //   where: {
  //     issuer: identity1,
  //     type: 'name'
  //   }
  // })

  const res = await Credential.find({
    where: {
      type: Like('%Public%'),
    },
  })

  console.dir(res, { depth: 10 })
}

main().catch(console.log)
