import { RequiredAgentMethods, VeramoLdSignature } from "../ld-suites";
import { DIDDocument, IAgentContext, IIdentifier, IKey, TKeyType } from "@veramo/core";
import {
  EcdsaSecp256k1RecoveryMethod2020,
  EcdsaSecp256k1RecoverySignature2020,
} from '@transmute/lds-ecdsa-secp256k1-recovery2020'
import { CredentialPayload } from 'did-jwt-vc'

import * as u8a from 'uint8arrays'
import { encodeJoseBlob } from '@veramo/utils'

export class VeramoEcdsaSecp256k1RecoverySignature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Secp256k1'
  }

  getSuiteForSigning(key: IKey, identifier: IIdentifier, context: IAgentContext<RequiredAgentMethods>): any {
    const controller = identifier.did

    const signer = {
      //returns a JWS detached
      sign: async (args: { data: Uint8Array }): Promise<string> => {
        const header = {
          alg: 'ES256K-R',
          b64: false,
          crit: ['b64'],
        }
        const headerString = encodeJoseBlob(header)
        const messageBuffer = u8a.concat([u8a.fromString(`${headerString}.`, 'utf-8'), args.data])
        const messageString = u8a.toString(messageBuffer, 'base64')
        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          algorithm: 'ES256K-R',
          data: messageString,
          encoding: 'base64',
        })
        return `${headerString}..${signature}`
      },
    }

    return new EcdsaSecp256k1RecoverySignature2020({
      // signer,
      key: new EcdsaSecp256k1RecoveryMethod2020({
        publicKeyHex: key.publicKeyHex,
        signer: () => signer,
        type: this.getSupportedVerificationType(),
        controller,
        id: `${controller}#controller`, // FIXME: Only default controller verificationMethod supported
      }),
    })
  }

  getSuiteForVerification(): any {
    return new EcdsaSecp256k1RecoverySignature2020()
  }

  preSigningCredModification(credential: Partial<CredentialPayload>): void {
    if (!Array.isArray(credential['@context'])) {
      credential['@context'] = []
    }
    credential['@context'].push(
      'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld',
    )
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
    // specific resolution modifications
    // did:ethr
    if (didUrl.toLowerCase().startsWith('did:ethr')) {
      didDoc.assertionMethod = []
      // TODO: EcdsaSecp256k1RecoveryMethod2020 does not support blockchainAccountId
      // blockchainAccountId to ethereumAddress
      didDoc.verificationMethod?.forEach((x) => {
        if (x.blockchainAccountId) {
          x.ethereumAddress = x.blockchainAccountId.substring(0, x.blockchainAccountId.lastIndexOf('@'))
        }

        // TODO: Verification method \"did:ethr:rinkeby:0x99b5bcc24ac2701d763aac0a8466ac51a189501b#controller\" not authorized by controller for proof purpose \"assertionMethod\"."
        // @ts-ignore
        didDoc.assertionMethod.push(x.id)
      })
    }
  }
}