import {
  IAgentPlugin,
  VerifiableCredential,
  CredentialPayload,
  VerifiablePresentation,
  PresentationPayload,
  IIdentifier,
} from "@veramo/core"
import {
  _ExtendedIKey,
  extractIssuer,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
  resolveDidOrThrow,
  mapIdentifierKeysToDoc,
  getChainIdForDidEthr,
  getEthereumAddress,
  isDefined
} from "@veramo/utils"
import { schema } from '../index'

import {
  ICreateVerifiableCredentialEIP712Args,
  ICreateVerifiablePresentationEIP712Args,
  ICredentialIssuerEIP712,
  IRequiredContext,
  IVerifyCredentialEIP712Args,
  IVerifyPresentationEIP712Args,
} from '../types/ICredentialEIP712'
import { recoverTypedSignature, normalize, SignTypedDataVersion } from '@metamask/eth-sig-util'

import { getEthTypesFromInputDoc } from "../utils/getEthTypesFromInputDoc"

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerEIP712} methods.
 *
 * @public
 */
export class CredentialIssuerEIP712 implements IAgentPlugin {
  readonly methods: ICredentialIssuerEIP712
  readonly schema = schema.ICredentialIssuer

  constructor() {
    this.methods = {
      createVerifiableCredentialEIP712: this.createVerifiableCredentialEIP712.bind(this),
      createVerifiablePresentationEIP712: this.createVerifiablePresentationEIP712.bind(this),
      verifyCredentialEIP712: this.verifyCredentialEIP712.bind(this),
      verifyPresentationEIP712: this.verifyPresentationEIP712.bind(this)
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
    const credential: CredentialPayload = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
      issuanceDate,
    }

    const issuer = extractIssuer(credential)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: args.credential.issuer must not be empty')
    }

    let keyRef = args.keyRef

    const identifier = await context.agent.didManagerGet({ did: issuer })

    if(!keyRef) {
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' && k.meta?.algorithms?.includes('eth_signTypedData'))
      if (!key) throw Error('No signing key for ' + identifier.did)
      keyRef = key.kid
    }

    const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
    const extendedKey = extendedKeys.find(key => key.kid === keyRef)
    if (!extendedKey) throw Error('Key not found')

    const chainId = getChainIdForDidEthr(extendedKey.meta.verificationMethod)
    
    const message = credential;
    const domain = {
      chainId,
      name: "VerifiableCredential",
      version: "1",
    };

    const types = getEthTypesFromInputDoc(credential, "VerifiableCredential");
    const allTypes = {
      EIP712Domain: [
        // Order of these elements matters!
        // https://github.com/ethers-io/ethers.js/blob/a71f51825571d1ea0fa997c1352d5b4d85643416/packages/hash/src.ts/typed-data.ts#L385            
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      ...types
    }

    const data = JSON.stringify({domain, types, message})

    const signature = await context.agent.keyManagerSign({ keyRef, data, algorithm: 'eth_signTypedData' })

    const newObj = JSON.parse(JSON.stringify(message));

    newObj.proof = {
      verificationMethod: extendedKey.meta.verificationMethod.id,
      created: issuanceDate,
      proofPurpose: "assertionMethod",
      type: "EthereumEip712Signature2021",
    }

    newObj.proof.proofValue = signature;

    newObj.proof.eip712Domain = {
      domain,
      messageSchema: allTypes,
      primaryType: "VerifiableCredential",
    };

    return newObj;
  }

