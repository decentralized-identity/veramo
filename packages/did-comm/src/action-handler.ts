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
  IIdentifier,
  TKeyType,
} from '@veramo/core'
import {
  createAnonDecrypter,
  createAuthDecrypter,
  Decrypter,
  decryptJWE,
  JWE,
  ECDH,
} from 'did-jwt'
import { DIDDocument, parse as parseDidUri, VerificationMethod } from 'did-resolver'
import { schema } from './'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'
import * as u8a from 'uint8arrays'
import { convertPublicKeyToX25519 } from '@stablelib/ed25519'

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
  DIDCOMM_JWE = 'application/didcomm-encrypted+json',
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

export interface ICreateDIDCommMessageArgs {}

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
  createDIDCommMessage(
    args: ICreateDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IDIDCommMessage>

  unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IUnpackedDIDCommMessage>

  getDIDCommMessageMediaType(args: IGetDIDCommMessageMediaTypeArgs): Promise<IDIDCommMessageMediaType>

  packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IPackedDIDCommMessage>

  sendDIDCommMessage(
    args: ISendDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<ISendDIDCommMessageResult>

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
      sendMessageDIDCommAlpha1: this.sendMessageDIDCommAlpha1.bind(this),
      unpackDIDCommMessage: this.unpackDIDCommMessage.bind(this),
      getDIDCommMessageMediaType: this.getDIDCommMessageMediaType.bind(this),
      createDIDCommMessage: this.createDIDCommMessage.bind(this),
      packDIDCommMessage: this.packDIDCommMessage.bind(this),
      sendDIDCommMessage: this.sendDIDCommMessage.bind(this),
    }
  }

  async createDIDCommMessage(
    args: ICreateDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IDIDCommMessage> {
    throw Error('FIXME: TODO: createDIDCommMessage not implemented yet')
  }

  async packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IPackedDIDCommMessage> {
    throw Error('FIXME: TODO: packDIDCommMessage not implemented yet')
  }

  async getDIDCommMessageMediaType(args: IGetDIDCommMessageMediaTypeArgs): Promise<IDIDCommMessageMediaType> {
    // FIXME: TODO: implement this

    // if jwe.cty === didcomm/
    // if jws.cty === ...
    // if plain.cty ===

    return IDIDCommMessageMediaType.DIDCOMM_JWE
  }

  async unpackDIDCommMessageJWE(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IUnpackedDIDCommMessage> {
    const jwe: JWE = JSON.parse(args.message)

    // 0 resolve skid to DID doc
    //   - find skid in DID doc and convert to 'X25519' byte array (if type matches)
    let senderKeyBytes: Uint8Array | null = await this.extractSenderKey(jwe, context)

    // 1. check whether kid is one of my DID URIs
    //   - get recipient DID URIs
    //   - extract DIDs from recipient DID URIs
    //   - match DIDs against locally managed DIDs
    let managedRecipients = await this.extractManagedRecipients(jwe, context)

    // 2. get internal IKey instance for each recipient.kid
    //   - resolve locally managed DIDs that match recipients
    //   - filter to the keyAgreementKeys that match the recipient.kid
    //   - match identifier.keys.publicKeyHex to (verificationMethod.publicKey*)
    //   - return a list of `IKey`
    const localKeys = await this.mapRecipientsToLocalKeys(managedRecipients, context)

    // 3. for each recipient
    //  if isAuthcrypted? (if senderKey != null)
    //   - construct auth decrypter
    //  else
    //   - construct anon decrypter
    // 4. decryptJWE(jwe, decrypter)
    for (const localKey of localKeys) {
      let decrypter: Decrypter
      const recipientECDH: ECDH = this.createRecipientECDH(localKey.localKeyRef, context)
      // TODO: here's where more algorithms should be supported
      if (senderKeyBytes && localKey.recipient?.header?.alg?.contains('ECDH-1PU')) {
        decrypter = createAuthDecrypter(recipientECDH, senderKeyBytes)
      } else {
        decrypter = createAnonDecrypter(recipientECDH)
      }
      try {
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const decryptedMsg = u8a.toString(decryptedBytes, 'utf-8')
        return JSON.parse(decryptedMsg) as IUnpackedDIDCommMessage
      } catch (e) {
        debug(
          `unable to decrypt DIDComm msg using ${localKey.localKeyRef} (${localKey.recipient.header.kid})`,
        )
      }
    }

    throw new Error('unable to decrypt DIDComm message with any of the locally managed keys')
  }

  private createRecipientECDH(secretKeyRef: string, context: IAgentContext<IKeyManager>): ECDH {
    return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
      if (theirPublicKey.length !== 32) {
        throw new Error('invalid_argument: incorrect publicKey key length for X25519')
      }
      const publicKey = { type: <TKeyType>'X25519', publicKeyHex: u8a.toString(theirPublicKey, 'base16') }
      const shared = await context.agent.keyManagerSharedSecret({ secretKeyRef, publicKey })
      return u8a.fromString(shared, 'base16')
    }
  }

  private async extractSenderKey(jwe: JWE, context: IAgentContext<IResolver>): Promise<Uint8Array | null> {
    let senderKey: Uint8Array | null = null
    const sender = JSON.parse(jwe.protected)
    if (typeof sender.skid === 'string') {
      const senderDIDResult = await context.agent.resolveDid({ didUrl: `${sender.skid};cache` })
      const err = senderDIDResult.didResolutionMetadata.error
      const msg = senderDIDResult.didResolutionMetadata.message
      const senderDoc = senderDIDResult.didDocument
      if (!senderDoc || err) {
        throw new Error(`not_found: skid was provided but could not be resolved: ${err} ${msg}`)
      }
      const sKey = (await context.agent.resolveDidFragment({
        didDocument: senderDoc,
        didURI: sender.skid,
        section: 'keyAgreement',
      })) as VerificationMethod
      if (!['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019', 'Ed25519', 'X25519'].includes(sKey.type)) {
        throw new Error(`not_supported: sender key of type ${sKey.type} is not supported`)
      }
      let publicKeyHex = this.convertToPublicKeyHex(sKey)
      senderKey = u8a.fromString(publicKeyHex, 'base16')
      if (['Ed25519VerificationKey2018', 'Ed25519'].includes(sKey.type)) {
        senderKey = convertPublicKeyToX25519(senderKey)
      }
    }
    return senderKey
  }

  private async extractManagedRecipients(
    jwe: JWE,
    context: IAgentContext<IDIDManager>,
  ): Promise<{ recipient: any; kid: string; identifier: IIdentifier }[]> {
    const kids: string[] = (jwe.recipients || [])
      .map((recipient) => recipient?.header?.kid)
      .filter((kid) => typeof kid !== 'undefined') as string[]

    const parsedDIDs = (jwe.recipients || [])
      .map((recipient) => {
        const kid = recipient?.header?.kid
        return { recipient, kid, did: parseDidUri(kid || '')?.did as string }
      })
      .filter(({ recipient, kid, did }) => isDefined(did))

    let managedRecipients = (
      await Promise.all(
        parsedDIDs.map(async ({ recipient, kid, did }) => {
          try {
            const identifier = await context.agent.didManagerGet({ did: <string>did })
            return { recipient, kid, identifier }
          } catch (e) {
            // identifier not found, skip it
            return null
          }
        }),
      )
    ).filter(isDefined)
    return managedRecipients as {
      recipient: any
      kid: string
      identifier: IIdentifier
    }[]
  }

  private async mapRecipientsToLocalKeys(
    managedKeys: { recipient: any; kid: string; identifier: IIdentifier }[],
    context: IAgentContext<IResolver>,
  ) {
    const potentialKeys = await Promise.all(
      managedKeys.map(async ({ recipient, kid, identifier }) => {
        let keyAgreementKey: ExtendedVerificationMethod
        const didDocument = (await context.agent.resolveDid({ didUrl: `${identifier.did};cache` }))
          ?.didDocument
        if (!didDocument) {
          return null
        }
        try {
          keyAgreementKey = (await context.agent.resolveDidFragment({
            didDocument,
            didURI: kid,
            section: 'keyAgreement',
          })) as VerificationMethod
        } catch (e) {
          return null
        }
        const publicKeyHex = this.convertToPublicKeyHex(keyAgreementKey)
        const localKey = identifier.keys.find((key) => {
          key.publicKeyHex === publicKeyHex
        })
        if (localKey) {
          return { localKeyRef: localKey.kid, recipient }
        } else {
          return null
        }
      }),
    )
    const localKeys = potentialKeys.filter((key) => typeof key !== 'undefined') as {
      localKeyRef: string
      recipient: any
    }[]
    return localKeys
  }

  private convertToPublicKeyHex(pk: ExtendedVerificationMethod): string {
    let keyBytes: Uint8Array
    if (pk.publicKeyHex) {
      keyBytes = u8a.fromString(pk.publicKeyHex, 'base16')
    } else if (pk.publicKeyBase58) {
      keyBytes = u8a.fromString(pk.publicKeyBase58, 'base58btc')
    } else if (pk.publicKeyBase64) {
      keyBytes = u8a.fromString(pk.publicKeyBase64, 'base64pad')
    } else return ''
    return u8a.toString(keyBytes, 'base16')
  }

  async unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IUnpackedDIDCommMessage> {
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

  async sendDIDCommMessage(
    args: ISendDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<ISendDIDCommMessageResult> {
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

interface ExtendedVerificationMethod extends VerificationMethod {
  publicKeyBase64?: string
}

function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return typeof arg !== 'undefined'
}
