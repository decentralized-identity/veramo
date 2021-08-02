import localContexts from './contexts'
import {
  IAgentContext,
  IIdentifier,
  IKey, IResolver,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'

import Debug from 'debug'

const { purposes: { AssertionProofPurpose }} = require("jsonld-signatures");
const vc = require('vc-js');
const { defaultDocumentLoader } = vc;
const {extendContextLoader} = require('jsonld-signatures');
const {EcdsaSecp256k1RecoveryMethod2020, EcdsaSecp256k1RecoverySignature2020} = require('EcdsaSecp256k1RecoverySignature2020')
import {Ed25519Signature2018, Ed25519VerificationKey2018} from '@transmute/ed25519-signature-2018'
import { IContext, IVerifyVerifiablePresentationArgs } from './action-handler'
import { CredentialPayload, PresentationPayload } from 'did-jwt-vc'

const debug = Debug('veramo:w3c:ld-credential-module')

export class LdCredentialModule {

  /**
   * TODO: General Implementation Notes
   * - (SOLVED) EcdsaSecp256k1Signature2019 (Signature) and EcdsaSecp256k1VerificationKey2019 (Key)
   * are not useable right now, since they are not able to work with blockChainId and ECRecover.
   * - DID Fragement Resolution.
   * - Key Manager and Verification Methods: Veramo currently implements no link between those.
   */

  getDocumentLoader(context: IAgentContext<IResolver>) {
    return extendContextLoader(async (url: string) => {
      // console.log(`resolving context for: ${url}`)

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        const didDoc = await context.agent.resolveDid({ didUrl: url })
        let returnDocument = didDoc.didDocument

        if (!returnDocument) return

        // specific resolution modifications
        // did:ethr
        if (url.toLowerCase().startsWith('did:ethr')) {
          returnDocument.assertionMethod = []
          // TODO: EcdsaSecp256k1RecoveryMethod2020 does not support blockchainAccountId
          // blockchainAccountId to ethereumAddress
          returnDocument.verificationMethod?.forEach(x => {
            if (x.blockchainAccountId) {
              x.ethereumAddress = x.blockchainAccountId.substring(0, x.blockchainAccountId.lastIndexOf("@"))
            }

            // TODO: Verification method \"did:ethr:rinkeby:0x99b5bcc24ac2701d763aac0a8466ac51a189501b#controller\" not authorized by controller for proof purpose \"assertionMethod\"."
            // @ts-ignore
            returnDocument.assertionMethod.push(x.id)
          })
        }

        // did:key
        if (url.toLowerCase().startsWith('did:key')) {
          // TODO: Fix the strange id naming in did:key. make sure its ${}#controller
          // let newId = '';
          // returnDocument.publicKey?.forEach(x => {
          //   newId = `${x.id.substring(0, x.id.lastIndexOf("#"))}#controller`
          //   x.id = newId
          // })
          //
          // returnDocument.assertionMethod = [ newId ]
          // returnDocument.verificationMethod = returnDocument.publicKey
          // console.log(`Returning from Documentloader: ${JSON.stringify(returnDocument)}`)
        }


        // console.log(`Returning from Documentloader: ${JSON.stringify(returnDocument)}`)
        return {
          contextUrl: null,
          documentUrl: url,
          document: returnDocument
        };
      }

      if (localContexts.has(url)) {
        // console.log(`Returning local context for: ${url}`)
        return {
          contextUrl: null,
          documentUrl: url,
          document: localContexts.get(url)
        };
      }

      debug('WARNING: Possible unknown context/identifier for', url)
      console.log(`WARNING: Possible unknown context/identifier for: ${url}`)

      return defaultDocumentLoader(url);
    });
  }

  getLDSigningSuite(key: IKey, identifier: IIdentifier) {
    let suite
    const controller = identifier.did

    if (!key.privateKeyHex) {
      throw Error('No private Key for LD Signing available.')
    }

    switch(key.type) {
      case 'Secp256k1':
        suite = new EcdsaSecp256k1RecoverySignature2020({
          key: new EcdsaSecp256k1RecoveryMethod2020({
            publicKeyHex: key.publicKeyHex,
            privateKeyHex: key.privateKeyHex,
            type: 'EcdsaSecp256k1RecoveryMethod2020', // A little verbose?
            controller,
            id: `${controller}#controller` // TODO: Only default controller verificationMethod supported
          }),
        });
        break;
      case 'Ed25519':
        // DID Key ID
        let id = `${controller}#controller`
        // TODO: Hacky id adjustment
        if (controller.startsWith('did:key')) {
          id = `${controller}#${controller.substring(controller.lastIndexOf(':') + 1)}`
        }


        suite = new Ed25519Signature2018({
          key: new Ed25519VerificationKey2018({
            id,
            controller,
            publicKey: Buffer.from(key.publicKeyHex, 'hex'),
            privateKey: Buffer.from(key.privateKeyHex, 'hex'),
          })
        });
        break;
      default:
        throw new Error(`Unknown key type ${key.type}.`);
    }

    return suite
  }

  async issueLDVerifiableCredential(
    credential: Partial<CredentialPayload>,
    key: IKey,
    identifier: IIdentifier,
    context: IAgentContext<IResolver>): Promise<VerifiableCredential> {

    const suite = this.getLDSigningSuite(key, identifier)
    const documentLoader = this.getDocumentLoader(context)

    // some suites are missing the right contexts
    // TODO: How to generalize this?
    switch (suite.type) {
      case "EcdsaSecp256k1RecoverySignature2020":
        // console.log(`Adding context to credential ${suite.type}`)
        if (!Array.isArray(credential['@context'])) {
          credential['@context'] = []
        }
        credential['@context'].push('https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld')
        break
      default:
    }

    return await vc.issue({
      credential,
      suite,
      documentLoader,
      compactProof: false
    });
  }

  async signLDVerifiablePresentation(
    presentation: Partial<PresentationPayload>,
    key: IKey,
    challenge: string | undefined,
    domain: string | undefined,
    identifier: IIdentifier,
    context: IAgentContext<IResolver>,
  ): Promise<VerifiablePresentation> {

    const suite = this.getLDSigningSuite(key, identifier)
    const documentLoader = this.getDocumentLoader(context)

    // TODO: Remove invalid field 'verifiers' from Presentation. Needs to be adapted for LD credentials
    // Only remove empty array (vc.signPresentation will throw then)
    const sanitizedPresentation = presentation as any
    if (sanitizedPresentation.verifier.length == 0) {
      delete sanitizedPresentation.verifier
    }


    return await vc.signPresentation({
      presentation: sanitizedPresentation,
      suite,
      challenge,
      domain,
      documentLoader,
      purpose: new AssertionProofPurpose(),
      compactProof: false
    })
  }

  async verifyVerifiableCredential(
    credential: Partial<CredentialPayload>,
    context: IAgentContext<IResolver>
  ): Promise<boolean> {

    const result = await vc.verifyCredential({
      credential,
      suite: [new EcdsaSecp256k1RecoverySignature2020(), new Ed25519Signature2018()],
      documentLoader: this.getDocumentLoader(context),
      purpose: new AssertionProofPurpose(),
      compactProof: false
    });

    if (result.verified)
      return true

    // NOT verified.

    // result can include raw Error
    console.log(`Error verifying LD Verifiable Credential`)
    console.log(JSON.stringify(result, null, 2));
    throw Error('Error verifying LD Verifiable Credential')
  }

  async verifyVerifiablePresentation(
    presentation: Partial<PresentationPayload>,
    challenge: string | undefined,
    domain: string | undefined,
    context: IAgentContext<IResolver>
  ): Promise<boolean> {

    const result = await vc.verify({
      presentation,
      suite: [new EcdsaSecp256k1RecoverySignature2020(), new Ed25519Signature2018({})],
      documentLoader: this.getDocumentLoader(context),
      challenge,
      domain,
      purpose: new AssertionProofPurpose(),
      compactProof: false
    });

    if (result.verified)
      return true

    // NOT verified.

    // result can include raw Error
    console.log(`Error verifying LD Verifiable Presentation`)
    console.log(JSON.stringify(result, null, 2));
    throw Error('Error verifying LD Verifiable Presentation')
  }

}
