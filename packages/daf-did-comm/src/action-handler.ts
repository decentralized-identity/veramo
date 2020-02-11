import { Core, AbstractActionHandler, Types, Message } from 'daf-core'
import { DIDComm } from 'DIDComm-js'
import uuid from 'uuid'
import Debug from 'debug'

const debug = Debug('daf:did-comm:action-handler')

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
  private didcomm: DIDComm

  constructor() {
    super()
    this.didcomm = new DIDComm()
  }

  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.sendJwt) {
      const { data } = action as ActionSendJWT

      debug('Resolving didDoc')
      const didDoc = await core.didResolver.resolve(data.to)
      const service = didDoc && didDoc.service && didDoc.service.find(item => item.type == 'Messaging')

      if (service) {
        try {
          let body = data.jwt

          try {
            const identity = await core.identityManager.getIdentity(data.from)
            const dm = JSON.stringify({
              '@type': 'JWT',
              id: uuid.v4(),
              data: data.jwt,
            })
            debug(dm)
            body = await identity.encrypt(data.to, dm)
            debug('Encrypted:', body)
          } catch (e) {
            console.log(e)
          }

          debug('Sending to %s', service.serviceEndpoint)
          const res = await fetch(service.serviceEndpoint, {
            method: 'POST',
            body,
          })
          debug('Status', res.status, res.statusText)

          if (res.status == 200) {
            await core.validateMessage(new Message({ raw: data.jwt, meta: { type: 'DIDComm-sent' } }))
          }

          return res.status == 200
        } catch (e) {
          return Promise.reject(e)
        }
      } else {
        debug('No MessagingService service in didDoc')
        return super.handleAction(action, core)
      }
    }
    return super.handleAction(action, core)
  }
}
