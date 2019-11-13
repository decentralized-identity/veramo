import { Core, AbstractActionHandler, Types } from 'daf-core'
import { DIDComm } from 'DIDComm-js'
import uuid from 'uuid'
import Debug from 'debug'

const debug = Debug('did-comm-action-handler')

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

      const service =
        didDoc &&
        didDoc.service &&
        didDoc.service.find(item => item.type == 'MessagingService')
      const publicKey =
        didDoc &&
        didDoc.publicKey &&
        didDoc.publicKey.find(
          item => item.type == 'Curve25519EncryptionPublicKey',
        )

      if (service) {
        try {
          let body = data.jwt
          if (
            publicKey &&
            publicKey.publicKeyHex &&
            core.encryptionKeyManager
          ) {
            await this.didcomm.ready
            const senderKeyPair = await core.encryptionKeyManager.getKeyPairForDid(
              data.from,
            )
            if (senderKeyPair) {
              const dm = JSON.stringify({
                '@type': 'JWT',
                id: uuid.v4(),
                data: data.jwt,
              })

              body = await this.didcomm.pack_auth_msg_for_recipients(
                dm,
                [Uint8Array.from(Buffer.from(publicKey.publicKeyHex, 'hex'))],
                senderKeyPair,
              )
            }
          }

          debug('Sending to %s', service.serviceEndpoint)
          const res = await fetch(service.serviceEndpoint, {
            method: 'POST',
            body,
          })
          debug('Status', res.status, res.statusText)

          if (res.status == 200) {
            await core.onRawMessage({ raw: data.jwt })
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
