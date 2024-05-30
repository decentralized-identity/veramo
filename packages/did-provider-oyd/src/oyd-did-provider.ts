import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import type { OydCreateIdentifierOptions, OydDidHoldKeysArgs, OydDidSupportedKeyTypes } from './types/oyd-provider-types.js'
import fetch from 'cross-fetch'

import Debug from 'debug'
const debug = Debug('veramo:oyd-did:identifier-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:oyd` identifiers
 * @public
 */
export class OydDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options: OydCreateIdentifierOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {

    const body = { options };
    const url = "https://oydid-registrar.data-container.net/1.0/createIdentifier";

    let didDoc: any | undefined;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });    
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      didDoc = await response.json();
    } catch (error) {
      throw new Error('There has been a problem with the fetch operation: ' + error.toString());
    }

    const keyType: OydDidSupportedKeyTypes = options?.keyType || 'Ed25519'
    const key = await this.holdKeys(
      {
        kms: kms || this.defaultKms,
        options: {
          keyType,
          kid: didDoc.did + "#key-doc",
          publicKeyHex: didDoc.keys[0].publicKeyHex,
          privateKeyHex: didDoc.keys[0].privateKeyHex,
        },
      },
      context,
    )

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: didDoc.did,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, 
    context: IAgentContext<IKeyManager>
  ): Promise<IIdentifier> {
    throw new Error('OydDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(
    identifier: IIdentifier, 
    context: IContext
  ): Promise<boolean> {
    throw new Error('OydDIDProvider deleteIdentifier not supported yet.')
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    throw new Error('OydDIDProvider addKey not supported yet.')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw new Error('OydDIDProvider addService not supported yet.')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw new Error('OydDIDProvider removeKey not supported yet.')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw new Error('OydDIDProvider removeService not supported yet.')
  }

  private async holdKeys(
    args: OydDidHoldKeysArgs,
    context: IContext,
  ): Promise<IKey> {
    if (args.options.privateKeyHex) {
      return context.agent.keyManagerImport({
        kms: args.kms || this.defaultKms,
        type: args.options.keyType,
        kid: args.options.kid,
        privateKeyHex: args.options.privateKeyHex,
        meta: {
          algorithms: ["Ed25519", "X25519"]
        }  
      })
    }
    return context.agent.keyManagerCreate({
      type: args.options.keyType,
      kms: args.kms || this.defaultKms,
      meta: {
        algorithms: ["Ed25519", "X25519"]
      }
    })
  }
}
