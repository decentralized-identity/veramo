import { Entities } from 'daf-core'
import { createConnection } from 'typeorm'

// Create database connection
const dbConnection = createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: true,
  entities: Entities,
})

// We will be using 'did:ethr' identities
import { IdentityProvider } from 'daf-ethr-did'

// SecretBox will encrypt/decrypt private keys in key store
import { SecretBox } from 'daf-libsodium'

// Generate this by running `npx daf-cli crypto -s`
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const secretBox = new SecretBox(secretKey)

// Storing serialized key pairs in the file system
import { KeyStore } from 'daf-core'
const keyStore = new KeyStore(dbConnection, secretBox)

// KeyManagementSystem is responsible for managing encryption and signing keys
import { KeyManagementSystem } from 'daf-libsodium'
const kms = new KeyManagementSystem(keyStore)

// Storing serialized identities in the file system
import { IdentityStore } from 'daf-core'
const identityStore = new IdentityStore('rinkeby-ethr', dbConnection)

// Infura is being used to access Ethereum blockchain. https://infura.io
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

// Injecting required dependencies, and specifying which blockchain to use and how to access it
const rinkebyIdentityProvider = new IdentityProvider({
  kms,
  identityStore,
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
})

// Using local DID Document resolver. It is being used internally to
/// validate messages and to get information about service endpoints
import { DafResolver } from 'daf-resolver'
const didResolver = new DafResolver({ infuraProjectId })

// Setting up Message Validator Chain
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler } from 'daf-w3c'
const messageHandler = new JwtMessageHandler()
messageHandler.setNext(new W3cMessageHandler())

// Setting up Action Handler Chain
import { DIDCommActionHandler } from 'daf-did-comm'
import { TrustGraphActionHandler } from 'daf-trust-graph'
import { W3cActionHandler } from 'daf-w3c'
const actionHandler = new W3cActionHandler()
actionHandler.setNext(new DIDCommActionHandler()).setNext(new TrustGraphActionHandler())

// Initializing the Core by injecting dependencies
import { Agent } from 'daf-core'
export const agent = new Agent({
  didResolver,
  identityProviders: [rinkebyIdentityProvider],
  actionHandler,
  messageHandler,
})
