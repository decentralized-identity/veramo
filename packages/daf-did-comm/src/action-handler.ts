import { Core, AbstractActionHandler, Action, Message } from 'daf-core'
import uuid from 'uuid'
import Debug from 'debug'

const debug = Debug('daf:did-comm:action-handler')

export const ActionTypes = {
  sendJwt: 'action.sendJwt',
}

export interface ActionSendJWT extends Action {
  data: {
    from: string
    to: string
    jwt: string
  }
}

export class DIDCommActionHandler extends AbstractActionHandler {
  constructor() {
    super()
  }

  public async handleAction(action: Action, core: Core) {
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

            const key = await identity.keyByType('Ed25519')
            const publicKey = didDoc?.publicKey.find(item => item.type == 'Ed25519VerificationKey2018')
            if (!publicKey?.publicKeyHex) throw Error('Recipient does not have encryption publicKey')

            body = await key.encrypt(
              {
                type: 'Ed25519',
                publicKeyHex: publicKey?.publicKeyHex,
                kid: publicKey?.publicKeyHex,
              },
              dm,
            )

            debug('Encrypted:', body)
          } catch (e) {}

          debug('Sending to %s', service.serviceEndpoint)
          const res = await fetch(service.serviceEndpoint, {
            method: 'POST',
            body,
          })
          debug('Status', res.status, res.statusText)

          if (res.status == 200) {
            return core.handleMessage({ raw: data.jwt, metaData: [{ type: 'DIDComm-sent' }] })
          }

          return res.status == 200
        } catch (e) {
          return Promise.reject(e)
        }
      } else {
        debug('No Messaging service in didDoc')
        return super.handleAction(action, core)
      }
    }
    return super.handleAction(action, core)
  }
}
