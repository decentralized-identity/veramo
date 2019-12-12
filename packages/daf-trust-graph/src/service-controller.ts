import 'cross-fetch/polyfill' // this is needed for apollo client to run on nodejs
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import { createJWT } from 'did-jwt'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { AbstractServiceController, ServiceEventTypes, Issuer, Resolver } from 'daf-core'
import * as queries from './queries'
import * as Daf from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:trust-graph:service-controller')

export class ServiceController extends AbstractServiceController {
  static defaultUri = 'https://trustgraph.uport.me/graphql'
  static defaultWsUri = 'wss://trustgraph.uport.me/graphql'
  static webSocketImpl?: any

  public ready: Promise<boolean>

  private client?: ApolloClient<any>

  private uri: string = ''
  private wsUri?: string

  public instanceId() {
    return {
      did: this.issuer.did,
      type: 'trustGraph',
      id: this.uri,
    }
  }

  constructor(issuer: Issuer, didResolver: Resolver) {
    super(issuer, didResolver)
    this.ready = this.initialize()
  }

  async initialize(): Promise<boolean> {
    const didDoc = await this.didResolver.resolve(this.issuer.did)

    const service = didDoc && didDoc.service && didDoc.service.find(item => item.type === 'TrustGraph')
    const serviceWs = didDoc && didDoc.service && didDoc.service.find(item => item.type === 'TrustGraphWs')

    this.uri = service ? service.serviceEndpoint : ServiceController.defaultUri
    this.wsUri = serviceWs ? serviceWs.serviceEndpoint : ServiceController.defaultWsUri

    debug('Initializing for', this.issuer.did)
    debug('URI', this.uri)
    debug('WSURI', this.wsUri)

    const httpLink = new HttpLink({ uri: this.uri })
    var link = null

    if (this.wsUri) {
      const wsClient = new SubscriptionClient(
        this.wsUri,
        {
          lazy: false,
          reconnect: true,
          connectionParams: async () => {
            const token = await this.getAuthToken()
            return { authorization: `Bearer ${token}` }
          },
        },
        ServiceController.webSocketImpl,
      )

      const wsLink = new WebSocketLink(wsClient)

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

    return true
  }

  private async getAuthToken() {
    debug('Signing auth token for', this.issuer.did)

    const token = await createJWT(
      {
        exp: Math.floor(Date.now() / 1000) + 5000, // what is a reasonable value here?
      },
      {
        signer: this.issuer.signer,
        alg: 'ES256K-R',
        issuer: this.issuer.did,
      },
    )
    debug(token)
    return token
  }

  async getMessagesSince(since: number) {
    debug('Syncing data for %s since %d', this.issuer.did, since)
    if (!this.client) {
      throw Error('Client not configured')
    }
    const token = await this.getAuthToken()

    const { data } = await this.client.query({
      fetchPolicy: 'no-cache',
      query: queries.findEdges,
      variables: {
        toDID: [this.issuer.did],
        since,
      },
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    })

    const messages: Daf.Message[] = []

    for (const edge of data.findEdges) {
      messages.push(
        new Daf.Message({
          raw: edge.jwt,
          meta: {
            type: this.instanceId().type,
            id: this.uri,
          },
        }),
      )
    }
    return messages
  }

  async listen() {
    if (!this.client) {
      throw Error('Client not configured')
    }

    const { wsUri, uri } = this
    const { type } = this.instanceId()
    const emit = this.emit.bind(this)

    if (wsUri) {
      debug('Subscribing to edgeAdded for', this.issuer.did)

      this.client
        .subscribe({
          query: queries.edgeAdded,
          variables: { toDID: [this.issuer.did] },
        })
        .subscribe({
          async next(result) {
            emit(ServiceEventTypes.NewMessages, [
              new Daf.Message({
                raw: result.data.edgeAdded.jwt,
                meta: { type, id: uri },
              }),
            ])
          },
          error(err) {
            debug('Error', err)
          },
        })
    }

    return true
  }
}
