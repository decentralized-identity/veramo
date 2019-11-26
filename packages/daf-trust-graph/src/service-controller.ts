import 'cross-fetch/polyfill' // this is needed for apollo client to run on nodejs
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import { createJWT } from 'did-jwt'

import { ServiceController, ServiceControllerOptions, ServiceInstanceId } from 'daf-core'
import * as queries from './queries'

import { defaultTrustGraphUri, defaultTrustGraphWsUri } from './config'
import Debug from 'debug'
const debug = Debug('trust-graph-message-service')

export class TrustGraphServiceController implements ServiceController {
  private options: ServiceControllerOptions
  private client: ApolloClient<any>

  private uri: string
  private wsUri?: string

  public instanceId(): ServiceInstanceId {
    return {
      did: this.options.issuer.did,
      sourceType: 'trustGraph',
    }
  }

  constructor(options: ServiceControllerOptions) {
    this.options = options
    const { didDoc } = options

    const service = didDoc && didDoc.service && didDoc.service.find(item => item.type === 'TrustGraph')
    const serviceWs = didDoc && didDoc.service && didDoc.service.find(item => item.type === 'TrustGraphWs')

    const serviceEndpoint = service ? service.serviceEndpoint : defaultTrustGraphUri
    const serviceEndpointWs = serviceWs ? serviceWs.serviceEndpoint : defaultTrustGraphWsUri

    const uri = options.config.uri || serviceEndpoint
    const wsUri = options.config.wsUri || serviceEndpointWs

    this.uri = uri
    this.wsUri = wsUri

    debug('Initializing for', options.issuer.did)
    debug('URI', uri)
    debug('WSURI', wsUri)

    const httpLink = new HttpLink({ uri })
    var link = null

    if (wsUri) {
      const wsLink = new WebSocketLink({
        uri: wsUri,
        options: {
          reconnect: true,
          connectionParams: async () => {
            const token = await this.getAuthToken()
            return { authorization: `Bearer ${token}` }
          },
        },
        webSocketImpl: this.options.config.webSocketImpl,
      })

      link = split(
        // split based on operation type
        ({ query }) => {
          const definition = getMainDefinition(query)
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        },
        wsLink,
        httpLink,
      )
    } else {
      link = httpLink
    }

    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: link,
    })
  }

  private async getAuthToken() {
    debug('Signing auth token for', this.options.issuer.did)

    return createJWT(
      {
        exp: Math.floor(Date.now() / 1000) + 5000, // what is a reasonable value here?
      },
      {
        signer: this.options.issuer.signer,
        alg: 'ES256K-R',
        issuer: this.options.issuer.did,
      },
    )
  }

  async sync(since: number) {
    debug('Syncing data for %s since %d', this.options.issuer.did, since)
    const token = await this.getAuthToken()

    const { data } = await this.client.query({
      fetchPolicy: 'no-cache',
      query: queries.findEdges,
      variables: {
        toDID: [this.options.issuer.did],
        since,
      },
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    })

    for (const edge of data.findEdges) {
      await this.options.onRawMessage({
        raw: edge.jwt,
        meta: [
          {
            sourceType: this.instanceId().sourceType,
            sourceId: this.uri,
          },
        ],
      })
    }
  }

  async init() {
    const { options, wsUri } = this
    const sourceType = this.instanceId().sourceType

    if (wsUri) {
      debug('Subscribing to edgeAdded for', options.issuer.did)

      this.client
        .subscribe({
          query: queries.edgeAdded,
          variables: { toDID: options.issuer.did },
        })
        .subscribe({
          async next(result) {
            options.onRawMessage({
              raw: result.data.edgeAdded.jwt,
              meta: [
                {
                  sourceType,
                  sourceId: wsUri,
                },
              ],
            })
          },
          error(err) {
            debug('Error', err)
          },
        })
    }

    return true
  }
}
