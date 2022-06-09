import { ContextDoc } from './types'

async function _read(_path: string): Promise<ContextDoc> {
  return await import('./contexts/' + _path);
}

/**
 * Provides a hardcoded map of common Linked Data `@context` definitions.
 *
 * You can use this to bootstrap the `@context` definitions used by
 * {@link @veramo/credential-ld#CredentialIssuerLD | CredentialIssuerLD} with these common context definitions.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const LdDefaultContexts = new Map([
  ['https://www.w3.org/2018/credentials/v1', _read('www.w3.org_2018_credentials_v1.json')],
  ['https://www.w3.org/ns/did/v1', _read('www.w3.org_ns_did_v1.json')],
  ['https://w3id.org/security/v1', _read('w3id.org_security_v1.json')],
  ['https://w3id.org/security/v2', _read('w3id.org_security_v2.json')],
  ['https://w3id.org/security/v3-unstable', _read('w3id.org_security_v3-unstable.json')],
  ['https://w3id.org/security/suites/ed25519-2018/v1', _read('w3id.org_security_suites_ed25519-2018_v1.json')],
  ['https://w3id.org/security/suites/x25519-2019/v1', _read('w3id.org_security_suites_x25519-2019_v1.json')],
  // ['https://w3id.org/did/v0.11', _read('did_v0.11.json')],
  // ['https://veramo.io/contexts/socialmedia/v1', _read('socialmedia-v1.json')],
  // ['https://veramo.io/contexts/kyc/v1', _read('kyc-v1.json')],
  ['https://veramo.io/contexts/profile/v1', _read('veramo.io_contexts_profile_v1.json')],
  // ['https://ns.did.ai/transmute/v1', _read('transmute_v1.json')],
  ['https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld', _read('lds-ecdsa-secp256k1-recovery2020-0.0.json')],
  ['https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld', _read('w3id.org_security_suites_secp256k1recovery-2020_v2.json')],
  ['https://w3id.org/security/suites/secp256k1recovery-2020/v2', _read('w3id.org_security_suites_secp256k1recovery-2020_v2.json')],
  // ['https://w3id.org/security/suites/ed25519-2018/v1', _read('ed25519-signature-2018-v1.json')],
  // ['https://w3id.org/security/suites/x25519-2019/v1', _read('X25519KeyAgreementKey2019.json')],
])
