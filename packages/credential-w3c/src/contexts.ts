
import * as fs from 'fs';
import * as path from 'path';

function _read(_path: string) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, _path),
      {encoding: 'utf8'}));
}

const contexts = new Map([
  ['https://veramo.io/contexts/socialmedia/v1', _read('./contexts/socialmedia-v1.jsonld')],
  ['https://www.w3.org/ns/did/v1', _read('./contexts/security_context_v1.jsonld')],
  ['https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld', _read('./contexts/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld')]
]);

export default contexts;
