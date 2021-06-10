import 'cross-fetch/polyfill'
import {
  IAgentContext,
  IResolver,
  IMessage,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IPluginMethodMap,
  IAgentPlugin,
  Agent,
} from '@veramo/core'
import {
  createAnonDecrypter,
  createAnonEncrypter,
  createAuthDecrypter,
  createAuthEncrypter,
  x25519Decrypter
} from 'did-jwt'
import { schema } from './'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'

const debug = Debug('veramo:did-comm:action-handler')

/**
 * Input arguments for {@link IDIDComm.sendMessageDIDCommAlpha1}
 * @beta
 */
export interface ISendMessageDIDCommAlpha1Args {
  url?: string
  save?: boolean
  data: {
    id?: string
    from: string
    to: string
    type: string
    body: object | string
  }
  headers?: Record<string, string>
}

// interface types

export interface IDIDCommMessage {
  type: string
  from?: string
  to: string
  thread_id?: string
  id: string
  expired_time?: string
  created_time?: string
  next?: string
  from_prior?: string
  body: any
}

export enum IDIDCommMessageMediaType {
  DIDCOMM_PLAIN = 'application/didcomm-plain+json',
  DIDCOMM_JWS = 'application/didcomm-jws+json',
  DIDCOMM_JWE = 'application/didcomm-encrypted+json'
}

export interface IDIDCommMessagePackingType {
  authenticated: 'jws' | 'authcrypt' | 'none'
  encrypted: 'anoncrypt' | 'authcrypt' | 'none'
}

export interface IDIDCommMessageMetaData {
  packing: IDIDCommMessagePackingType
  // from_prior, reuse transport etc.
}

export interface IUnpackedDIDCommMessage {
  metaData: IDIDCommMessageMetaData
  message: IDIDCommMessage
}

export interface IPackedDIDCommMessage {
  message: string
}

// interface arguments
export interface IUnpackDIDCommMessageArgs {
  mediaType: IDIDCommMessageMediaType
  message: string
}

export interface IPackDIDCommMessageArgs {
  packing: IDIDCommMessagePackingType
  message: IDIDCommMessage  
}

export interface IGetDIDCommMessageMediaTypeArgs {
  message: string
}

export interface ICreateDIDCommMessageArgs {

}

export interface IDIDCommTransport {
  id: string
  // FIXME: TODO: other potential stuff

  // sendRawMessage(args: xyz, context: xyz)
}

export interface ISendDIDCommMessageArgs {
  packedMessage: IPackedDIDCommMessage  
  returnTransport?: IDIDCommTransport
  recipientDID: string
}

export interface ISendDIDCommMessageResult {  
  sent?: boolean
  error?: string
}

/**
 * DID Comm plugin interface for {@link @veramo/core#Agent}
 * @beta
 */
export interface IDIDComm extends IPluginMethodMap {

