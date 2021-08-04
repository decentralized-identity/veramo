import { IIdentifier, IKey, TKeyType } from '@veramo/core'
import { Ed25519Signature2018, Ed25519VerificationKey2018 } from '@transmute/ed25519-signature-2018'
import { CredentialPayload, PresentationPayload } from 'did-jwt-vc'
import { DIDDocument } from 'did-resolver/src/resolver'
const { EcdsaSecp256k1RecoveryMethod2020, EcdsaSecp256k1RecoverySignature2020 } = require('EcdsaSecp256k1RecoverySignature2020')


export abstract class VeramoLdSignature {

  // LinkedDataSignature Suites according to
  // https://github.com/digitalbazaar/jsonld-signatures/blob/main/lib/suites/LinkedDataSignature.js
  // Add type definition as soon as https://github.com/digitalbazaar/jsonld-signatures
  // supports those.

  abstract getSupportedVerificationType(): string;

  abstract getSupportedVeramoKeyType(): TKeyType;

  abstract getSuiteForSigning(key: IKey, identifier: IIdentifier): any;

  abstract getSuiteForVerification(): any;

  abstract preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void;

  abstract preSigningCredModification(credential: Partial<CredentialPayload>): void;

  preSigningPresModification(presentation: Partial<PresentationPayload>): void {
    // TODO: Remove invalid field 'verifiers' from Presentation. Needs to be adapted for LD credentials
    // Only remove empty array (vc.signPresentation will throw then)
    const sanitizedPresentation = presentation as any
    if (sanitizedPresentation.verifier.length == 0) {
      delete sanitizedPresentation.verifier
    }
  }
}


export class VeramoEcdsaSecp256k1RecoverySignature2020 extends VeramoLdSignature {

  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Secp256k1'
  }

  getSuiteForSigning(key: IKey, identifier: IIdentifier): any {
    const controller = identifier.did

    return new EcdsaSecp256k1RecoverySignature2020({
      key: new EcdsaSecp256k1RecoveryMethod2020({
        publicKeyHex: key.publicKeyHex,
        privateKeyHex: key.privateKeyHex,
        type: this.getSupportedVerificationType(),
        controller,
        id: `${controller}#controller` // TODO: Only default controller verificationMethod supported
      }),
    });
  }

  getSuiteForVerification(): any {
    return new EcdsaSecp256k1RecoverySignature2020()
  }

  preSigningCredModification(credential: Partial<CredentialPayload>): void {
    if (!Array.isArray(credential['@context'])) {
      credential['@context'] = []
    }
    credential['@context'].push('https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld')
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
    // specific resolution modifications
    // did:ethr
    if (didUrl.toLowerCase().startsWith('did:ethr')) {
      didDoc.assertionMethod = []
      // TODO: EcdsaSecp256k1RecoveryMethod2020 does not support blockchainAccountId
      // blockchainAccountId to ethereumAddress
      didDoc.verificationMethod?.forEach(x => {
        if (x.blockchainAccountId) {
          x.ethereumAddress = x.blockchainAccountId.substring(0, x.blockchainAccountId.lastIndexOf("@"))
        }

        // TODO: Verification method \"did:ethr:rinkeby:0x99b5bcc24ac2701d763aac0a8466ac51a189501b#controller\" not authorized by controller for proof purpose \"assertionMethod\"."
        // @ts-ignore
        didDoc.assertionMethod.push(x.id)
      })
    }
  }

}

export class VeramoEd25519Signature2018 extends VeramoLdSignature {

  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Ed25519'
  }

  getSuiteForSigning(key: IKey, identifier: IIdentifier): any {
    if (!key.privateKeyHex) {
      throw Error('No private Key for LD Signing available.')
    }

    const controller = identifier.did

    // DID Key ID
    let id = `${controller}#controller`
    // TODO: Hacky id adjustment
    if (controller.startsWith('did:key')) {
      id = `${controller}#${controller.substring(controller.lastIndexOf(':') + 1)}`
    }


    return new Ed25519Signature2018({
      key: new Ed25519VerificationKey2018({
        id,
        controller,
        publicKey: Buffer.from(key.publicKeyHex, 'hex'),
        privateKey: Buffer.from(key.privateKeyHex, 'hex'),
      })
    });
  }

  getSuiteForVerification(): any {
    return new Ed25519Signature2018();
  }

  preSigningCredModification(credential: Partial<CredentialPayload>): void {
    // nothing to do here
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
    // nothing to do here
  }

}