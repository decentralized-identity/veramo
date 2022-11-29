import { DIDResolutionResult, IAgentContext, IIdentifier, IKey, IKeyManager, IService, ManagedKeyInfo } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
import {
  IAddKeyOpts,
  IContext,
  ICreateIdentifierOpts,
  IKeyRotation,
  IonDidForm,
  IonKeyMetadata,
  IUpdateOpts,
  KeyIdentifierRelation,
  KeyOpts,
  KeyType,
  VerificationMethod,
} from './types/ion-provider-types'

import { IonSigner } from './ion-signer'
import { resolveDidIonFromIdentifier } from './ion-did-resolver'

import { IonPublicKeyModel, IonPublicKeyPurpose, IonRequest } from '@decentralized-identity/ion-sdk'
import {
  computeCommitmentFromIonPublicKey,
  generatePrivateKeyHex,
  getActionTimestamp,
  getVeramoRecoveryKey,
  getVeramoUpdateKey,
  ionDidSuffixFromLong,
  ionLongFormDidFromCreation,
  ionShortFormDidFromLong,
  tempMemoryKey,
  toIonPublicKey,
  toIonPublicKeyJwk,
  toJwkEs256k,
  truncateKidIfNeeded,
} from './functions'
import { IonPoW } from '@sphereon/ion-pow'

