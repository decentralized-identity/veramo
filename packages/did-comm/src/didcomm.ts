import type {
  IAgentContext,
  IAgentPlugin,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IMessage,
  IMessageHandler,
  IResolver,
} from '@veramo/core-types'
import {
  createJWE,
  type Decrypter,
  decryptJWE,
  type ECDH,
  type Encrypter,
  type JWE,
  verifyJWS,
} from 'did-jwt'
import {
  type DIDDocument,
  type DIDResolutionOptions,
  parse as parseDidUrl,
  type Service,
  type ServiceEndpoint,
  type VerificationMethod,
} from 'did-resolver'
import {
  a256cbcHs512AnonDecrypterX25519WithA256KW,
  a256cbcHs512AnonEncrypterX25519WithA256KW,
  a256cbcHs512AuthDecrypterX25519WithA256KW,
  a256cbcHs512AuthEncrypterX25519WithA256KW,
  a256gcmAnonDecrypterX25519WithA256KW,
  a256gcmAnonEncrypterX25519WithA256KW,
  a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW,
  a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW,
  xc20pAnonDecrypterX25519WithA256KW,
  xc20pAnonEncrypterX25519WithA256KW,
  xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW,
  xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW,
} from './encryption/a256kw-encrypters.js'

import {
  a256cbcHs512AnonDecrypterX25519WithXC20PKW,
  a256cbcHs512AnonEncrypterX25519WithXC20PKW,
  a256cbcHs512AuthDecrypterX25519WithXC20PKW,
  a256cbcHs512AuthEncrypterX25519WithXC20PKW,
  a256gcmAnonDecrypterX25519WithXC20PKW,
  a256gcmAnonEncrypterX25519WithXC20PKW,
  a256gcmAuthDecrypterEcdh1PuV3x25519WithXC20PKW,
  a256gcmAuthEncrypterEcdh1PuV3x25519WithXC20PKW,
  xc20pAnonDecrypterX25519WithXC20PKW,
  xc20pAnonEncrypterX25519WithXC20PKW,
  xc20pAuthDecrypterEcdh1PuV3x25519WithXC20PKW,
  xc20pAuthEncrypterEcdh1PuV3x25519WithXC20PKW,
} from './encryption/xc20pkw-encrypters.js'

import { schema } from './plugin.schema.js'

import { v4 as uuidv4 } from 'uuid'

import {
  createEcdhWrapper,
  extractManagedRecipients,
  extractSenderEncryptionKey,
  mapRecipientsToLocalKeys,
} from './utils.js'

import {
  _ExtendedIKey,
  _NormalizedVerificationMethod,
  asArray,
  bytesToUtf8String,
  decodeJoseBlob,
  dereferenceDidKeys,
  encodeJoseBlob,
  extractPublicKeyHex,
  hexToBytes,
  isDefined,
  mapIdentifierKeysToDoc,
  resolveDidOrThrow,
  stringToUtf8Bytes,
} from '@veramo/utils'

import Debug from 'debug'
import {
  IDIDComm,
  IPackDIDCommMessageArgs,
  ISendDIDCommMessageArgs,
  ISendDIDCommMessageResponse,
  IUnpackDIDCommMessageArgs,
} from './types/IDIDComm.js'
import { DIDCommHttpTransport, IDIDCommTransport } from './transports/transports.js'
import {
  DIDCommMessageMediaType,
  IDIDCommMessage,
  IPackedDIDCommMessage,
  IUnpackedDIDCommMessage,
} from './types/message-types.js'
import {
  _DIDCommEncryptedMessage,
  _DIDCommPlainMessage,
  _DIDCommSignedMessage,
  _FlattenedJWS,
  _GenericJWS,
} from './types/utility-types.js'

const debug = Debug('veramo:did-comm:action-handler')

