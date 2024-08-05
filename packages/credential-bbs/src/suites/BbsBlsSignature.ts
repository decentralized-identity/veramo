import { hexToBytes, bytesToBase58, asArray, intersect } from '@veramo/utils'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import { BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair } from '@mattrglobal/jsonld-signatures-bbs'
import { RequiredAgentMethods, VeramoBbsSignature } from '../bbs-suites.js'

export class VeramoBbsBlsSignature extends VeramoBbsSignature {
  getSupportedVerificationType(): string[] {
    return ['Bls12381G2']
  }

  getSupportedProofType(): string {
    return 'BbsBlsSignature2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Bls12381G2'
  }

  getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any {

    let _pk58 = bytesToBase58(hexToBytes(key.privateKeyHex ?? ''))
    let _ppu58 = bytesToBase58(hexToBytes(key.publicKeyHex))

    let keyPairOptions = {
      "id": verificationMethodId,
      "controller": issuerDid,
      "privateKeyBase58": _pk58,
      "publicKeyBase58": _ppu58
    }

    const keyPair = new Bls12381G2KeyPair(keyPairOptions)
    return new BbsBlsSignature2020({ key: keyPair });
  }

  getSuiteForVerification(): any {
    return new BbsBlsSignature2020()
  }

  getSuiteForProof2020Verification(): any {
    return new BbsBlsSignatureProof2020()
  }

  preSigningCredModification(credential: CredentialPayload): void {
    // nothing to do here
  }

  async preDidResolutionModification(didUrl: string, didDoc: DIDDocument): Promise<any> {
    if (didUrl.toLowerCase().startsWith('did:ethr') && didUrl.indexOf("#") >= 1) {
      let vms = didDoc.verificationMethod?.filter((x) => x.id == didUrl)
      if (vms?.length == 1) {
        const vm = vms[0]
        if (vm.publicKeyHex && vm.type.toLowerCase().includes(this.getSupportedVeramoKeyType().toLocaleLowerCase()) && vm.publicKeyHex) {

          return {
            "id": vm.id,
            "controller": vm.controller,
            "publicKeyBase58": bytesToBase58(hexToBytes(vm.publicKeyHex))
          }
        }
      }
      else {
        throw new Error(`The identifier does not have keys of type ${this.getSupportedVeramoKeyType()}`)
      }
    }
    else {
      const ctx = asArray(didDoc['@context'])
      const legacyContext =
        'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld'
      const unstableContext = 'https://w3id.org/security/v3-unstable'

      //  Old did:ethr resolvers would return a broken context link
      const idx = ctx.indexOf(legacyContext)
      if (idx !== -1) {
        ctx[idx] = this.getContext()
      }

      // this verification suite does not support both https://w3id.org/security/suites/secp256k1recovery-2020/v2 and
      // https://w3id.org/security/v3-unstable as DID document @context, complaining that the `blockchainAccountId` is
      // being redefined.
      if (intersect(ctx, [unstableContext, this.getContext()]).length == 2) {
        ctx.splice(ctx.indexOf(unstableContext), 1)
      }
      didDoc['@context'] = ctx

      if (didUrl.toLowerCase().startsWith('did:ethr')) {
        //EcdsaSecp256k1RecoveryMethod2020 does not support older format blockchainAccountId
        didDoc.verificationMethod?.forEach((x) => {
          if (x.blockchainAccountId) {
            if (x.blockchainAccountId.lastIndexOf('@eip155:') !== -1) {
              const [address, chain] = x.blockchainAccountId.split('@eip155:')
              x.blockchainAccountId = `eip155:${chain}:${address}`
            }
          }
        })
      }
    }
    return didDoc

  }
  getContext(): string {
    return 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'
  }
}