  createDIDCommMessage(args: ICreateDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<IDIDCommMessage>

  unpackDIDCommMessage(args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<IUnpackedDIDCommMessage>

  getDIDCommMessageMediaType(args: IGetDIDCommMessageMediaTypeArgs) : Promise<IDIDCommMessageMediaType>

  packDIDCommMessage(args: IPackDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<IPackedDIDCommMessage>

  sendDIDCommMessage(args: ISendDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<ISendDIDCommMessageResult>
  
  /**
   * 
   * @deprecated TBD
   * 
   * This is used to create a message according to the initial {@link https://github.com/decentralized-identifier/DIDComm-js | DIDComm-js} implementation.
   *
   * @remarks Be advised that this spec is still not final and that this protocol may need to change.
   *
   * @param args - Arguments necessary for sending a DIDComm message
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   */
  sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IMessage>
}

/**
 * DID Comm plugin for {@link @veramo/core#Agent}
 *
 * This plugin provides a method of creating an encrypted message according to the initial {@link https://github.com/decentralized-identifier/DIDComm-js | DIDComm-js} implementation.
 *
 * @remarks Be advised that this spec is still not final and that this protocol may need to change.
 *
 * @beta
 */
export class DIDComm implements IAgentPlugin {
  /** Plugin methods */
  readonly methods: IDIDComm
  readonly schema = schema.IDIDComm

  constructor() {
    this.methods = {
      sendMessageDIDCommAlpha1: this.sendMessageDIDCommAlpha1,
      unpackDIDCommMessage: this.unpackDIDCommMessage,
      getDIDCommMessageMediaType: this.getDIDCommMessageMediaType,
      createDIDCommMessage: this.createDIDCommMessage,
      packDIDCommMessage: this.packDIDCommMessage,
      sendDIDCommMessage: this.sendDIDCommMessage
    }
  }

  async createDIDCommMessage(args: ICreateDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<IDIDCommMessage> {
    throw Error('FIXME: TODO: createDIDCommMessage not implemented yet')
  }

  async packDIDCommMessage(args: IPackDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<IPackedDIDCommMessage> {
    throw Error('FIXME: TODO: packDIDCommMessage not implemented yet')
  }

  async getDIDCommMessageMediaType(args: IGetDIDCommMessageMediaTypeArgs) : Promise<IDIDCommMessageMediaType> {
    // FIXME: TODO: implement this

    // if jwe.cty === didcomm/
    // if jws.cty === ...
    // if plain.cty === 

    return IDIDCommMessageMediaType.DIDCOMM_JWE
  }

  async unpackDIDCommMessageJWE(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>
  ): Promise<IUnpackedDIDCommMessage> {

    // 1. check whether kid is one of my DID URIs
    // 2. get internal IKey instance for kid
    // 2. if isAuthcrypted?
    //    resolve skid to DID
    // 
    // if decrypter is authcrypt then, decrypter.decrypt()

    throw Error('FIXME: TODO: unpackDIDCommMessageJWE not implemented yet')
  }

  async unpackDIDCommMessage(args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>)
    : Promise<IUnpackedDIDCommMessage> {

    if (args.mediaType === IDIDCommMessageMediaType.DIDCOMM_JWS) {
      throw Error('FIXME: TODO: unpacking JWS is not supported yet')
    } else if (args.mediaType === IDIDCommMessageMediaType.DIDCOMM_PLAIN) {
      throw Error('FIXME: TODO: unpacking plain message is not supported yet')
    } else if (args.mediaType === IDIDCommMessageMediaType.DIDCOMM_JWE) {
      return this.unpackDIDCommMessageJWE(args, context)
    } else {
      throw Error('not_supported: ' + args.mediaType)
    }
  }

  async sendDIDCommMessage(args: ISendDIDCommMessageArgs, 
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>) : Promise<ISendDIDCommMessageResult> {

      const { packedMessage, returnTransport, recipientDID } = args
      // let transport: IDIDCommTransport
      if (returnTransport) {
        // FIXME: TODO: transport handling
        // check if previous message was ok with reusing transport?
        // if so, retrieve transport from transportmanager      
        // transport = this.transports.get(returnTransport.id)
      } else {
        // FIXME: TODO: get transport for recipientDID
        // resolve(recipientDID)
        // get service block
        // get transport for service block
      }

      // transport.sendRawMessage(...)

      throw Error('FIXME: TODO: sendDIDCommMessage not implemented yet')
  }

  /** {@inheritdoc IDIDComm.sendMessageDIDCommAlpha1} */
  async sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IMessage> {
    const { data, url, headers, save = true } = args

    debug('Resolving didDoc')
    const didDoc = (await context.agent.resolveDid({ didUrl: data.to })).didDocument
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
          const identifier = await context.agent.didManagerGet({ did: data.from })
          const key = identifier.keys.find((k) => k.type === 'Ed25519')
          if (!key) throw Error('No encryption key')
          const publicKey = didDoc?.publicKey?.find((item) => item.type == 'Ed25519VerificationKey2018')
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
          headers,
        })
        debug('Status', res.status, res.statusText)

        if (res.status == 200) {
          return await context.agent.handleMessage({
            raw: JSON.stringify(data),
            metaData: [{ type: 'DIDComm-sent' }],
            save,
          })
        }

        return Promise.reject(new Error('Message not sent'))
      } catch (e) {
        return Promise.reject(e)
      }
    } else {
      debug('No Messaging service in didDoc')
      return Promise.reject(new Error('No service endpoint'))
    }
  }
}
