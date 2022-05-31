import { IAgentContext, IDataStoreORM } from '@veramo/core'
import {
  AbstractDidDiscoveryProvider,
  IDIDDiscoverMatch,
  IDIDDiscoveryProviderResult,
  IDIDDiscoveryDiscoverDidArgs,
} from '@veramo/did-discovery'

export class DataStoreDiscoveryProvider implements AbstractDidDiscoveryProvider {
  readonly name = 'data-store-discovery'

  async discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<IDataStoreORM>,
  ): Promise<IDIDDiscoveryProviderResult> {
    const matches: IDIDDiscoverMatch[] = []

    const credentialsByName = await context.agent.dataStoreORMGetVerifiableCredentialsByClaims({
      where: [
        { column: 'type', value: ['name'] },
        { column: 'value', value: [`%${args.query}%`], op: 'Like' },
        { column: 'credentialType', value: ['VerifiableCredential,Profile'] },
      ],
    })

    credentialsByName.forEach((vc) => {
      matches.push({
        did: vc.verifiableCredential.credentialSubject.id as string,
        metaData: {
          verifiableCredential: vc.verifiableCredential,
        },
      })
    })
    
    const credentialsByDID = await context.agent.dataStoreORMGetVerifiableCredentialsByClaims({
      where: [
        { column: 'type', value: ['name'] },
        { column: 'subject', value: [`%${args.query}%`], op: 'Like' },
        { column: 'credentialType', value: ['VerifiableCredential,Profile'] },
      ],
    })
    
    credentialsByDID.forEach((vc) => {
      matches.push({
        did: vc.verifiableCredential.credentialSubject.id as string,
        metaData: {
          verifiableCredential: vc.verifiableCredential,
        },
      })
    })

    const identifiersByDID = await context.agent.dataStoreORMGetIdentifiers({
      where: [
        { column: 'did', value: [`%${args.query}%`], op: 'Like'}
      ]
    })

    identifiersByDID.forEach((identifier) => {
      matches.push({
        did: identifier.did as string,
        metaData: {
          alias: identifier.alias
        }
      })
    })

    const identifiersByAlias = await context.agent.dataStoreORMGetIdentifiers({
      where: [
        { column: 'alias', value: [`%${args.query}%`], op: 'Like'}
      ]
    })

    identifiersByAlias.forEach((identifier) => {
      matches.push({
        did: identifier.did as string,
        metaData: {
          alias: identifier.alias
        }
      })
    })

    return {
      provider: this.name,
      matches,
    }
  }
}
