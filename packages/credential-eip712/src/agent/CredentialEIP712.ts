import {
  CredentialPayload,
  IAgentPlugin,
  IIdentifier,
  IKey,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'
import {
  extractIssuer,
  getChainId,
  getEthereumAddress,
  intersect,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  processEntryToArray,
  removeDIDParameters,
  resolveDidOrThrow,
} from '@veramo/utils'
import { schema } from '../plugin.schema.js'

import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import {
  ICreateVerifiableCredentialEIP712Args,
  ICreateVerifiablePresentationEIP712Args,
  ICredentialIssuerEIP712,
  IRequiredContext,
  IVerifyCredentialEIP712Args,
  IVerifyPresentationEIP712Args,
} from '../types/ICredentialEIP712.js'

import { getEthTypesFromInputDoc } from 'eip-712-types-generation'

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerEIP712} methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialIssuerEIP712 implements IAgentPlugin {
  readonly methods: ICredentialIssuerEIP712
  readonly schema = schema.ICredentialIssuerEIP712

  constructor() {
    this.methods = {
      createVerifiableCredentialEIP712: this.createVerifiableCredentialEIP712.bind(this),
      createVerifiablePresentationEIP712: this.createVerifiablePresentationEIP712.bind(this),
      verifyCredentialEIP712: this.verifyCredentialEIP712.bind(this),
      verifyPresentationEIP712: this.verifyPresentationEIP712.bind(this),
      matchKeyForEIP712: this.matchKeyForEIP712.bind(this),
    }
  }

  /** {@inheritdoc ICredentialIssuerEIP712.createVerifiableCredentialEIP712} */
  public async createVerifiableCredentialEIP712(
    args: ICreateVerifiableCredentialEIP712Args,
    context: IRequiredContext,
  ): Promise<VerifiableCredential> {
    const credentialContext = processEntryToArray(
      args?.credential?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const credentialType = processEntryToArray(args?.credential?.type, 'VerifiableCredential')
    let issuanceDate = args?.credential?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }

    const issuer = extractIssuer(args.credential, { removeParameters: true })
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: credential.issuer must not be empty')
    }

    let keyRef = args.keyRef

    const identifier = await context.agent.didManagerGet({ did: issuer })

    if (!keyRef) {
      const key = identifier.keys.find(
        (k) => k.type === 'Secp256k1' && k.meta?.algorithms?.includes('eth_signTypedData'),
      )
      if (!key) throw Error('key_not_found: No suitable signing key is known for ' + identifier.did)
      keyRef = key.kid
    }

    const extendedKeys = await mapIdentifierKeysToDoc(
      identifier,
      'verificationMethod',
      context,
      args.resolutionOptions,
    )
    const extendedKey = extendedKeys.find((key) => key.kid === keyRef)
    if (!extendedKey)
      throw Error('key_not_found: The signing key is not available in the issuer DID document')

    let chainId
    try {
      chainId = getChainId(extendedKey.meta.verificationMethod)
    } catch (e) {
      chainId = 1
    }
    const credential: CredentialPayload = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
      issuanceDate,
      proof: {
        verificationMethod: extendedKey.meta.verificationMethod.id,
        created: issuanceDate,
        proofPurpose: 'assertionMethod',
        type: 'EthereumEip712Signature2021',
      },
    }

    const message = credential
    const domain = {
      chainId,
      name: 'VerifiableCredential',
      version: '1',
    }

    const primaryType = 'VerifiableCredential'
    const allTypes = getEthTypesFromInputDoc(credential, primaryType)
    const types = { ...allTypes }

    const data = JSON.stringify({ domain, types, message, primaryType })

    const signature = await context.agent.keyManagerSign({ keyRef, data, algorithm: 'eth_signTypedData' })

    credential['proof']['proofValue'] = signature
    credential['proof']['eip712'] = {
      domain,
      types: allTypes,
      primaryType,
    }

    return credential as VerifiableCredential
  }

  /** {@inheritdoc ICredentialIssuerEIP712.verifyCredentialEIP712} */
  private async verifyCredentialEIP712(
    args: IVerifyCredentialEIP712Args,
    context: IRequiredContext,
  ): Promise<boolean> {
    const { credential } = args
    if (!credential.proof || !credential.proof.proofValue)
      throw new Error('invalid_argument: proof is undefined')

    const { proof, ...signingInput } = credential
    const { proofValue, eip712, eip712Domain, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const compat = {
      ...eip712Domain,
      ...eip712,
    }

    compat.types = compat.types || compat.messageSchema

    if (!compat.primaryType || !compat.types || !compat.domain)
      throw new Error('invalid_argument: proof is missing expected properties')

    const objectToVerify = {
      message: verificationMessage,
      domain: compat.domain,
      types: compat.types,
      primaryType: compat.primaryType,
    }

    const recovered = recoverTypedSignature({
      data: objectToVerify,
      signature: proofValue,
      version: SignTypedDataVersion.V4,
    })

    const issuer = extractIssuer(credential)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: credential.issuer must not be empty')
    }

    const didDocument = await resolveDidOrThrow(issuer, context, args.resolutionOptions)

    if (didDocument.verificationMethod) {
      for (const verificationMethod of didDocument.verificationMethod) {
        if (getEthereumAddress(verificationMethod)?.toLowerCase() === recovered.toLowerCase()) {
          return true
        }
      }
    } else {
      throw new Error('resolver_error: issuer DIDDocument does not contain any verificationMethods')
    }

    return false
  }

  /** {@inheritdoc ICredentialIssuerEIP712.createVerifiablePresentationEIP712} */
  async createVerifiablePresentationEIP712(
    args: ICreateVerifiablePresentationEIP712Args,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation> {
    const presentationContext = processEntryToArray(
      args?.presentation?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')
    let issuanceDate = args?.presentation?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }

    const presentation: PresentationPayload = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
      issuanceDate,
    }

    if (!isDefined(args.presentation.holder)) {
      throw new Error('invalid_argument: presentation.holder must not be empty')
    }

    if (args.presentation.verifiableCredential) {
      // EIP712 arrays must use a single data type, so we map all credentials to strings.
      presentation.verifiableCredential = args.presentation.verifiableCredential.map((cred) => {
        // map JWT credentials to their canonical form
        if (typeof cred === 'string') {
          return cred
        } else if (cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return JSON.stringify(cred)
        }
      })
    }

    const holder = removeDIDParameters(presentation.holder)

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: holder })
    } catch (e) {
      throw new Error('invalid_argument: presentation.holder must be a DID managed by this agent')
    }

    let keyRef = args.keyRef

    if (!keyRef) {
      const key = identifier.keys.find(
        (k) => k.type === 'Secp256k1' && k.meta?.algorithms?.includes('eth_signTypedData'),
      )
      if (!key) throw Error('key_not_found: No suitable signing key is known for ' + identifier.did)
      keyRef = key.kid
    }

    const extendedKeys = await mapIdentifierKeysToDoc(
      identifier,
      'verificationMethod',
      context,
      args.resolutionOptions,
    )
    const extendedKey = extendedKeys.find((key) => key.kid === keyRef)
    if (!extendedKey)
      throw Error('key_not_found: The signing key is not available in the issuer DID document')

    let chainId
    try {
      chainId = getChainId(extendedKey.meta.verificationMethod)
    } catch (e) {
      chainId = 1
    }

    presentation['proof'] = {
      verificationMethod: extendedKey.meta.verificationMethod.id,
      created: issuanceDate,
      proofPurpose: 'assertionMethod',
      type: 'EthereumEip712Signature2021',
    }

    const message = presentation
    const domain = {
      chainId,
      name: 'VerifiablePresentation',
      version: '1',
    }

    const primaryType = 'VerifiablePresentation'
    const allTypes = getEthTypesFromInputDoc(presentation, primaryType)
    const types = { ...allTypes }

    const data = JSON.stringify({ domain, types, message })

    const signature = await context.agent.keyManagerSign({ keyRef, data, algorithm: 'eth_signTypedData' })

    presentation.proof.proofValue = signature

    presentation.proof.eip712 = {
      domain,
      types: allTypes,
      primaryType,
    }

    return presentation as VerifiablePresentation
  }

  /** {@inheritdoc ICredentialIssuerEIP712.verifyPresentationEIP712} */
  private async verifyPresentationEIP712(
    args: IVerifyPresentationEIP712Args,
    context: IRequiredContext,
  ): Promise<boolean> {
    const { presentation } = args
    if (!presentation.proof || !presentation.proof.proofValue) throw new Error('Proof is undefined')

    const { proof, ...signingInput } = presentation
    const { proofValue, eip712, eip712Domain, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const compat = {
      ...eip712Domain,
      ...eip712,
    }

    compat.types = compat.types || compat.messageSchema

    if (!compat.primaryType || !compat.types || !compat.domain)
      throw new Error('invalid_argument: presentation proof is missing expected properties')

    const objectToVerify = {
      message: verificationMessage,
      domain: compat.domain,
      types: compat.types,
      primaryType: compat.primaryType,
    }

    const recovered = recoverTypedSignature({
      data: objectToVerify,
      signature: proofValue,
      version: SignTypedDataVersion.V4,
    })

    const issuer = extractIssuer(presentation)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: args.presentation.issuer must not be empty')
    }

    const didDocument = await resolveDidOrThrow(issuer, context, args.resolutionOptions)

    if (didDocument.verificationMethod) {
      for (const verificationMethod of didDocument.verificationMethod) {
        if (getEthereumAddress(verificationMethod)?.toLowerCase() === recovered.toLowerCase()) {
          return true
        }
      }
    } else {
      throw new Error('resolver_error: holder DIDDocument does not contain any verificationMethods')
    }

    return false
  }

  /**
   * Checks if a key is suitable for signing EIP712 payloads.
   * This relies on the metadata set by the key management system to determine if this key can sign EIP712 payloads.
   *
   * @param k - the key to check
   *
   * @internal
   */
  async matchKeyForEIP712(k: IKey): Promise<boolean> {
    return (
      intersect(k.meta?.algorithms ?? [], ['eth_signTypedData', 'EthereumEip712Signature2021']).length > 0
    )
  }
}
