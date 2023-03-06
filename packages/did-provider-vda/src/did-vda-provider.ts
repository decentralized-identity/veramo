import { IAgentContext, IIdentifier, IKey, IKeyManager, IService } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
import { VdaDid } from '@verida/vda-did'
import { DIDDocument as VeridaDIDDocument } from '@verida/did-document'
import { bytesToHex } from '@veramo/utils'
import { joinSignature, splitSignature } from '@ethersproject/bytes'

import { keccak_256 } from '@noble/hashes/sha3'
import { computeAddress } from '@ethersproject/transactions'
import { utf8ToBytes } from "@noble/hashes/utils";

const debug = Debug('veramo:did-provider-vda')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:vda` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DidVdaProvider extends AbstractIdentifierProvider {
  private defaultKms: string
  private endpoints: string[]

  constructor(options: { defaultKms: string; endpoints: string[] }) {
    super()
    this.defaultKms = options.defaultKms
    this.endpoints = options.endpoints
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })

    const methodSpecificId = computeAddress(`0x${key.publicKeyHex}`)

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:vda:testnet:' + methodSpecificId,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    const signer = async (data: Uint8Array): Promise<string> => {
      const msgDigest = bytesToHex(await keccak_256(data))
      const signature = await context.agent.keyManagerSign({
        algorithm: 'eth_rawSign',
        data: msgDigest,
        encoding: 'hex',
        keyRef: key.kid,
      })
      return signature
    }

    const VDA_DID_CONFIG = {
      identifier: identifier.did,
      signer,
      callType: 'web3' as any,
      web3Options: {},
    }

    function getProofData(doc: VeridaDIDDocument): object {
      const proofData: any = Object.assign({}, doc.export())
      delete proofData['proof']
      return proofData
    }

    const veridaApi = new VdaDid(VDA_DID_CONFIG)
    const doc = new VeridaDIDDocument(identifier.did, `0x${key.publicKeyHex}`)

    const proofData = getProofData(doc)
    let signature = await signer(utf8ToBytes(JSON.stringify(proofData)))
    signature = joinSignature(splitSignature(signature))
    const proof = {
      type: 'EcdsaSecp256k1VerificationKey2019',
      verificationMethod: `${doc.id}#controller`,
      proofPurpose: 'assertionMethod',
      proofValue: signature,
    }
    // FIXME: TODO attach proof to doc

    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('DidVdaProvider updateIdentifier not implemented yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    // FIXME: call the blockchain to delete
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider addKey not implemented yet.')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider addService not implemented yet.')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider removeKey not implemented yet.')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider removeService not implemented yet.')
  }
}
