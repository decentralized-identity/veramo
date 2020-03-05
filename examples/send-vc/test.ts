import {
  Identity,
  Key,
  OMessage,
  MessageMetaData,
  Credential,
  Presentation,
  CredentialContext,
  CredentialType,
  PresentationContext,
  PresentationType,
  Claim,
  Action,
} from 'daf-core'
import { core } from './setup'
import { createConnection } from 'typeorm'

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

    synchronize: false,
    logging: true,
    entities: [
      Key,
      Identity,
      OMessage,
      MessageMetaData,
      Credential,
      PresentationType,
      PresentationContext,
      Presentation,
      CredentialType,
      CredentialContext,
      Claim,
      Action,
    ],
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

  console.log(identity1)
  console.log(identity2)

  const vc = new Credential()
  vc.issuer = identity1
  vc.subject = identity2
}

main().catch(console.log)
