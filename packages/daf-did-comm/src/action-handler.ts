import 'cross-fetch/polyfill'
import { IAgentContext, IResolveDid, Message, IIdentityManager, IKeyManager, IHandleMessage } from 'daf-core'
import uuid from 'uuid'
import Debug from 'debug'

const debug = Debug('daf:did-comm:action-handler')

export interface IArgs {
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

type TContext = IAgentContext<IIdentityManager & IKeyManager & IResolveDid & IHandleMessage>

type TSendMessageDIDCommAlpha1 = (args: IArgs, context: TContext) => Promise<Message>

export interface ISendMessageDIDCommAlpha1 {
  sendMessageDIDCommAlpha1: TSendMessageDIDCommAlpha1
}

export const sendMessageDIDCommAlpha1: TSendMessageDIDCommAlpha1 = async (args, ctx) => {
  const { data, url, save = true } = args

  debug('Resolving didDoc')
  const didDoc = await ctx.agent.resolveDid({ didUrl: data.to })
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
        const identity = await ctx.agent.identityManagerGetIdentity({ did: data.from })
        const key = identity.keys.find(k => k.type === 'Ed25519')
        if (!key) throw Error('No encryption key')
        const publicKey = didDoc?.publicKey.find(item => item.type == 'Ed25519VerificationKey2018')
        if (!publicKey?.publicKeyHex) throw Error('Recipient does not have encryption publicKey')

        postPayload = await ctx.agent.keyManagerEncryptJWE({
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
        return await ctx.agent.handleMessage({ raw: data.body, metaData: [{ type: 'DIDComm-sent' }], save })
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
