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
  IKey,
  KeyMetadata,
  DIDDocumentSection,
} from '@veramo/core'
import {
  createAnonDecrypter,
  createAuthDecrypter,
  Decrypter,
  decryptJWE,
  JWE,
  ECDH,
  createAnonEncrypter,
  createJWE,
  createAuthEncrypter,
  Encrypter,
  JWTHeader,
  verifyJWS,
} from 'did-jwt'
import { DIDDocument, parse as parseDidUri, VerificationMethod } from 'did-resolver'
import { schema } from './'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'
import * as u8a from 'uint8arrays'
import { convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'

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

export interface IDIDCommPlainMessage extends IDIDCommMessage {
  typ: 'application/didcomm-plain+json'
}

export interface IDIDCommJWEMessage extends IDIDCommMessage {
  protected: string
}

export interface FlattenedJWS {
  payload: string
  protected?: string
  header?: Record<string, any>
  signature: string
}

export interface GenericJWS {
  payload: string
  signatures: [{ protected?: string; header?: Record<string, any>; signature: string }]
}

export type IDIDCommJWSMessage = FlattenedJWS | GenericJWS

export enum IDIDCommMessageMediaType {
  DIDCOMM_PLAIN = 'application/didcomm-plain+json',
  DIDCOMM_JWS = 'application/didcomm-signed+json',
  DIDCOMM_JWE = 'application/didcomm-encrypted+json',
}

export type IDIDCommMessagePackingType = 'authcrypt' | 'anoncrypt' | 'jws' | 'none'

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
  message: string
}

