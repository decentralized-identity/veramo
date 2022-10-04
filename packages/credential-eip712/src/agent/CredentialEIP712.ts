import {
  CredentialPayload,
  IAgentPlugin,
  IIdentifier,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import {
  extractIssuer,
  getChainIdForDidEthr,
  getEthereumAddress,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  processEntryToArray,
  resolveDidOrThrow,
} from '@veramo/utils'
import { schema } from '../index'

import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import {
  ICreateVerifiableCredentialEIP712Args,
  ICreateVerifiablePresentationEIP712Args,
  ICredentialIssuerEIP712,
  IRequiredContext,
  IVerifyCredentialEIP712Args,
  IVerifyPresentationEIP712Args,
} from '../types/ICredentialEIP712'

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

    const issuer = extractIssuer(args.credential)
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

    const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
    const extendedKey = extendedKeys.find((key) => key.kid === keyRef)
    if (!extendedKey)
      throw Error('key_not_found: The signing key is not available in the issuer DID document')

    let chainId = 1
    if (identifier.did.split(':')[1] === 'ethr')
      chainId = getChainIdForDidEthr(extendedKey.meta.verificationMethod)

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
      messageSchema: allTypes,
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
    if (!credential.proof.eip712 || !credential.proof.eip712.messageSchema || !credential.proof.eip712.domain)
      throw new Error('invalid_argument: proof.eip712 is missing expected properties')

    const { proof, ...signingInput } = credential
    const { proofValue, eip712, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const objectToVerify = {
      message: verificationMessage,
      domain: eip712.domain,
      types: eip712.messageSchema,
      primaryType: eip712.primaryType,
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

    const didDocument = await resolveDidOrThrow(issuer, context)

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
      const credentials = args.presentation.verifiableCredential.map((cred) => {
        // map JWT credentials to their canonical form
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return JSON.stringify(cred)
        }
      })
      presentation.verifiableCredential = credentials
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: presentation.holder })
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

    const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
    const extendedKey = extendedKeys.find((key) => key.kid === keyRef)
    if (!extendedKey)
      throw Error('key_not_found: The signing key is not available in the issuer DID document')
    let chainId = 1
    if (identifier.did.split(':')[1] === 'ethr')
      chainId = getChainIdForDidEthr(extendedKey.meta.verificationMethod)
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
      messageSchema: allTypes,
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
    if (
      !presentation.proof.eip712 ||
      !presentation.proof.eip712.messageSchema ||
      !presentation.proof.eip712.domain
    )
      throw new Error('proof.eip712 is undefined')

    const { proof, ...signingInput } = presentation
    const { proofValue, eip712, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const objectToVerify = {
      message: verificationMessage,
      domain: eip712.domain,
      types: eip712.messageSchema,
      primaryType: eip712.primaryType,
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

    const didDocument = await resolveDidOrThrow(issuer, context)

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
}
