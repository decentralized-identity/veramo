import { KeyPair } from 'daf-core'

export const webDidDocFromEthrDid = (ethrDid: string, hostname: string, keyPair: KeyPair) => ({
  '@context': 'https://w3id.org/did/v1',
  id: `did:web:${hostname}`,
  publicKey: [
    {
      id: `did:web:${hostname}#owner`,
      type: 'Secp256k1VerificationKey2018',
      owner: `did:web:${hostname}`,
      ethereumAddress: ethrDid.slice(9),
    },
    {
      id: `did:web:${hostname}#enc`,
      type: 'Curve25519EncryptionPublicKey',
      owner: `did:web:${hostname}`,
      publicKeyHex: keyPair.publicKeyHex,
    },
  ],
  authentication: [
    {
      type: 'Secp256k1SignatureAuthentication2018',
      publicKey: `did:web:${hostname}#owner`,
    },
  ],
  service: [
    {
      id: `did:web:${hostname}#messages`,
      type: 'MessagingService',
      serviceEndpoint: `https://${hostname}/didcomm`,
    },
    // {
    //   id: `did:web:${hostname}#trustgraph`,
    //   type: 'TrustGraph',
    //   serviceEndpoint: `https://mouro.eu.ngrok.io/graphql`,
    // },
    // {
    //   id: `did:web:${hostname}#trustgraphws`,
    //   type: 'TrustGraphWs',
    //   serviceEndpoint: `wss://mouro.eu.ngrok.io/graphql`,
    // },
  ],
})
