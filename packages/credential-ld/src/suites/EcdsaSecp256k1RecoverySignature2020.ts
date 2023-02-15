import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import ldsEcdsa from '@veramo-community/lds-ecdsa-secp256k1-recovery2020'
const {
  EcdsaSecp256k1RecoveryMethod2020,
  EcdsaSecp256k1RecoverySignature2020,
} = ldsEcdsa
import * as u8a from 'uint8arrays'
import { asArray, encodeJoseBlob } from '@veramo/utils'

/**
 * Veramo wrapper for the EcdsaSecp256k1RecoverySignature2020 suite by Transmute Industries
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEcdsaSecp256k1RecoverySignature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Secp256k1'
  }

  getSuiteForSigning(
    key: IKey,
    did: string,
    verifiableMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any {
    const controller = did
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

    const suite = new EcdsaSecp256k1RecoverySignature2020({
      // signer,
      key: new EcdsaSecp256k1RecoveryMethod2020({
        publicKeyHex: key.publicKeyHex,
        signer: () => signer,
        type: this.getSupportedVerificationType(),
        controller,
        id: verifiableMethodId,
      }),
    })

    suite.ensureSuiteContext = ({ document }: { document: any, addSuiteContext: boolean }) => {
      document['@context'] = [...asArray(document['@context'] || []), this.getContext()]
    }

    return suite
  }

  getSuiteForVerification(): any {
    return new EcdsaSecp256k1RecoverySignature2020()
  }

  preSigningCredModification(credential: CredentialPayload): void {
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
//    did:ethr
    const idx = didDoc['@context']?.indexOf('https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld') || -1
    if (Array.isArray(didDoc['@context']) && idx !== -1) {
      didDoc['@context'][idx] = this.getContext()
    }

    if (didUrl.toLowerCase().startsWith('did:ethr')) {
      //EcdsaSecp256k1RecoveryMethod2020 does not support older format blockchainAccountId
      didDoc.verificationMethod?.forEach((x) => {
        if (x.blockchainAccountId) {
          if (x.blockchainAccountId.lastIndexOf('@eip155:') !== -1) {
            const [ address, chain ] = x.blockchainAccountId.split("@eip155:")
            x.blockchainAccountId = `eip155:${chain}:${address}`
          }
        }
      })
    }
  }
  getContext(): string {
    return 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'
  }
}
