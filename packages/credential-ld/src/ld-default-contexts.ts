import contextCredentialV1 from './contexts/www.w3.org_2018_credentials_v1.json' assert { type: 'json' }
import contextCredentialExamplesV1 from './contexts/www.w3.org_2018_credentials_examples_v1.json' assert { type: 'json' }
import contextDidV1 from './contexts/www.w3.org_ns_did_v1.json' assert { type: 'json' }
import contextSecurityV1 from './contexts/w3id.org_security_v1.json' assert { type: 'json' }
import contextSecurityV2 from './contexts/w3id.org_security_v2.json' assert { type: 'json' }
import contextSecurityV3 from './contexts/w3id.org_security_v3-unstable.json' assert { type: 'json' }
import contextSecurityBBSV1 from './contexts/w3id.org_security_bbs_v1.json' assert { type: 'json' }
import contextSuitesEd25519 from './contexts/w3id.org_security_suites_ed25519-2018_v1.json' assert { type: 'json' }
import contextSuitesX25519 from './contexts/w3id.org_security_suites_x25519-2019_v1.json' assert { type: 'json' }
import contextVeramoProfile from './contexts/veramo.io_contexts_profile_v1.json' assert { type: 'json' }
import contextLdsEcdsaSecpRecovery2020_0 from './contexts/lds-ecdsa-secp256k1-recovery2020-0.0.json' assert { type: 'json' }
import contextSuitesSecp256k1Recovery2020 from './contexts/w3id.org_security_suites_secp256k1recovery-2020_v2.json' assert { type: 'json' }
import contextSuitesEd25519_2020 from './contexts/w3id.org_security_suites_ed25519-2020-v1.json' assert { type: 'json' }
import contextSuitesX25519_2020 from './contexts/w3id.org_security_suites_x25519-2020_v1.json' assert { type: 'json' }
import contextSuitesJws_2020 from './contexts/w3id.org_security_suites_jws-2020_v1.json' assert { type: 'json' }
import contextSuiteEip712 from './contexts/w3id.org_security_suites_eip712sig-2021_v1.json' assert { type: 'json' }
import schema_org from './contexts/schema.org.json' assert { type: 'json' }

/**
 * Provides a hardcoded map of common Linked Data `@context` definitions.
 *
 * You can use this to bootstrap the `@context` definitions used by
 * {@link @veramo/credential-ld#CredentialIssuerLD | CredentialIssuerLD} with these common context definitions.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
// @ts-ignore
export const LdDefaultContexts = new Map([
  ['https://www.w3.org/2018/credentials/v1', contextCredentialV1],
  ['https://www.w3.org/2018/credentials/examples/v1', contextCredentialExamplesV1],
  ['https://www.w3.org/ns/did/v1', contextDidV1],
  ['https://w3id.org/did/v1', contextDidV1], //legacy
  ['https://w3id.org/security/v1', contextSecurityV1],
  ['https://w3id.org/security/v2', contextSecurityV2],
  ['https://w3id.org/security/v3-unstable', contextSecurityV3],
  ['https://w3id.org/security/bbs/v1', contextSecurityBBSV1],
  ['https://w3id.org/security/suites/ed25519-2018/v1', contextSuitesEd25519],
  ['https://w3id.org/security/suites/x25519-2019/v1', contextSuitesX25519],
  ['https://w3id.org/security/suites/ed25519-2020/v1', contextSuitesEd25519_2020],
  ['https://w3id.org/security/suites/x25519-2020/v1', contextSuitesX25519_2020],
  ['https://w3id.org/security/suites/jws-2020/v1', contextSuitesJws_2020],
  ['https://veramo.io/contexts/profile/v1', contextVeramoProfile],
  [
    'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld', //legacy
    contextLdsEcdsaSecpRecovery2020_0,
  ],
  [
    'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld',
    contextSuitesSecp256k1Recovery2020,
  ],
  ['https://w3id.org/security/suites/secp256k1recovery-2020/v2', contextSuitesSecp256k1Recovery2020],
  ['https://w3id.org/security/suites/eip712sig-2021', contextSuiteEip712],
  ['https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/', contextSuiteEip712],
  ['https://w3id.org/security/suites/eip712sig-2021/v1', contextSuiteEip712],
  ['https://schema.org', schema_org],
])