/**
 * @deprecated Please use {@link IDIDComm.sendDIDCommMessage} instead. This will be removed in Veramo 4.0.
 * Input arguments for {@link IDIDComm.sendMessageDIDCommAlpha1}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
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

/**
 * The config for the {@link DIDComm} DIDComm plugin.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface DIDCommConfig<T extends IDIDCommTransport = DIDCommHttpTransport> {
  transports?: T[]
}

/**
 * DID Comm plugin for {@link @veramo/core#Agent}
 *
 * This plugin provides a method of creating an encrypted message according to the initial
 * {@link https://github.com/decentralized-identifier/DIDComm-js | DIDComm-js} implementation.
 *
 * @remarks Be advised that this spec is still not final and that this protocol may need to change.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DIDComm implements IAgentPlugin {
  readonly transports: IDIDCommTransport[]

  /** Plugin methods */
  readonly methods: IDIDComm
  readonly schema = schema.IDIDComm

  /**
   * Constructor that takes a list of {@link IDIDCommTransport} objects.
   * @param transports - A list of {@link IDIDCommTransport} objects. Defaults to
   *   {@link @veramo/did-comm#DIDCommHttpTransport | DIDCommHttpTransport}
   */
  constructor({ transports = [new DIDCommHttpTransport()] }: DIDCommConfig = {}) {
    this.transports = transports
    this.methods = {
      sendMessageDIDCommAlpha1: this.sendMessageDIDCommAlpha1.bind(this),
      getDIDCommMessageMediaType: this.getDidCommMessageMediaType.bind(this),
      unpackDIDCommMessage: this.unpackDIDCommMessage.bind(this),
      packDIDCommMessage: this.packDIDCommMessage.bind(this),
      sendDIDCommMessage: this.sendDIDCommMessage.bind(this),
    }
  }

  /** {@inheritdoc IDIDComm.packDIDCommMessage} */
  async packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IPackedDIDCommMessage> {
    switch (args.packing) {
      case 'authcrypt': // intentionally omitting break
      case 'anoncrypt':
        return this.packDIDCommMessageJWE(args, context)
      case 'none':
        const message = {
          ...args.message,
          typ: DIDCommMessageMediaType.PLAIN,
        }
        return { message: JSON.stringify(message) }
      case 'jws':
        return this.packDIDCommMessageJWS(args, context)
      default:
        throw new Error(`not_implemented: packing messages as ${args.packing} is not supported yet`)
    }
  }

  private async packDIDCommMessageJWS(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
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
    const senderKeys = await mapIdentifierKeysToDoc(
      managedSender,
      'authentication',
      context,
      args.resolutionOptions,
    )
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
    const headerObj = { alg, kid, typ: DIDCommMessageMediaType.SIGNED }
    const header = encodeJoseBlob(headerObj)
    const payload = encodeJoseBlob(args.message)
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

  private async packDIDCommMessageJWE(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IPackedDIDCommMessage> {
    // 1. check if args.packing requires authentication and map sender key to skid
    let senderECDH: ECDH | null = null
    let keyRef: string | undefined = args.keyRef
    let protectedHeader: {
      skid?: string
      typ: string
    } = {
      typ: DIDCommMessageMediaType.ENCRYPTED,
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
      const senderKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(
        sender,
        'keyAgreement',
        context,
        args.resolutionOptions,
      )
      // try to find a sender key by keyRef, otherwise pick the first one
      let senderKey
      if (isDefined(keyRef)) {
        senderKey = senderKeys.find((key) => key.kid === keyRef || key.meta.verificationMethod.id === keyRef)
      }
      senderKey = senderKey || senderKeys[0]
      //    1.3 use kid from DID doc(skid) + local IKey to bundle a sender key
      if (senderKey) {
        senderECDH = createEcdhWrapper(senderKey.kid, context)
        protectedHeader = { ...protectedHeader, skid: senderKey.meta.verificationMethod.id }
      } else {
        throw new Error(`key_not_found: could not map an agent key to an skid for ${args?.message?.from}`)
      }
    }

    const defaults = {
      alg: args.packing === 'authcrypt' ? 'ECDH-1PU+A256KW' : 'ECDH-ES+A256KW',
      enc: 'A256GCM', // 'XC20P' or 'A256CBC-HS512' can also be specified
    }

    const options = { ...defaults, ...args.options }

    // 2: compute recipients
    interface IRecipient {
      kid: string
      publicKeyBytes: Uint8Array
      keyType: string
    }

    let recipients: IRecipient[] = []

    async function computeRecipients(
      to: string,
      resolutionOptions?: DIDResolutionOptions,
    ): Promise<IRecipient[]> {
      // 2.1 resolve DID for "to"
      const didDocument: DIDDocument = await resolveDidOrThrow(to, context, resolutionOptions)

      // 2.2 extract all recipient key agreement keys and normalize them
      const keyAgreementKeys: _NormalizedVerificationMethod[] = (
        await dereferenceDidKeys(didDocument, 'keyAgreement', context)
      )
        .filter((k) => k.publicKeyHex?.length! > 0)
        .filter((k) => (args.options?.recipientKids ? args.options?.recipientKids.includes(k.id) : true))

      if (keyAgreementKeys.length === 0) {
        throw new Error(`key_not_found: no key agreement keys found for recipient ${to}`)
      }

      // 2.3 get public key bytes and key IDs for supported recipient keys
      const tempRecipients = keyAgreementKeys
        .map((pk) => {
          // FIXME: only supporting X25519 keys for now. Add support for P-256 and P-384 & others
          const { publicKeyHex, keyType } = extractPublicKeyHex(pk, true)
          if (keyType === 'X25519') {
            return { kid: pk.id, publicKeyBytes: hexToBytes(publicKeyHex), keyType: pk.type }
          } else {
            debug(`not_supported: key agreement key type ${pk.type} is not supported for encryption`)
            return null
          }
        })
        .filter(isDefined)

      if (tempRecipients.length === 0) {
        throw new Error(`not_supported: no compatible key agreement keys found for recipient ${to}`)
      }
      return tempRecipients
    }

    const recipientDIDs = asArray(args.message.to).concat(asArray(args.options?.bcc))
    for (const to of recipientDIDs) {
      recipients.push(...(await computeRecipients(to)))
    }

    // 3. create Encrypter for each recipient
    const encrypters: Encrypter[] = recipients
      .map((recipient) => {
        if (options.enc === 'A256GCM') {
          if (args.packing === 'authcrypt' && (!options.alg || options.alg?.startsWith('ECDH-1PU'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return a256gcmAuthEncrypterEcdh1PuV3x25519WithXC20PKW(
                recipient.publicKeyBytes,
                <ECDH>senderECDH,
                {
                  kid: recipient.kid,
                },
              )
            } else if (options?.alg?.endsWith('+A256KW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
                recipient.publicKeyBytes,
                <ECDH>senderECDH,
                {
                  kid: recipient.kid,
                },
              )
            }
          } else if (args.packing === 'anoncrypt' && (!options.alg || options.alg?.startsWith('ECDH-ES'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              return a256gcmAnonEncrypterX25519WithXC20PKW(recipient.publicKeyBytes, recipient.kid)
            } else if (options?.alg?.endsWith('+A256KW')) {
              return a256gcmAnonEncrypterX25519WithA256KW(recipient.publicKeyBytes, recipient.kid)
            }
          }
        } else if (options.enc === 'A256CBC-HS512') {
          if (args.packing === 'authcrypt' && (!options.alg || options.alg?.startsWith('ECDH-1PU'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return a256cbcHs512AuthEncrypterX25519WithXC20PKW(recipient.publicKeyBytes, <ECDH>senderECDH, {
                kid: recipient.kid,
              })
            } else if (options?.alg?.endsWith('+A256KW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return a256cbcHs512AuthEncrypterX25519WithA256KW(recipient.publicKeyBytes, <ECDH>senderECDH, {
                kid: recipient.kid,
              })
            }
          } else if (args.packing === 'anoncrypt' && (!options.alg || options.alg?.startsWith('ECDH-ES'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              return a256cbcHs512AnonEncrypterX25519WithXC20PKW(recipient.publicKeyBytes, recipient.kid)
            } else if (options?.alg?.endsWith('+A256KW')) {
              return a256cbcHs512AnonEncrypterX25519WithA256KW(recipient.publicKeyBytes, recipient.kid)
            }
          }
        } else if (options.enc === 'XC20P') {
          if (args.packing === 'authcrypt' && (!options.alg || options.alg?.startsWith('ECDH-1PU'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return xc20pAuthEncrypterEcdh1PuV3x25519WithXC20PKW(
                recipient.publicKeyBytes,
                <ECDH>senderECDH,
                { kid: recipient.kid },
              )
            } else if (options?.alg?.endsWith('+A256KW')) {
              // FIXME: the didcomm spec actually links to ECDH-1PU(v4)
              return xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(recipient.publicKeyBytes, <ECDH>senderECDH, {
                kid: recipient.kid,
              })
            }
          } else if (args.packing === 'anoncrypt' && (!options.alg || options.alg?.startsWith('ECDH-ES'))) {
            if (options.alg?.endsWith('+XC20PKW')) {
              return xc20pAnonEncrypterX25519WithXC20PKW(recipient.publicKeyBytes, recipient.kid)
            } else if (options?.alg?.endsWith('+A256KW')) {
              return xc20pAnonEncrypterX25519WithA256KW(recipient.publicKeyBytes, recipient.kid)
            }
          }
        }
        debug(
          `not_supported: could not create suitable ${args.packing} encrypter for recipient ${recipient.kid} with alg=${options.alg}, enc=${options.enc}`,
        )
        return null
      })
      .filter(isDefined)

    if (encrypters.length === 0) {
      throw new Error(
        `not_supported: could not create suitable ${args.packing} encrypter for recipient ${args?.message?.to} with alg=${options.alg}, enc=${options.enc}`,
      )
    }

    // 4. createJWE
    const messageBytes = stringToUtf8Bytes(JSON.stringify(args.message))
    const jwe = await createJWE(messageBytes, encrypters, protectedHeader, undefined, true)
    const message = JSON.stringify(jwe)
    return { message }
  }

  /** {@inheritdoc IDIDComm.getDIDCommMessageMediaType} */
  async getDidCommMessageMediaType({ message }: IPackedDIDCommMessage): Promise<DIDCommMessageMediaType> {
    try {
      const { mediaType } = this.decodeMessageAndMediaType(message)
      return mediaType
    } catch (e) {
      debug(`Could not parse message as DIDComm v2 message: ${e}`)
      throw e
    }
  }

  /** {@inheritdoc IDIDComm.unpackDIDCommMessage} */
  async unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IUnpackedDIDCommMessage> {
    const { msgObj, mediaType } = this.decodeMessageAndMediaType(args.message)
    if (mediaType === DIDCommMessageMediaType.SIGNED) {
      return this.unpackDIDCommMessageJWS(msgObj as _DIDCommSignedMessage, context, args.resolutionOptions)
    } else if (mediaType === DIDCommMessageMediaType.PLAIN) {
      return { message: <IDIDCommMessage>msgObj, metaData: { packing: 'none' } }
    } else if (mediaType === DIDCommMessageMediaType.ENCRYPTED) {
      return this.unpackDIDCommMessageJWE({ jwe: msgObj as JWE }, context, args.resolutionOptions)
    } else {
      throw Error('not_supported: ' + mediaType)
    }
  }

  private async unpackDIDCommMessageJWS(
    jws: _DIDCommSignedMessage,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
    resolutionOptions?: DIDResolutionOptions,
  ): Promise<IUnpackedDIDCommMessage> {
    // TODO: currently only supporting one signature
    const signatureEncoded: string = isDefined((<_FlattenedJWS>jws).signature)
      ? (<_FlattenedJWS>jws).signature
      : (<_GenericJWS>jws).signatures[0]?.signature
    const headerEncoded = isDefined((<_FlattenedJWS>jws).protected)
      ? (<_FlattenedJWS>jws).protected
      : (<_GenericJWS>jws).signatures[0]?.protected
    if (!isDefined(headerEncoded) || !isDefined(signatureEncoded)) {
      throw new Error('invalid_argument: could not interpret message as JWS')
    }
    const message = <IDIDCommMessage>decodeJoseBlob(jws.payload)
    const header = decodeJoseBlob(headerEncoded)
    const sender = parseDidUrl(header.kid)?.did
    if (!isDefined(sender) || sender !== message.from) {
      throw new Error('invalid_jws: sender is not a DID or does not match the `kid`')
    }
    const senderDoc = await resolveDidOrThrow(sender, context, resolutionOptions)
    const senderKey = (await context.agent.getDIDComponentById({
      didDocument: senderDoc,
      didUrl: header.kid,
      section: 'authentication',
    })) as VerificationMethod
    const verifiedSenderKey = verifyJWS(`${headerEncoded}.${jws.payload}.${signatureEncoded}`, senderKey)
    if (isDefined(verifiedSenderKey)) {
      return { message, metaData: { packing: 'jws' } }
    } else {
      throw new Error('invalid_jws: sender `kid` could not be validated as the signer of the message')
    }
  }

  private async unpackDIDCommMessageJWE(
    { jwe }: { jwe: JWE },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
    resolutionOptions?: DIDResolutionOptions,
  ): Promise<IUnpackedDIDCommMessage> {
    // 0 resolve skid to DID doc
    //   - find skid in DID doc and convert to 'X25519' byte array (if type matches)
    let senderKeyBytes: Uint8Array | null = await extractSenderEncryptionKey(jwe, context, resolutionOptions)

    // 1. check whether kid is one of my DID URIs
    //   - get recipient DID URIs
    //   - extract DIDs from recipient DID URIs
    //   - match DIDs against locally managed DIDs
    let managedRecipients = await extractManagedRecipients(jwe, context)

    // 1.5 distribute protected header to each recipient
    const protectedHeader = decodeJoseBlob(jwe.protected)
    managedRecipients = managedRecipients.map((mr) => {
      mr.recipient.header = { ...protectedHeader, ...mr.recipient.header }
      return mr
    })

    // 2. get internal IKey instance for each recipient.kid
    //   - resolve locally managed DIDs that match recipients
    //   - filter to the keyAgreementKeys that match the recipient.kid
    //   - match identifier.keys.publicKeyHex to (verificationMethod.publicKey*)
    //   - return a list of `IKey`
    const localKeys = await mapRecipientsToLocalKeys(managedRecipients, context, resolutionOptions)

    // 3. for each recipient
    //  if isAuthcrypted? (if senderKey != null)
    //   - construct auth decrypter
    //  else
    //   - construct anon decrypter
    for (const localKey of localKeys) {
      let packing: string = 'anoncrypt'
      let decrypter: Decrypter | null = null
      const recipientECDH: ECDH = createEcdhWrapper(localKey.localKeyRef, context)
      // TODO: here's where more algorithms should be supported
      if (localKey.recipient?.header?.epk?.crv === 'X25519') {
        if (localKey.recipient?.header?.enc === 'A256GCM') {
          if (senderKeyBytes && localKey.recipient?.header?.alg?.includes('ECDH-1PU')) {
            packing = 'authcrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(recipientECDH, senderKeyBytes)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = a256gcmAuthDecrypterEcdh1PuV3x25519WithXC20PKW(recipientECDH, senderKeyBytes)
            }
          } else {
            packing = 'anoncrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = a256gcmAnonDecrypterX25519WithA256KW(recipientECDH)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = a256gcmAnonDecrypterX25519WithXC20PKW(recipientECDH)
            }
          }
        } else if (localKey.recipient?.header?.enc === 'A256CBC-HS512') {
          if (senderKeyBytes && localKey.recipient?.header?.alg?.includes('ECDH-1PU')) {
            packing = 'authcrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = a256cbcHs512AuthDecrypterX25519WithA256KW(recipientECDH, senderKeyBytes)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = a256cbcHs512AuthDecrypterX25519WithXC20PKW(recipientECDH, senderKeyBytes)
            }
          } else {
            packing = 'anoncrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = a256cbcHs512AnonDecrypterX25519WithA256KW(recipientECDH)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = a256cbcHs512AnonDecrypterX25519WithXC20PKW(recipientECDH)
            }
          }
        } else if (localKey.recipient?.header?.enc === 'XC20P') {
          if (senderKeyBytes && localKey.recipient?.header?.alg?.includes('ECDH-1PU')) {
            packing = 'authcrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(recipientECDH, senderKeyBytes)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = xc20pAuthDecrypterEcdh1PuV3x25519WithXC20PKW(recipientECDH, senderKeyBytes)
            }
          } else {
            packing = 'anoncrypt'
            if (localKey.recipient?.header?.alg?.endsWith('+A256KW')) {
              decrypter = xc20pAnonDecrypterX25519WithA256KW(recipientECDH)
            } else if (localKey.recipient?.header?.alg?.endsWith('+XC20PKW')) {
              decrypter = xc20pAnonDecrypterX25519WithXC20PKW(recipientECDH)
            }
          }
        }
      }

      if (!decrypter) {
        throw new Error('unable to decrypt DIDComm message with any of the locally managed keys')
      }
      // 4. decryptJWE(jwe, decrypter)
      try {
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const decryptedMsg = bytesToUtf8String(decryptedBytes)
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
    msgObj: _DIDCommPlainMessage | _DIDCommSignedMessage | _DIDCommEncryptedMessage
    mediaType: DIDCommMessageMediaType
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
    let mediaType: DIDCommMessageMediaType | null = null
    if ((<_DIDCommPlainMessage>msgObj).typ === DIDCommMessageMediaType.PLAIN) {
      mediaType = DIDCommMessageMediaType.PLAIN
    } else if ((<_FlattenedJWS | _DIDCommEncryptedMessage>msgObj).protected) {
      const protectedHeader = decodeJoseBlob(msgObj.protected)
      if (protectedHeader.typ === DIDCommMessageMediaType.SIGNED) {
        mediaType = DIDCommMessageMediaType.SIGNED
      } else if (protectedHeader.typ === DIDCommMessageMediaType.ENCRYPTED) {
        mediaType = DIDCommMessageMediaType.ENCRYPTED
      } else {
        throw new Error('invalid_argument: unable to determine message type')
      }
    } else if ((<_GenericJWS>msgObj).signatures) {
      mediaType = DIDCommMessageMediaType.SIGNED
    } else {
      throw new Error('invalid_argument: unable to determine message type')
    }
    return { msgObj, mediaType }
  }

  private findPreferredDIDCommService(services: Service[]) {
    // FIXME: TODO: get preferred service endpoint according to configuration; now defaulting to first service
    return services[0]
  }

  private async wrapDIDCommForwardMessage(
    recipientDidUrl: string,
    messageId: string,
    packedMessageToForward: IPackedDIDCommMessage,
    routingKey: string,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IPackedDIDCommMessage> {
    const splitKey = routingKey.split('#')
    const shouldUseSpecificKid = splitKey.length > 1
    const mediatorDidUrl = splitKey[0]
    const msgJson = JSON.parse(packedMessageToForward.message)
    // 1. Create forward message
    const forwardMessage: IDIDCommMessage = {
      id: uuidv4(),
      type: 'https://didcomm.org/routing/2.0/forward',
      to: [mediatorDidUrl],
      body: {
        next: recipientDidUrl,
      },
      attachments: [
        {
          media_type: msgJson?.typ ?? DIDCommMessageMediaType.ENCRYPTED,
          data: {
            json: msgJson,
          },
        },
      ],
    }

    context.agent.emit('DIDCommV2Message-forwarded', {
      messageId,
      next: recipientDidUrl,
      routingKey: routingKey,
    })

    // 2. Pack message for routingKey with anoncrypt
    if (shouldUseSpecificKid) {
      return this.packDIDCommMessageJWE(
        { message: forwardMessage, packing: 'anoncrypt', options: { recipientKids: [routingKey] } },
        context,
      )
    } else {
      return this.packDIDCommMessageJWE({ message: forwardMessage, packing: 'anoncrypt' }, context)
    }
  }

  /** {@inheritdoc IDIDComm.sendDIDCommMessage} */
  async sendDIDCommMessage(
    args: ISendDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<ISendDIDCommMessageResponse> {
    const { packedMessage, returnTransportId, recipientDidUrl, messageId } = args

    if (returnTransportId) {
      // FIXME: TODO: check if previous message was ok with reusing transport?
      // if so, retrieve transport from transport manager
      //transport = this.findDIDCommTransport(returnTransportId)
      throw new Error(`not_supported: return routes not supported yet`)
    }

    const didDoc = await resolveDidOrThrow(recipientDidUrl, context, args.resolutionOptions)

    function processServiceObject(service: Service) {
      if (service.type === 'DIDCommMessaging') {
        return service
      } else if (service.t === 'dm') {
        return {
          type: 'DIDCommMessaging',
          serviceEndpoint: service.s,
          accept: service.a,
          routingKeys: service.r,
          id: `#dm+` + (service.id ?? service.s),
        } as Service
      }
    }

    // FIXME: only send the message if the service section either explicitly supports `didcomm/v2`, or no
    // `accept` property is present.

    const services = (didDoc.service || [])
      ?.map((service: any) => {
        if (Array.isArray(service)) {
          // This is a workaround for some malformed DID documents that bundle multiple service entries into an array
          return service.map((s) => {
            if (typeof s === 'object') {
              return processServiceObject(s)
            }
          })
        } else {
          return processServiceObject(service)
        }
      })
      .flat()
      .filter(isDefined)

    if (!services || services.length === 0) {
      throw new Error(
        `not_found: could not find DIDComm Messaging service in DID document for '${recipientDidUrl}'`,
      )
    }

    // spray all endpoints and transports that match and gather results
    // TODO: investigate if we should queue the requests and stop when the first transport succeeds
    const results: (ISendDIDCommMessageResponse | Error)[] = []

    for (const service of services) {
      // serviceEndpoint can be a string, a ServiceEndpoint object, or an array of strings or ServiceEndpoint objects
      let routingKeys: string[] = []
      let serviceEndpointUrl = ''
      if (typeof service.serviceEndpoint === 'string') {
        serviceEndpointUrl = service.serviceEndpoint
      } else if ((service.serviceEndpoint as any).uri) {
        serviceEndpointUrl = (service.serviceEndpoint as any).uri
      } else if (Array.isArray(service.serviceEndpoint) && service.serviceEndpoint.length > 0) {
        if (typeof service.serviceEndpoint[0] === 'string') {
          serviceEndpointUrl = service.serviceEndpoint[0]
        } else if (service.serviceEndpoint[0].uri) {
          serviceEndpointUrl = service.serviceEndpoint[0].uri
        }
      }

      if (typeof service.serviceEndpoint !== 'string') {
        if (
          Array.isArray(service.serviceEndpoint) &&
          service.serviceEndpoint.length > 0 &&
          service.serviceEndpoint[0].routingKeys
        ) {
          routingKeys = service.serviceEndpoint[0].routingKeys
        } else if ((service.serviceEndpoint as any).routingKeys) {
          routingKeys = (<Exclude<ServiceEndpoint, string>>service.serviceEndpoint).routingKeys
        }
      }

      if (routingKeys.length > 0) {
        // routingKeys found, wrap forward messages
        let wrappedMessage: IPackedDIDCommMessage = packedMessage
        for (let i = routingKeys.length - 1; i >= 0; i--) {
          const recipient = i >= routingKeys.length - 1 ? recipientDidUrl : routingKeys[i + 1].split('#')[0]
          wrappedMessage = await this.wrapDIDCommForwardMessage(
            recipient,
            messageId,
            wrappedMessage,
            routingKeys[i],
            context,
          )
        }
        packedMessage.message = wrappedMessage.message
      }

      const isServiceEndpointDid = serviceEndpointUrl.startsWith('did:')

      if (isServiceEndpointDid) {
        // Final wrapping and send to mediator DID
        const recipient =
          routingKeys.length > 0 ? routingKeys[routingKeys.length - 1].split('#')[0] : recipientDidUrl
        const wrappedMessage = await this.wrapDIDCommForwardMessage(
          recipient,
          messageId,
          packedMessage,
          serviceEndpointUrl,
          context,
        )
        try {
          results.push(
            await this.sendDIDCommMessage(
              { packedMessage: wrappedMessage, recipientDidUrl: serviceEndpointUrl, messageId },
              context,
            ),
          )
        } catch (e: any) {
          debug(e)
          results.push(e)
        }
      }

      const transports = this.transports.filter(
        (t) => t.isServiceSupported(service) && (!returnTransportId || t.id === returnTransportId),
      )
      if (!transports || transports.length < 1) {
        const err = new Error('not_found: no transport type found for service: ' + JSON.stringify(service))
        debug(err)
        results.push(err)
      }

      for (const transport of transports) {
        let response
        try {
          response = await transport.send(service, packedMessage.message)
          if (response.error) {
            const err = new Error(
              `Error when sending DIDComm message through transport with id: '${transport.id}': ${response.error}`,
            )
            debug(err)
            results.push(err)
          } else {
            results.push({
              transportId: transport.id,
              returnMessage: response.returnMessage
                ? {
                    id: '',
                    type: 'unprocessed',
                    raw: response.returnMessage,
                  }
                : undefined,
            })
          }
        } catch (e) {
          const err = new Error(
            `Cannot send DIDComm message through transport with id: '${transport.id}': ${e}`,
          )
          debug(err)
          results.push(err)
        }
      }
    }

    const successful: ISendDIDCommMessageResponse[] = results.filter(
      (r) => !(r instanceof Error),
    ) as ISendDIDCommMessageResponse[]

    if (successful.length > 0) {
      context.agent.emit('DIDCommV2Message-sent', messageId)
      for (const response of successful) {
        if (response.returnMessage) {
          const returnMessage = await context.agent.handleMessage({
            raw: response.returnMessage.raw ?? '',
          })
          return { transportId: response.transportId, returnMessage }
        }
      }
      return successful[0]
    } else {
      const errors = results.filter((r) => r instanceof Error) as Error[]
      const err = new Error('Could not send DIDComm message using any of the attepmpted transports')
      err.cause = new AggregateError(errors)
      throw err
    }
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
        const endpointUri =
          typeof serviceEndpoint === 'string'
            ? serviceEndpoint
            : (<Exclude<ServiceEndpoint, string>>serviceEndpoint).uri ?? ''

        const res = await fetch(endpointUri, {
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
