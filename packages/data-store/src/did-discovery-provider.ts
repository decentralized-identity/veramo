import { IAgentContext, IDataStoreORM } from '@veramo/core-types'
import {
  AbstractDidDiscoveryProvider,
  IDIDDiscoverMatch,
  IDIDDiscoveryProviderResult,
  IDIDDiscoveryDiscoverDidArgs,
} from '@veramo/did-discovery'

/**
 * This implementation of {@link @veramo/did-discovery#AbstractDidDiscoveryProvider | AbstractDidDiscoveryProvider}
 * helps you discover DIDs based on data that is stored by a local plugin that implements
 * {@link @veramo/core-types#IDataStoreORM | IDataStoreORM}.
 *
 * DIDs can be discovered by partial matches of `name` from `Profile` credentials, by partial matches of `alias` of
 * managed DIDs as well as partial matches of DIDs that are issuer or subject of credentials.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
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
      where: [{ column: 'did', value: [`%${args.query}%`], op: 'Like' }],
    })

    identifiersByDID.forEach((identifier) => {
      matches.push({
        did: identifier.did as string,
        metaData: {
          alias: identifier.alias,
        },
      })
    })

    const identifiersByAlias = await context.agent.dataStoreORMGetIdentifiers({
      where: [{ column: 'alias', value: [`%${args.query}%`], op: 'Like' }],
    })

    identifiersByAlias.forEach((identifier) => {
      matches.push({
        did: identifier.did as string,
        metaData: {
          alias: identifier.alias,
        },
      })
    })

    return {
      provider: this.name,
      matches,
    }
  }
}