export interface IPackDIDCommMessageArgs {
  packing: IDIDCommMessagePackingType
  message: IDIDCommMessage
  keyRef?: string
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
  getDIDCommMessageMediaType({ message }: { message: string }): Promise<IDIDCommMessageMediaType | null>
  unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IUnpackedDIDCommMessage>

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
      getDIDCommMessageMediaType: this.getDidCommMessageMediaType.bind(this),
      unpackDIDCommMessage: this.unpackDIDCommMessage.bind(this),
      packDIDCommMessage: this.packDIDCommMessage.bind(this),
      sendDIDCommMessage: this.sendDIDCommMessage.bind(this),
    }
  }

  async packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IPackedDIDCommMessage> {
    switch (args.packing) {
      case 'authcrypt': // intentionally omitting break
      case 'anoncrypt':
        return this.packDIDCommMessageJWE(args, context)
      case 'none':
        const message = {
          ...args.message,
          typ: IDIDCommMessageMediaType.DIDCOMM_PLAIN,
        }
        return { message: JSON.stringify(message) }
      case 'jws':
        return this.packDIDCommMessageJWS(args, context)
      default:
        throw new Error(`not_implemented: packing messages as ${args.packing} is not supported yet`)
    }
  }

  async packDIDCommMessageJWS(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IPackedDIDCommMessage> {
    const message = args.message
    let keyRef: string | undefined = args.keyRef
    let kid: string
    // check that the message has from field that is managed
    let managedSender: IIdentifier | undefined
    try {
      managedSender = await context.agent.didManagerGet({ did: message.from || '' })
    } catch (e) {
      debug(`message.from(${message.from}) is not managed by this agent`)
    }
    if (!message.from || !isDefined(managedSender)) {
      throw new Error('invalid_argument: `from` field must be a DID managed by this agent')
    }

    // obtain sender signing key(s) from authentication section
    const senderKeys = await this.mapIdentifierKeysToDoc(managedSender, 'authentication', context)
    // try to find a managed signing key that matches keyRef
    let signingKey = null
    if (isDefined(keyRef)) {
      signingKey = senderKeys.find((key) => key.kid === keyRef || key.meta.verificationMethod.id === keyRef)
    }
    // otherwise use the first available one.
    signingKey = signingKey ? signingKey : senderKeys[0]

    if (!signingKey) {
      throw new Error(`key_not_found: could not locate a suitable signing key for ${message.from}`)
    } else {
      kid = signingKey.meta.verificationMethod.id
    }
    let alg: string
    if (signingKey.type === 'Ed25519') {
      alg = 'EdDSA'
    } else if (signingKey.type === 'Secp256k1') {
      alg = 'ES256K'
    } else {
      throw new Error(
        `not_supported: key of type ${signingKey.type} is not supported for JWS didcomm message`,
      )
    }
    // construct the protected header with alg, typ and kid
    const headerObj = { alg, kid, typ: IDIDCommMessageMediaType.DIDCOMM_JWS }
    const header = u8a.toString(u8a.fromString(JSON.stringify(headerObj), 'utf-8'), 'base64url')
    const payload = u8a.toString(u8a.fromString(JSON.stringify(args.message), 'utf-8'), 'base64url')
    // construct signing input and obtain signature
    const signingInput = header + '.' + payload
    const signature: string = await context.agent.keyManagerSign({
      data: signingInput,
      encoding: 'utf-8',
      keyRef: signingKey.kid,
      algorithm: alg,
    })
    // create flattened JWS
    const packedMessage = {
      protected: header,
      payload,
      signature,
    }
    // serialize flattened JWS JSON and return
    return { message: JSON.stringify(packedMessage) }
  }

  async packDIDCommMessageJWE(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IPackedDIDCommMessage> {
    // 1. check if args.packing requires authentication and map sender key to skid
    let senderECDH: ECDH | null = null
    let keyRef: string | undefined = args.keyRef
    let protectedHeader: {
      skid?: string
      typ: string
    } = {
      typ: IDIDCommMessageMediaType.DIDCOMM_JWE,
    }
    if (args.packing === 'authcrypt') {
      // TODO: what to do about from_prior?
      if (!args?.message?.from) {
        throw new Error(
          `invalid_argument: cannot create authenticated did-comm message without a 'from' field`,
        )
      }
      //    1.1 check that args.message.from is a managed DID
      const sender: IIdentifier = await context.agent.didManagerGet({ did: args?.message?.from })
      //    1.2 match key agreement keys from DID to managed keys
      const senderKeys: ExtendedIKey[] = await this.mapIdentifierKeysToDoc(sender, 'keyAgreement', context)
      // try to find a sender key by keyRef, otherwise pick the first one
      let senderKey
      if (isDefined(keyRef)) {
        senderKey = senderKeys.find((key) => key.kid === keyRef || key.meta.verificationMethod.id === keyRef)
      }
      senderKey = senderKey || senderKeys[0]
      //    1.3 use kid from DID doc(skid) + local IKey to bundle a sender key
      if (senderKey) {
        senderECDH = this.createEcdhWrapper(senderKey.kid, context)
        protectedHeader = { ...protectedHeader, skid: senderKey.meta.verificationMethod.id }
      } else {
        throw new Error(`key_not_found: could not map an agent key to an skid for ${args?.message?.from}`)
      }
    }

    // 2. resolve DID for args.message.to
    const didDocument: DIDDocument = await this.resolveDidOrThrow(args?.message?.to, context)

    // 2.1 extract all recipient key agreement keys and normalize them
    const keyAgreementKeys: NormalizedVerificationMethod[] = await this.dereferenceDidKeys(
      didDocument,
      'keyAgreement',
      context,
    )

    // 1.2 get public key bytes and key IDs for supported recipient keys
    const recipients: { kid: string; publicKeyBytes: Uint8Array }[] = keyAgreementKeys
      .map((pk) => {
        const publicKeyHex = pk.publicKeyHex!
        let publicKeyBytes = u8a.fromString(publicKeyHex, 'base16')
        if (['Ed25519VerificationKey2018', 'Ed25519'].includes(pk.type)) {
          publicKeyBytes = convertPublicKeyToX25519(publicKeyBytes)
        } else if (!['X25519KeyAgreementKey2019', 'X25519'].includes(pk.type)) {
          // other key agreement keys not supported
          return null
        }
        const kid = pk.id
        return { kid, publicKeyBytes }
      })
      .filter(isDefined)

    // 3. create Encrypter for each recipient
    const encrypters: Encrypter[] = recipients.map((recipient) => {
      if (args.packing === 'authcrypt') {
        return createAuthEncrypter(recipient.publicKeyBytes, <ECDH>senderECDH, { kid: recipient.kid })
      } else {
        return createAnonEncrypter(recipient.publicKeyBytes, { kid: recipient.kid })
      }
    })

    // 4. createJWE
    const messageBytes = u8a.fromString(JSON.stringify(args.message), 'utf-8')
    const jwe = await createJWE(messageBytes, encrypters, protectedHeader)
    const message = JSON.stringify(jwe)
    return { message }
  }

  async getDidCommMessageMediaType({
    message,
  }: {
    message: string
  }): Promise<IDIDCommMessageMediaType | null> {
    try {
      const { mediaType } = this.decodeMessageAndMediaType(message)
      return mediaType
    } catch (e) {
      return null
    }
  }

  async unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IUnpackedDIDCommMessage> {
    const { msgObj, mediaType } = this.decodeMessageAndMediaType(args.message)
    if (mediaType === IDIDCommMessageMediaType.DIDCOMM_JWS) {
      return this.unpackDIDCommMessageJWS(msgObj as IDIDCommJWSMessage, context)
    } else if (mediaType === IDIDCommMessageMediaType.DIDCOMM_PLAIN) {
      return { message: <IDIDCommMessage>msgObj, metaData: { packing: 'none' } }
    } else if (mediaType === IDIDCommMessageMediaType.DIDCOMM_JWE) {
      return this.unpackDIDCommMessageJWE({ jwe: msgObj as JWE }, context)
    } else {
      throw Error('not_supported: ' + mediaType)
    }
  }

  async unpackDIDCommMessageJWS(
    jws: IDIDCommJWSMessage,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IUnpackedDIDCommMessage> {
    // TODO: currently only supporting one signature
    const signatureEncoded: string = isDefined((<FlattenedJWS>jws).signature)
      ? (<FlattenedJWS>jws).signature
      : (<GenericJWS>jws).signatures[0]?.signature
    const headerEncoded = isDefined((<FlattenedJWS>jws).protected)
      ? (<FlattenedJWS>jws).protected
      : (<GenericJWS>jws).signatures[0]?.protected
    if (!isDefined(headerEncoded) || !isDefined(signatureEncoded)) {
      throw new Error('invalid_argument: could not interpret message as JWS')
    }
    const message = <IDIDCommMessage>(
      JSON.parse(u8a.toString(u8a.fromString(jws.payload, 'base64url'), 'utf8'))
    )
    const header = JSON.parse(u8a.toString(u8a.fromString(headerEncoded, 'base64url'), 'utf8'))
    const sender = parseDidUri(header.kid)?.did
    if (!isDefined(sender) || sender !== message.from) {
      throw new Error('invalid_jws: sender is not a DID or does not match the `kid`')
    }
    const senderDoc = await this.resolveDidOrThrow(sender, context)
    const senderKey = (await context.agent.resolveDidFragment({
      didDocument: senderDoc,
      didURI: header.kid,
      section: 'authentication',
    })) as VerificationMethod
    const verifiedSenderKey = verifyJWS(`${headerEncoded}.${jws.payload}.${signatureEncoded}`, senderKey)
    if (isDefined(verifiedSenderKey)) {
      return { message, metaData: { packing: 'jws' } }
    } else {
      throw new Error('invalid_jws: sender `kid` could not be validated as the signer of the message')
    }
  }

  async unpackDIDCommMessageJWE(
    { jwe }: { jwe: JWE },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IUnpackedDIDCommMessage> {
    // 0 resolve skid to DID doc
    //   - find skid in DID doc and convert to 'X25519' byte array (if type matches)
    let senderKeyBytes: Uint8Array | null = await this.extractSenderEncryptionKey(jwe, context)

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
    for (const localKey of localKeys) {
      let packing: string
      let decrypter: Decrypter
      const recipientECDH: ECDH = this.createEcdhWrapper(localKey.localKeyRef, context)
      // TODO: here's where more algorithms should be supported
      if (senderKeyBytes && localKey.recipient?.header?.alg?.includes('ECDH-1PU')) {
        decrypter = createAuthDecrypter(recipientECDH, senderKeyBytes)
        packing = 'authcrypt'
      } else {
        decrypter = createAnonDecrypter(recipientECDH)
        packing = 'anoncrypt'
      }
      // 4. decryptJWE(jwe, decrypter)
      try {
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const decryptedMsg = u8a.toString(decryptedBytes, 'utf-8')
        const message = JSON.parse(decryptedMsg)
        return { message, metaData: { packing } } as IUnpackedDIDCommMessage
      } catch (e) {
        debug(
          `unable to decrypt DIDComm msg using ${localKey.localKeyRef} (${localKey.recipient.header.kid})`,
        )
      }
    }

    throw new Error('unable to decrypt DIDComm message with any of the locally managed keys')
  }

  private decodeMessageAndMediaType(message: string): {
    msgObj: IDIDCommPlainMessage | JWE | IDIDCommJWSMessage
    mediaType: IDIDCommMessageMediaType
  } {
    let msgObj
    if (typeof message === 'string') {
      try {
        msgObj = JSON.parse(message)
      } catch (e) {
        throw new Error('invalid_argument: unable to parse message as JSON')
        // TODO: try to interpret as compact serialized JWS / JWM?
      }
    } else {
      msgObj = message
    }
    let mediaType: IDIDCommMessageMediaType | null = null
    if ((<IDIDCommPlainMessage>msgObj).typ === IDIDCommMessageMediaType.DIDCOMM_PLAIN) {
      mediaType = IDIDCommMessageMediaType.DIDCOMM_PLAIN
    } else if ((<FlattenedJWS | IDIDCommJWEMessage>msgObj).protected) {
      const protectedHeader = JSON.parse(u8a.toString(u8a.fromString(msgObj.protected, 'base64url'), 'utf-8'))
      if (protectedHeader.typ === IDIDCommMessageMediaType.DIDCOMM_JWS) {
        mediaType = IDIDCommMessageMediaType.DIDCOMM_JWS
      } else if (protectedHeader.typ === IDIDCommMessageMediaType.DIDCOMM_JWE) {
        mediaType = IDIDCommMessageMediaType.DIDCOMM_JWE
      } else {
        throw new Error('invalid_argument: unable to determine message type')
      }
    } else if ((<GenericJWS>msgObj).signatures) {
      mediaType = IDIDCommMessageMediaType.DIDCOMM_JWS
    } else {
      throw new Error('invalid_argument: unable to determine message type')
    }
    return { msgObj, mediaType }
  }

  private createEcdhWrapper(secretKeyRef: string, context: IAgentContext<IKeyManager>): ECDH {
    return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
      if (theirPublicKey.length !== 32) {
        throw new Error('invalid_argument: incorrect publicKey key length for X25519')
      }
      const publicKey = { type: <TKeyType>'X25519', publicKeyHex: u8a.toString(theirPublicKey, 'base16') }
      const shared = await context.agent.keyManagerSharedSecret({ secretKeyRef, publicKey })
      return u8a.fromString(shared, 'base16')
    }
  }

  private async extractSenderEncryptionKey(
    jwe: JWE,
    context: IAgentContext<IResolver>,
  ): Promise<Uint8Array | null> {
    let senderKey: Uint8Array | null = null
    const protectedHeader = JSON.parse(u8a.toString(u8a.fromString(jwe.protected, 'base64url'), 'utf-8'))
    if (typeof protectedHeader.skid === 'string') {
      const senderDoc = await this.resolveDidOrThrow(protectedHeader.skid, context)
      const sKey = (await context.agent.resolveDidFragment({
        didDocument: senderDoc,
        didURI: protectedHeader.skid,
        section: 'keyAgreement',
      })) as ExtendedVerificationMethod
      if (!['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019'].includes(sKey.type)) {
        throw new Error(`not_supported: sender key of type ${sKey.type} is not supported`)
      }
      let publicKeyHex = this.convertToPublicKeyHex(sKey, true)
      senderKey = u8a.fromString(publicKeyHex, 'base16')
    }
    return senderKey
  }

  private async extractManagedRecipients(
    jwe: JWE,
    context: IAgentContext<IDIDManager>,
  ): Promise<{ recipient: any; kid: string; identifier: IIdentifier }[]> {
    const parsedDIDs = (jwe.recipients || [])
      .map((recipient) => {
        const kid = recipient?.header?.kid
        const did = parseDidUri(kid || '')?.did as string
        if (kid && did) {
          return { recipient, kid, did }
        } else {
          return null
        }
      })
      .filter(isDefined)

    let managedRecipients = (
      await Promise.all(
        parsedDIDs.map(async ({ recipient, kid, did }) => {
          try {
            const identifier = await context.agent.didManagerGet({ did })
            return { recipient, kid, identifier }
          } catch (e) {
            // identifier not found, skip it
            return null
          }
        }),
      )
    ).filter(isDefined)
    return managedRecipients
  }

  private convertIdentifierEncryptionKeys(identifier: IIdentifier): IKey[] {
    return identifier.keys
      .map((key) => {
        if (key.type === 'Ed25519') {
          const publicBytes = u8a.fromString(key.publicKeyHex, 'base16')
          key.publicKeyHex = u8a.toString(convertPublicKeyToX25519(publicBytes), 'base16')
          if (key.privateKeyHex) {
            const privateBytes = u8a.fromString(key.privateKeyHex)
            key.privateKeyHex = u8a.toString(convertSecretKeyToX25519(privateBytes), 'base16')
          }
          key.type = 'X25519'
        } else if (key.type !== 'X25519') {
          debug(`key of type ${key.type} is not supported for [de]encryption`)
          return null
        }
        return key
      })
      .filter(isDefined)
  }

  private async mapRecipientsToLocalKeys(
    managedKeys: { recipient: any; kid: string; identifier: IIdentifier }[],
    context: IAgentContext<IResolver>,
  ): Promise<{ localKeyRef: string; recipient: any }[]> {
    const potentialKeys = await Promise.all(
      managedKeys.map(async ({ recipient, kid, identifier }) => {
        // TODO: use caching, since all recipients are supposed to belong to the same identifier
        const identifierKeys = await this.mapIdentifierKeysToDoc(identifier, 'keyAgreement', context)
        const localKey = identifierKeys.find((key) => key.meta.verificationMethod.id === kid)
        if (localKey) {
          return { localKeyRef: localKey.kid, recipient }
        } else {
          return null
        }
      }),
    )
    const localKeys = potentialKeys.filter(isDefined)
    return localKeys
  }

  private async mapIdentifierKeysToDoc(
    identifier: IIdentifier,
    section: DIDDocumentSection = 'keyAgreement',
    context: IAgentContext<IResolver>,
  ): Promise<ExtendedIKey[]> {
    const didDocument = await this.resolveDidOrThrow(identifier.did, context)

    // dereference all key agreement keys from DID document and normalize
    const keyAgreementKeys: NormalizedVerificationMethod[] = await this.dereferenceDidKeys(
      didDocument,
      section,
      context,
    )

    let localKeys = identifier.keys
    if (section === 'keyAgreement') {
      localKeys = this.convertIdentifierEncryptionKeys(identifier)
    }
    // finally map the didDocument keys to the identifier keys by comparing `publicKeyHex`
    const extendedKeys: ExtendedIKey[] = keyAgreementKeys
      .map((verificationMethod) => {
        const localKey = localKeys.find(
          (localKey) => localKey.publicKeyHex === verificationMethod.publicKeyHex,
        )
        if (localKey) {
          const { meta, ...localProps } = localKey
          return { ...localProps, meta: { ...meta, verificationMethod } }
        } else {
          return null
        }
      })
      .filter(isDefined)

    return extendedKeys
  }

  private async resolveDidOrThrow(didURI: string, context: IAgentContext<IResolver>) {
    // TODO: add caching
    const docResult = await context.agent.resolveDid({ didUrl: didURI })
    const err = docResult.didResolutionMetadata.error
    const msg = docResult.didResolutionMetadata.message
    const didDocument = docResult.didDocument
    if (!isDefined(didDocument) || err) {
      throw new Error(`not_found: could not resolve DID document for '${didURI}': ${err} ${msg}`)
    }
    return didDocument
  }

  /**
   * Dereferences key agreement keys from DID document and normalizes them for easy comparison.
   *
   * When dereferencing keyAgreement keys, only Ed25519 and X25519 curves are supported.
   * Other key types are omitted from the result and Ed25519 keys are converted to X25519
   *
   * @returns Promise<NormalizedVerificationMethod[]>
   */
  private async dereferenceDidKeys(
    didDocument: DIDDocument,
    section: DIDDocumentSection = 'keyAgreement',
    context: IAgentContext<IResolver>,
  ): Promise<NormalizedVerificationMethod[]> {
    const convert = section === 'keyAgreement'
    if (section === 'service') {
      return []
    }
    return (
      await Promise.all(
        (didDocument[section] || []).map(async (key: string | VerificationMethod) => {
          if (typeof key === 'string') {
            try {
              return (await context.agent.resolveDidFragment({
                didDocument,
                didURI: key,
                section,
              })) as ExtendedVerificationMethod
            } catch (e) {
              return null
            }
          } else {
            return key as ExtendedVerificationMethod
          }
        }),
      )
    )
      .filter(isDefined)
      .map((key) => {
        const hexKey = this.convertToPublicKeyHex(key, convert)
        const { publicKeyHex, publicKeyBase58, publicKeyBase64, publicKeyJwk, ...keyProps } = key
        return { ...keyProps, publicKeyHex: hexKey }
      })
      .filter((key) => key.publicKeyHex.length > 0)
  }

  private convertToPublicKeyHex(pk: ExtendedVerificationMethod, convert: boolean): string {
    let keyBytes: Uint8Array
    if (pk.publicKeyHex) {
      keyBytes = u8a.fromString(pk.publicKeyHex, 'base16')
    } else if (pk.publicKeyBase58) {
      keyBytes = u8a.fromString(pk.publicKeyBase58, 'base58btc')
    } else if (pk.publicKeyBase64) {
      keyBytes = u8a.fromString(pk.publicKeyBase64, 'base64pad')
    } else return ''
    if (convert) {
      if (['Ed25519', 'Ed25519VerificationKey2018'].includes(pk.type)) {
        keyBytes = convertPublicKeyToX25519(keyBytes)
      } else if (!['X25519', 'X25519KeyAgreementKey2019'].includes(pk.type)) {
        return ''
      }
    }
    return u8a.toString(keyBytes, 'base16')
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
      // if so, retrieve transport from transport manager
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

/**
 * represents an IKey that has been augmented with its corresponding entry from a DID document
 *
 * this is only used internally
 */
interface ExtendedIKey extends IKey {
  meta: KeyMetadata & {
    verificationMethod: NormalizedVerificationMethod
  }
}

/**
 * represents a VerificationMethod whose public key material has been converted to publicKeyHex
 */
type NormalizedVerificationMethod = Omit<
  VerificationMethod,
  'publicKeyBase58' | 'publicKeyBase64' | 'publicKeyJwk'
>

function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return typeof arg !== 'undefined'
}
