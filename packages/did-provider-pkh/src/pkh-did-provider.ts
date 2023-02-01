import { computeAddress } from '@ethersproject/transactions';
import {
  IAgentContext,
  IIdentifier,
  IKey,
  IKeyManager,
  IService,
  ManagedKeyInfo,
} from '@veramo/core';

import { AbstractIdentifierProvider } from '@veramo/did-manager';

type IContext = IAgentContext<IKeyManager>;

const isIn = <T>(values: readonly T[], value: any): value is T => {
  return values.includes(value);
};

export const SECPK1_NAMESPACES = ['eip155'] as const;
export const isValidNamespace = (x: string) => isIn(SECPK1_NAMESPACES, x);

/**
 * Options for creating a did:ethr
 * @beta
 */
export interface CreateDidPkhOptions {
  namespace: string;
  privateKey: string;
  /**
   * This can be hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `1` is assumed.
   */
  chainId?: string;
}

/**
 * Helper method that can computes the ethereumAddress corresponding to a Secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, optionally prefixed with `0x`
 */
export function toEthereumAddress(hexPublicKey: string): string {
  const publicKey = hexPublicKey.startsWith('0x')
    ? hexPublicKey
    : '0x' + hexPublicKey;
  return computeAddress(publicKey);
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:pkh` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PkhDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string;
  private chainId: string;

  constructor(options: { defaultKms: string; chainId?: string }) {
    super();
    this.defaultKms = options.defaultKms;
    this.chainId = options?.chainId ? options.chainId : '1';
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidPkhOptions },
    context: IContext
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const namespace = options?.namespace ? options.namespace : 'eip155';

    if (!isValidNamespace(namespace)) {
      console.error(
        `Invalid namespace '${namespace}'. Valid namespaces are: ${SECPK1_NAMESPACES}`
      );
      throw new Error(
        `Invalid namespace '${namespace}'. Valid namespaces are: ${SECPK1_NAMESPACES}`
      );
    }

    let key: ManagedKeyInfo | null;
    if (options?.privateKey !== undefined){
      key = await context.agent.keyManagerImport({
        kms: kms || this.defaultKms,
        type: 'Secp256k1',
        privateKeyHex: options?.privateKey as string,
      });
    } else {
      key = await context.agent.keyManagerCreate({ 
        kms: kms || this.defaultKms, 
        type: 'Secp256k1' 
      });
    }
    const evmAddress: string = toEthereumAddress(key.publicKeyHex);

    if (key !== null) {
      const identifier: Omit<IIdentifier, 'provider'> = {
        did: 'did:pkh:' + namespace + ':' + this.chainId + ':' + evmAddress,
        controllerKeyId: key.kid,
        keys: [key],
        services: [],
      };
      return identifier;
    } else {
      console.error('Could not create identifier due to some errors');
      throw new Error('Could not create identifier due to some errors');
    }
  }

  async updateIdentifier(
    args: {
      did: string;
      kms?: string | undefined;
      alias?: string | undefined;
      options?: any;
    },
    context: IAgentContext<IKeyManager>
  ): Promise<IIdentifier> {
    throw new Error('PkhDIDProvider updateIdentifier not supported yet.');
  }

  async deleteIdentifier(
    identifier: IIdentifier,
    context: IContext
  ): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid });
    }
    return true;
  }

  async addKey(
    {
      identifier,
      key,
      options,
    }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider addKey not supported');
  }

  async addService(
    {
      identifier,
      service,
      options,
    }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider addService not supported');
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider removeKey not supported');
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider removeService not supported');
  }
}
