import {
  CredentialPayload,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICanIssueCredentialTypeArgs,
  IIdentifier,
  IKey,
  IssuerAgentContext,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  ICreateVerifiablePresentationArgs,
  IVerifyCredentialArgs,
  IVerifyResult,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
  IVerifyPresentationArgs,
  VerifierAgentContext,
  ICredentialPlugin,
  IAgentContext,
  ICanVerifyDocumentTypeArgs,
  ICredentialHandler,
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

import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'

import { getEthTypesFromInputDoc } from 'eip-712-types-generation'

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerEIP712} methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialIssuerEIP712 implements ICredentialHandler {

  async matchKeyForType(key: IKey, context: IssuerAgentContext): Promise<boolean> {
    return this.matchKeyForEIP712(key)
  }

  async getTypeProofFormat(): Promise<string> {
    return Promise.resolve('EthereumEip712Signature2021')
  }

  async canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IssuerAgentContext): Promise<boolean> {
    return Promise.resolve(args.proofFormat === 'EthereumEip712Signature2021')
  }

  async canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs, context: IssuerAgentContext): Promise<boolean> {
    const { document } = args
    return Promise.resolve((<VerifiableCredential>document)?.proof?.type === 'EthereumEip712Signature2021')
  }

  async listUsableProofFormats(identifier: IIdentifier, context: IAgentContext<{}>): Promise<Array<string>> {
    throw new Error('Method not implemented.')
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiableCredential} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
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

  /** {@inheritdoc ICredentialIssuer.verifyCredential} */
  async verifyCredential(
    args: IVerifyCredentialArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    const credential = args.credential as VerifiableCredential
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
      signature: proofValue!,
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
          return {
            verified: true,
          }
        }
      }
    } else {
      throw new Error('resolver_error: issuer DIDDocument does not contain any verificationMethods')
    }

    return {
      verified: false,
      error: {
        message: 'invalid_signature: The signature does not match any of the issuer signing keys',
        errorCode: 'invalid_signature',
      }
    }
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiablePresentation} */
  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IssuerAgentContext,
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

  /** {@inheritdoc ICredentialIssuer.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    const presentation = args.presentation as VerifiablePresentation
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
      signature: proofValue!,
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
          return {
            verified: true,
          }
        }
      }
    } else {
      throw new Error('resolver_error: holder DIDDocument does not contain any verificationMethods')
    }

    return {
      verified: false,
      error: {
        message: 'invalid_signature: The signature does not match any of the holder signing keys',
        errorCode: 'invalid_signature',
      }
    }
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
