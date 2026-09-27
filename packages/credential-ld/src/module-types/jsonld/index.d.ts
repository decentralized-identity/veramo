declare module 'jsonld-signatures'
declare module '@digitalbazaar/vc'
declare module '@digitalbazaar/ed25519-signature-2020'
declare module '@digitalbazaar/ed25519-verification-key-2020'

declare module "*.json" {
  const content: any;
  export default content;
}
