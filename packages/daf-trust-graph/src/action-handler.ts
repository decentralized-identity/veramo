import { Core, AbstractActionHandler, Types, Message } from 'daf-core'
import { ServiceController } from './service-controller'

import Debug from 'debug'
const debug = Debug('trust-graph-action-handler')

export const ActionTypes = {
  sendJwt: 'action.sendJwt',
}

export interface ActionSendJWT extends Types.Action {
  data: {
    from: string
    to: string
    jwt: string
  }
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.sendJwt) {
      const { data } = action as ActionSendJWT

      debug('Resolving didDoc')
      const didDoc = await core.didResolver.resolve(data.to)

      const service = didDoc && didDoc.service && didDoc.service.find(item => item.type == 'TrustGraph')
      const uri = service ? service.serviceEndpoint : ServiceController.defaultUri

      try {
        debug('Sending to %s', uri)
        const res = await fetch(uri, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'mutation addEdge($edgeJWT: String!) { addEdge(edgeJWT: $edgeJWT) { hash }}',
            variables: { edgeJWT: data.jwt },
          }),
        })

        debug('Status', res.status, res.statusText)

        if (res.status == 200) {
          await core.validateMessage(new Message({ raw: data.jwt, meta: { type: 'trustGraph', id: uri } }))
        }

        return res.status == 200
      } catch (e) {
        return Promise.reject(e)
      }
    }
    return super.handleAction(action, core)
  }
}
