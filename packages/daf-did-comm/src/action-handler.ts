import 'cross-fetch/polyfill'
import {
  IAgentContext,
  IResolveDid,
  IMessage,
  IIdentityManager,
  IKeyManager,
  IHandleMessage,
  IPluginMethodMap,
  IAgentPlugin,
} from 'daf-core'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'

const debug = Debug('daf:did-comm:action-handler')

export interface ISendMessageDIDCommAlpha1Args {
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

export interface IDIDComm extends IPluginMethodMap {
  sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IIdentityManager & IKeyManager & IResolveDid & IHandleMessage>,
  ): Promise<IMessage>
}

export class DIDComm implements IAgentPlugin {
  readonly methods: IDIDComm

  constructor() {
    this.methods = {
      sendMessageDIDCommAlpha1: this.sendMessageDIDCommAlpha1,
    }
  }

  async sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IIdentityManager & IKeyManager & IResolveDid & IHandleMessage>,
  ): Promise<IMessage> {
    const { data, url, save = true } = args

    debug('Resolving didDoc')
    const didDoc = await context.agent.resolveDid({ didUrl: data.to })
    let serviceEndpoint
    if (url) {
      serviceEndpoint = url
    } else {
      const service = didDoc && didDoc.service && didDoc.service.find((item) => item.type == 'Messaging')
      serviceEndpoint = service?.serviceEndpoint
    }

    if (serviceEndpoint) {
      try {
        data.id = data.id || uuidv4()
        let postPayload = JSON.stringify(data)
        try {
          const identity = await context.agent.identityManagerGetIdentity({ did: data.from })
          const key = identity.keys.find((k) => k.type === 'Ed25519')
          if (!key) throw Error('No encryption key')
          const publicKey = didDoc?.publicKey.find((item) => item.type == 'Ed25519VerificationKey2018')
          if (!publicKey?.publicKeyHex) throw Error('Recipient does not have encryption publicKey')

          postPayload = await context.agent.keyManagerEncryptJWE({
            kid: key.kid,
            to: {
              type: 'Ed25519',
              publicKeyHex: publicKey?.publicKeyHex,
              kid: publicKey?.publicKeyHex,
            },
            data: postPayload,
          })

          debug('Encrypted:', postPayload)
        } catch (e) {}

        debug('Sending to %s', serviceEndpoint)
        const res = await fetch(serviceEndpoint, {
          method: 'POST',
          body: postPayload,
        })
        debug('Status', res.status, res.statusText)

        if (res.status == 200) {
          return await context.agent.handleMessage({
            raw: data.body,
            metaData: [{ type: 'DIDComm-sent' }],
            save,
          })
        }

        return Promise.reject('Message not sent')
      } catch (e) {
        return Promise.reject(e)
      }
    } else {
      debug('No Messaging service in didDoc')
      return Promise.reject('No service endpoint')
    }
  }
}
