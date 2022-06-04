declare module '@digitalcredentials/jsonld'
declare module '@digitalcredentials/jsonld-signatures'
declare module '@digitalcredentials/vc'
declare module '@transmute/lds-ecdsa-secp256k1-recovery2020'

declare module "*.json" {
  const content: any;
  export default content;
}