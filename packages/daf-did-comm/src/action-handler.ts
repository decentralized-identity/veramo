import 'cross-fetch/polyfill'
import { Agent, AbstractActionHandler, Action, Message } from 'daf-core'
import uuid from 'uuid'
import Debug from 'debug'

const debug = Debug('daf:did-comm:action-handler')

export const ActionTypes = {
  sendMessageDIDCommAlpha1: 'send.message.didcomm-alpha-1',
}

export interface ActionSendDIDComm extends Action {
  url?: string
  save?: boolean
  data: {
    id?: string
    from: string
    to: string
    type: string
    body: any
  }
}

export class DIDCommActionHandler extends AbstractActionHandler {
  constructor() {
    super()
  }

  public async handleAction(action: Action, agent: Agent) {
    if (action.type === ActionTypes.sendMessageDIDCommAlpha1) {
      const { data, url, save = true } = action as ActionSendDIDComm

      debug('Resolving didDoc')
      const didDoc = await agent.didResolver.resolve(data.to)
      let serviceEndpoint
      if (url) {
        serviceEndpoint = url
      } else {
        const service = didDoc && didDoc.service && didDoc.service.find(item => item.type == 'Messaging')
        serviceEndpoint = service?.serviceEndpoint
      }

      if (serviceEndpoint) {
        try {
          data.id = data.id || uuid.v4()
          let postPayload = JSON.stringify(data)
          try {
            const identity = await agent.identityManager.getIdentity(data.from)
            const key = await identity.keyByType('Ed25519')
            const publicKey = didDoc?.publicKey.find(item => item.type == 'Ed25519VerificationKey2018')
            if (!publicKey?.publicKeyHex) throw Error('Recipient does not have encryption publicKey')

            postPayload = await key.encrypt(
              {
                type: 'Ed25519',
                publicKeyHex: publicKey?.publicKeyHex,
                kid: publicKey?.publicKeyHex,
              },
              postPayload,
            )

            debug('Encrypted:', postPayload)
          } catch (e) {}

          debug('Sending to %s', serviceEndpoint)
          const res = await fetch(serviceEndpoint, {
            method: 'POST',
            body: postPayload,
          })
          debug('Status', res.status, res.statusText)

          if (res.status == 200) {
            return agent.handleMessage({ raw: data.body, metaData: [{ type: 'DIDComm-sent' }], save })
          }

          return res.status == 200
        } catch (e) {
          return Promise.reject(e)
        }
      } else {
        debug('No Messaging service in didDoc')
        return super.handleAction(action, agent)
      }
    }
    return super.handleAction(action, agent)
  }
}
