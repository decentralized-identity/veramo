import { computeAddress } from 'ethers';
import {
  IAgentContext,
  IIdentifier,
  IKey,
  IKeyManager,
  IService,
  ManagedKeyInfo,
} from '@veramo/core-types';

import { AbstractIdentifierProvider } from '@veramo/did-manager';
import Debug from 'debug'

const debug = Debug('veramo:pkh-did-provider')

type IContext = IAgentContext<IKeyManager>;

const isIn = <T>(values: readonly T[], value: any): value is T => {
  return values.includes(value);
};

export const SECPK1_NAMESPACES = ['eip155'] as const;
export const isValidNamespace = (x: string) => isIn(SECPK1_NAMESPACES, x);

/**
 * Options for creating a did:pkh
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
  chainId?: string | number;
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
      debug(
        `invalid_namespace: '${namespace}'. valid namespaces are: ${SECPK1_NAMESPACES}`
      );
      throw new Error(
        `invalid_namespace: '${namespace}'. valid namespaces are: ${SECPK1_NAMESPACES}`
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
      debug('Could not create identifier due to some errors');
      throw new Error('unknown_error: could not create identifier due to errors creating or importing keys');
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
    throw new Error('illegal_operation: did:pkh update is not possible.');
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
    throw Error('illegal_operation: did:pkh addKey is not possible.');
  }

  async addService(
    {
      identifier,
      service,
      options,
    }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('illegal_operation: did:pkh addService is not possible.');
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('illegal_operation: did:pkh removeKey is not possible.');

  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('illegal_operation: did:pkh removeService is not possible.');

  }
}
