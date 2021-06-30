import { IAgentContext } from '@veramo/core'
import { IDataStoreORM } from './data-store-orm'
import { AbstractDidDiscoveryProvider, IDIDDiscoverMatch, IDIDDiscoveryDiscoverDidArgs } from '@veramo/did-discovery'

export class ProfileDiscoveryProvider implements AbstractDidDiscoveryProvider {
  async discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<IDataStoreORM>,
  ): Promise<Array<IDIDDiscoverMatch>> {
    const matches: IDIDDiscoverMatch[] = []
      
    const credentials = await context.agent.dataStoreORMGetVerifiableCredentialsByClaims({
      where: [
        { column: 'type', value: ['name'] },
        { column: 'value', value: [`${args.query}%`], op: 'Like' },
        { column: 'credentialType', value: ['VerifiableCredential,Profile'] }
      ]
    })

    credentials.forEach( vc => {
      matches.push({
        did: vc.verifiableCredential.credentialSubject.id as string,
        metaData: {
          verifiableCredential: vc.verifiableCredential
        }
      })
    })

    return matches
  }
}