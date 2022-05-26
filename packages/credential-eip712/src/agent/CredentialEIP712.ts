import {
  IAgentPlugin,
  VerifiableCredential,
  CredentialPayload,
} from "@veramo/core"
import {
  _ExtendedIKey,
  extractIssuer,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
  resolveDidOrThrow,
  mapIdentifierKeysToDoc
} from "@veramo/utils"
import { schema } from '../index'

import {
  ICreateVerifiableCredentialEIP712Args,
  ICredentialIssuerEIP712,
  IRequiredContext,
} from '../types/ICredentialEIP712'

import { getEthTypesFromInputDoc } from "../utils/getEthTypesFromInputDoc";

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

    const didDocument = await resolveDidOrThrow(issuer, context);

    const chainId = didDocument.verificationMethod![0].blockchainAccountId?.split(":").slice(-1)[0];

    const message = credential;
    const domain = {
      chainId,
      name: "VerifiableCredential",
      version: "1",
    };

    const types = getEthTypesFromInputDoc(message, "VerifiableCredential");

    let keyRef = args.keyRef

    const identifier = await context.agent.didManagerGet({ did: issuer })
    if(!keyRef) {
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' && k.meta?.algorithms?.includes('eth_signTypedData'))
      if (!key) throw Error('No signing key for ' + identifier.did)
      keyRef = key.kid
    }

    const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
    const extendedKey = extendedKeys.find(key => key.kid === keyRef)

    const data = JSON.stringify({domain, types, message})
    const signature = await context.agent.keyManagerSign({ keyRef, data, algorithm: 'eth_signTypedData' })
    
    const newObj = JSON.parse(JSON.stringify(message));

    newObj.proof = {
      verificationMethod: extendedKey?.meta.verificationMethod.id,
      created: issuanceDate,
      proofPurpose: "assertionMethod",
      type: "EthereumEip712Signature2021",
    }

    newObj.proof.proofValue = signature;

    newObj.proof.eip712Domain = {
      domain,
      messageSchema: types,
      primaryType: "VerifiableCredential",
    };

    return newObj;
  }
}
