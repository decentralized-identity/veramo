import 'cross-fetch/polyfill'
import { IAgent, Message, IAgentIdentityManager, IAgentHandleMessage, IAgentExtension } from 'daf-core'
import { IAgentResolve } from 'daf-resolver'
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

type ConfiguredAgent = IAgent & IAgentIdentityManager & IAgentResolve & IAgentHandleMessage
type TContext = {
  agent: ConfiguredAgent
}

type TSendMessageDIDCommAlpha1 = (args: IArgs, context: TContext) => Promise<Message>

export interface IAgentSendMessageDIDCommAlpha1 {
  sendMessageDIDCommAlpha1?: IAgentExtension<TSendMessageDIDCommAlpha1>
}

export const sendMessageDIDCommAlpha1: TSendMessageDIDCommAlpha1 = async (args, ctx) => {
  const { data, url, save = true } = args

  debug('Resolving didDoc')
  const didDoc = await ctx.agent.resolve({ did: data.to })
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
        const identity = await ctx.agent.getIdentity({ did: data.from })
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