  /** {@inheritdoc ICredentialIssuerEIP712.verifyCredentialEIP712} */
  private async verifyCredentialEIP712(args: IVerifyCredentialEIP712Args, context: IRequiredContext): Promise<boolean> {
    try {
        const { credential } = args
      if(!credential.proof || !credential.proof.proofValue) throw new Error("Proof is undefined")
      if(
        !credential.proof.eip712Domain || 
        !credential.proof.eip712Domain.messageSchema ||
        !credential.proof.eip712Domain.domain 
      ) throw new Error("eip712Domain is undefined");
      
      const { proof, ...signingInput } = credential;
      const { proofValue, eip712Domain, ...verifyInputProof} = proof;
      const verificationMessage = {
        ...signingInput,
        proof: verifyInputProof
      }
  
      const objectToVerify = {
        message: verificationMessage,
        domain: eip712Domain.domain,
        types: eip712Domain.messageSchema,
        primaryType: eip712Domain.primaryType
      }
  
      const recovered = recoverTypedSignature({
        data: objectToVerify,
        signature: proofValue,
        version: SignTypedDataVersion.V4
      })
      
      const issuer = extractIssuer(credential)
      if (!issuer || typeof issuer === 'undefined') {
        throw new Error('invalid_argument: args.credential.issuer must not be empty')
      }
  
      const didDocument = await resolveDidOrThrow(issuer, context);

      if (didDocument.verificationMethod) {
        for(const verificationMethod of didDocument.verificationMethod) {
          if (getEthereumAddress(verificationMethod)?.toLowerCase() === recovered.toLowerCase()) {
            return true
          }
        }
      }

      throw new Error("Recovered Address does not match issuer")
    } catch (e: any) {
      throw new Error(e);
    }
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
  
      if (!isDefined(presentation.holder)) {
        throw new Error('invalid_argument: args.presentation.holder must not be empty')
      }
  
      if (args.presentation.verifiableCredential) {
        const credentials = args.presentation.verifiableCredential.map((cred) => {
          // map JWT credentials to their canonical form
          if (typeof cred !== 'string' && cred.proof.jwt) {
            return cred.proof.jwt
          } else {
            return cred
          }
        })
        presentation.verifiableCredential = credentials
      }
  
      let identifier: IIdentifier
      try {
        identifier = await context.agent.didManagerGet({ did: presentation.holder })
      } catch (e) {
        throw new Error('invalid_argument: args.presentation.holder must be a DID managed by this agent')
      }

      let keyRef = args.keyRef

      if(!keyRef) {
        const key = identifier.keys.find((k) => k.type === 'Secp256k1' && k.meta?.algorithms?.includes('eth_signTypedData'))
        if (!key) throw Error('No signing key for ' + identifier.did)
        keyRef = key.kid
      }

      const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
      const extendedKey = extendedKeys.find(key => key.kid === keyRef)
      if (!extendedKey) throw Error('Key not found')

      const chainId = getChainIdForDidEthr(extendedKey.meta.verificationMethod)
      
      const message = presentation;
      const domain = {
        chainId,
        name: "VerifiablePresentation",
        version: "1",
      };

      const types = getEthTypesFromInputDoc(presentation, "VerifiablePresentation");
      const allTypes = {
        EIP712Domain: [
          // Order of these elements matters!
          // https://github.com/ethers-io/ethers.js/blob/a71f51825571d1ea0fa997c1352d5b4d85643416/packages/hash/src.ts/typed-data.ts#L385            
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        ...types
      }

      const data = JSON.stringify({domain, types, message})

      const signature = await context.agent.keyManagerSign({ keyRef, data, algorithm: 'eth_signTypedData' })

      const newObj = JSON.parse(JSON.stringify(message));

      newObj.proof = {
        verificationMethod: extendedKey.meta.verificationMethod.id,
        created: issuanceDate,
        proofPurpose: "assertionMethod",
        type: "EthereumEip712Signature2021",
      }

      newObj.proof.proofValue = signature;

      newObj.proof.eip712Domain = {
        domain,
        messageSchema: allTypes,
        primaryType: "VerifiablePresentation",
      };

      return newObj;
    }

/** {@inheritdoc ICredentialIssuerEIP712.verifyPresentationEIP712} */
private async verifyPresentationEIP712(args: IVerifyPresentationEIP712Args, context: IRequiredContext): Promise<boolean> {
  try {
      const { presentation } = args
    if(!presentation.proof || !presentation.proof.proofValue) throw new Error("Proof is undefined")
    if(
      !presentation.proof.eip712Domain || 
      !presentation.proof.eip712Domain.messageSchema ||
      !presentation.proof.eip712Domain.domain 
    ) throw new Error("eip712Domain is undefined");
    
    const { proof, ...signingInput } = presentation;
    const { proofValue, eip712Domain, ...verifyInputProof} = proof;
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof
    }

    const objectToVerify = {
      message: verificationMessage,
      domain: eip712Domain.domain,
      types: eip712Domain.messageSchema,
      primaryType: eip712Domain.primaryType
    }

    const recovered = recoverTypedSignature({
      data: objectToVerify,
      signature: proofValue,
      version: SignTypedDataVersion.V4
    })
    
    const issuer = extractIssuer(presentation)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: args.presentation.holder must not be empty')
    }

    const didDocument = await resolveDidOrThrow(issuer, context);

    if (didDocument.verificationMethod) {
      for(const verificationMethod of didDocument.verificationMethod) {
        if (getEthereumAddress(verificationMethod)?.toLowerCase() === recovered.toLowerCase()) {
          return true
        }
      }
    }

    throw new Error("Recovered Address does not match issuer")
  } catch (e: any) {
    throw new Error(e);
  }
}    
}