const debug = Debug('veramo:ion-did-provider')

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:ion` identifiers
 * @public
 */
export class IonDIDProvider extends AbstractIdentifierProvider {
  private readonly defaultKms: string
  private readonly ionPoW: IonPoW

  constructor(options: { defaultKms: string, challengeEnabled?: boolean, challengeEndpoint?: string, solutionEndpoint?: string}) {
    super()
    this.defaultKms = options.defaultKms
    const challengeEnabled = options?.challengeEnabled === undefined ? true : options.challengeEnabled;
    const challengeEndpoint = options?.challengeEndpoint
    const solutionEndpoint = options?.solutionEndpoint
    this.ionPoW = new IonPoW({ challengeEnabled, challengeEndpoint, solutionEndpoint })
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerCreate} */
  async createIdentifier(
    { kms, options, alias }: { kms?: string; alias?: string; options?: ICreateIdentifierOpts },
    context: IAgentContext<IKeyManager>
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const actionTimestamp = getActionTimestamp(options?.actionTimestamp)

    const recoveryKey = await this.importProvidedOrGeneratedKey(
      {
        kms,
        actionTimestamp: actionTimestamp,
        relation: KeyIdentifierRelation.RECOVERY,
        options: options?.recoveryKey,
      },
      context
    )
    const updateKey = await this.importProvidedOrGeneratedKey(
      {
        kms,
        actionTimestamp: actionTimestamp,
        relation: KeyIdentifierRelation.UPDATE,
        options: options?.updateKey,
      },
      context
    )

    // No options or no verification method options, results in us generating a single key as the only authentication verification method in the DID
    const verificationMethods = options?.verificationMethods
      ? options.verificationMethods
      : [
          {
            type: KeyType.Secp256k1,
            purposes: [IonPublicKeyPurpose.Authentication],
          },
        ]

    const veramoKeys: ManagedKeyInfo[] = [recoveryKey, updateKey]
    const ionPublicKeys: IonPublicKeyModel[] = []
    for (const verificationMethod of verificationMethods) {
      const key = await this.importProvidedOrGeneratedKey(
        {
          kms,
          actionTimestamp: actionTimestamp,
          relation: KeyIdentifierRelation.DID,
          options: verificationMethod,
        },
        context
      )
      veramoKeys.push(key)
      ionPublicKeys.push(toIonPublicKey(key, verificationMethod.purposes))
    }

    const services = options?.services ? options.services : undefined

    const createRequest = {
      recoveryKey: toIonPublicKeyJwk(recoveryKey.publicKeyHex),
      updateKey: toIonPublicKeyJwk(updateKey.publicKeyHex),
      document: {
        publicKeys: ionPublicKeys,
        services,
      },
    }
    const longFormDid = await ionLongFormDidFromCreation(createRequest)
    const shortFormDid = ionShortFormDidFromLong(longFormDid)

    const request = await IonRequest.createCreateRequest(createRequest)
    await this.anchorRequest(request, options?.anchor)

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: longFormDid,
      controllerKeyId: updateKey.kid,
      alias: shortFormDid,
      keys: veramoKeys,
      services: services ? services : [],
    }

    debug('Created DID (short, long form): ', identifier.alias, identifier.did)
    return identifier
  }

  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('IonDIDProvider updateIdentifier not supported yet.')
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerDelete} */
  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    const didResolution = await this.getAssertedDidDocument(identifier, IonDidForm.LONG)
    const recoveryKey = getVeramoRecoveryKey(identifier.keys, didResolution.didDocumentMetadata.method.recoveryCommitment)
    const request = await IonRequest.createDeactivateRequest({
      didSuffix: ionDidSuffixFromLong(identifier.did),
      recoveryPublicKey: toJwkEs256k(toIonPublicKeyJwk(recoveryKey.publicKeyHex)),
      signer: new IonSigner(context, recoveryKey.kid),
    })

    await this.anchorRequest(request, true)

    return true
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddKey} */
  async addKey({ identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: IAddKeyOpts }, context: IContext): Promise<any> {
    if (!options) {
      throw Error('Add key needs options, since we need to know the purpose(s) of the key')
    }
    const rotation = await this.rotateVeramoKey({ identifier, options, kms: key.kms, context })

    const request = await IonRequest.createUpdateRequest({
      didSuffix: ionDidSuffixFromLong(identifier.did),
      updatePublicKey: rotation.currentJwk,
      nextUpdatePublicKey: rotation.nextJwk,
      signer: new IonSigner(context, rotation.currentVeramoKey.kid),
      publicKeysToAdd: [
        {
          ...toIonPublicKey(key, options.purposes),
        },
      ],
    })

    try {
      await this.anchorRequest(request, options.anchor)
      return request
    } catch (error) {
      // It would have been nicer if we hadn't stored the new update key yet
      await this.deleteKeyOnError(rotation.nextVeramoKey.kid, context)
      throw error
    }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddService} */
  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: IUpdateOpts },
    context: IContext
  ): Promise<any> {
    const rotation = await this.rotateVeramoKey({ identifier, options, context })

    const request = await IonRequest.createUpdateRequest({
      didSuffix: ionDidSuffixFromLong(identifier.did),
      updatePublicKey: rotation.currentJwk,
      nextUpdatePublicKey: rotation.nextJwk,
      signer: new IonSigner(context, rotation.currentVeramoKey.kid),
      servicesToAdd: [
        {
          ...service,
        },
      ],
    })

    try {
      await this.anchorRequest(request, options?.anchor)
      return request
    } catch (error) {
      // It would have been nicer if we hadn't stored the new update key yet
      await this.deleteKeyOnError(rotation.nextVeramoKey.kid, context)
      throw error
    }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveKey} */
  async removeKey({ identifier, kid, options }: { identifier: IIdentifier; kid: string; options?: IUpdateOpts }, context: IContext): Promise<any> {
    const rotation = await this.rotateVeramoKey({ identifier, options, context })

    const request = await IonRequest.createUpdateRequest({
      didSuffix: ionDidSuffixFromLong(identifier.did),
      updatePublicKey: rotation.currentJwk,
      nextUpdatePublicKey: rotation.nextJwk,
      signer: new IonSigner(context, rotation.currentVeramoKey.kid),
      idsOfPublicKeysToRemove: [truncateKidIfNeeded(kid)],
    })

    try {
      await this.anchorRequest(request, options?.anchor)
      return request
    } catch (error) {
      // It would have been nicer if we hadn't stored the new update key yet
      await this.deleteKeyOnError(rotation.nextVeramoKey.kid, context)
      throw error
    }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveService} */
  async removeService({ identifier, id, options }: { identifier: IIdentifier; id: string; options?: IUpdateOpts }, context: IContext): Promise<any> {
    const rotation = await this.rotateVeramoKey({ identifier, options, context })

    const request = await IonRequest.createUpdateRequest({
      didSuffix: ionDidSuffixFromLong(identifier.did),
      updatePublicKey: rotation.currentJwk,
      nextUpdatePublicKey: rotation.nextJwk,
      signer: new IonSigner(context, rotation.currentVeramoKey.kid),
      idsOfServicesToRemove: [truncateKidIfNeeded(id)],
    })

    try {
      await this.anchorRequest(request, options?.anchor)
      return request
    } catch (error) {
      // It would have been nicer if we hadn't stored the new update key yet
      await this.deleteKeyOnError(rotation.nextVeramoKey.kid, context)
      throw error
    }
  }

  /**
   * Gets as DID document from the identifier in either short or long form
   *
   * @param identifier - The Identifier (DID) to use
   * @param didForm - Use short or long form (the default) for resolution
   * @returns - A DID Document promise
   */
  private async getAssertedDidDocument(identifier: IIdentifier, didForm: IonDidForm = IonDidForm.LONG): Promise<DIDResolutionResult> {
    const didDocument = await resolveDidIonFromIdentifier(identifier, didForm)
    if (!didDocument) {
      return Promise.reject(Error(`Could not resolve existing DID document for did ${identifier.did}`))
    }
    return didDocument
  }

  /**
   * Rotate an update or recovery key. Meaning a new key will be generated, which will be used from that moment on for recoveries or updates.
   * It returns an object which is used internally to get access to current en next update/recovery keys, which are transformed in different types (Veramo, JWK, ION Public Key)
   *
   * @param identifier - The identifier (DID) for which to update the recovery/update key
   * @param commitment - The current commitment value for either the update or recovery key from the DID document
   * @param relation - Whether it is an update key or a recovery key
   * @param kms - The KMS to use
   * @param options - Allows to set a kid for the new key or to import a key for the new update/recovery key
   * @param actionTimestamp - The action Timestamp. These are used to order keys in chronological order. Normally you will want to use Date.now() for these
   * @param context - The Veramo Agent context
   */
  private async rotateUpdateOrRecoveryKey(
    {
      identifier,
      commitment,
      relation,
      kms,
      options,
      actionTimestamp,
    }: {
      identifier: IIdentifier
      commitment: string
      actionTimestamp: number
      relation: KeyIdentifierRelation
      kms?: string
      alias?: string
      options?: KeyOpts
    },
    context: IAgentContext<IKeyManager>
  ): Promise<IKeyRotation> {
    const currentVeramoKey =
      relation == KeyIdentifierRelation.UPDATE
        ? getVeramoUpdateKey(identifier.keys, commitment)
        : getVeramoRecoveryKey(identifier.keys, commitment)
    const currentIonKey = toIonPublicKey(currentVeramoKey)
    const currentJwk = toIonPublicKeyJwk(currentVeramoKey.publicKeyHex)
    //todo alias?
    const nextVeramoKey = await this.importProvidedOrGeneratedKey(
      {
        kms,
        actionTimestamp: actionTimestamp,
        relation,
        options,
      },
      context
    )
    const nextIonKey = toIonPublicKey(nextVeramoKey)
    const nextJwk = toIonPublicKeyJwk(nextVeramoKey.publicKeyHex)

    return { currentIonKey, currentVeramoKey, currentJwk, nextJwk, nextIonKey, nextVeramoKey }
  }

  /**
   * Rotates an actual update/recovery key in Veramo
   *
   * @param kms - The KMS to use
   * @param context - The Veramo agent context
   * @param options - options Allows to set a kid for the new key or to import a key for the new update/recovery key
   * @param identifier - The identifier (DID) for which to update the recovery/update key
   */
  private async rotateVeramoKey({
    kms,
    context,
    options,
    identifier,
  }: {
    identifier: IIdentifier
    options?: IUpdateOpts
    kms?: string
    context: IContext
  }) {
    const didResolution = await this.getAssertedDidDocument(identifier, IonDidForm.LONG)
    const currentUpdateKey = getVeramoUpdateKey(identifier.keys, didResolution.didDocumentMetadata.method.updateCommitment)
    const commitment = computeCommitmentFromIonPublicKey(toIonPublicKey(currentUpdateKey))
    const actionId = getActionTimestamp(options?.actionTimestamp)

    const rotation = await this.rotateUpdateOrRecoveryKey(
      {
        identifier,
        commitment,
        relation: KeyIdentifierRelation.UPDATE,
        actionTimestamp: actionId,
        kms: kms ? kms : this.defaultKms,
        options: {},
      },
      context
    )
    return rotation
  }

  /**
   * We optionally generate and then import our own keys.
   *
   * Reason for this is that we want to be able to assign Key IDs (kid), which Veramo supports on import, but not creation. The net result is that we do not support keys which have been created from keyManagerCreate
   *
   * @param kms - The KMS to use
   * @param actionTimestamp - The action Timestamp. These are used to order keys in chronological order. Normally you will want to use Date.now() for these
   * @param relation - Whether it is a DID Verification Method key, an update key or a recovery key
   * @param options - Allows to set a kid for the new key or to import a key for the new update/recovery key
   * @param context - The Veramo agent context
   */
  private async importProvidedOrGeneratedKey(
    {
      kms,
      actionTimestamp,
      relation,
      options,
    }: { kms?: string; actionTimestamp: number; relation: KeyIdentifierRelation; options?: KeyOpts | VerificationMethod },
    context: IAgentContext<IKeyManager>
  ): Promise<IKey> {
    const kid = options?.kid ? options.kid : options?.key?.kid
    const type = options?.type
      ? options.type
      : options?.key?.type
      ? (options.key.type as KeyType)
      : KeyType.Secp256k1

    const meta = options?.key?.meta ? options.key.meta : {}
    const ionMeta: IonKeyMetadata = {
      relation,
      actionTimestamp: actionTimestamp,
    }
    if (options && 'purposes' in options) {
      ionMeta.purposes = options.purposes
    }
    let privateKeyHex: string
    if (options?.key) {
      if (!options.key.privateKeyHex) {
        throw new Error(`We need to have a private key when importing a recovery or update key. Key ${kid} did not have one`)
      }
      privateKeyHex = options.key.privateKeyHex
    } else {
      privateKeyHex = generatePrivateKeyHex(type)
    }
    if (relation === KeyIdentifierRelation.RECOVERY || relation === KeyIdentifierRelation.UPDATE) {
      // We need a commitment for these keys. As they are based on the publicKey let's create an in mem key
      const tmpKey = await tempMemoryKey(type, privateKeyHex, kid!, kms ? kms : this.defaultKms, ionMeta)
      ionMeta.commitment = tmpKey.meta!.ion.commitment
    }
    meta.ion = ionMeta

    const key: IKey = await context.agent.keyManagerImport({
      kms: kms || this.defaultKms,
      type,
      privateKeyHex,
      kid,
      meta,
    })
    // We need it in case we are importing it again in the same call
    // key.privateKeyHex = privateKeyHex

    debug('Created key', type, relation, kid, key.publicKeyHex)

    return key
  }

  /**
   * Whether to actually anchor the request on the ION network
   *
   * @param request - The ION request
   * @param anchor - Whether to anchor or not (defaults to true)
   * @returns - The anchor request
   */
  private async anchorRequest(request: IonRequest, anchor?: boolean) {
    if (anchor !== false) {
      await this.ionPoW.submit(JSON.stringify(request))
    } else {
      debug(`Not anchoring as anchoring was not enabled`)
    }
  }

  /**
   * Deletes a key (typically a rotation key) on error. As this happens in an exception flow, any issues with deletion are only debug logged.
   *
   * @param kid - the internal ID of the key being deleted
   * @param context - the Veramo instance calling this method
   */
  private async deleteKeyOnError(kid: string, context: IAgentContext<IKeyManager>) {
    try {
      await context.agent.keyManagerDelete({ kid })
    } catch (ignore) {
      debug(ignore.message)
    }
  }
}
