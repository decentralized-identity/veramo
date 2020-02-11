import { AbstractIdentityProvider, AbstractIdentity } from 'daf-core'
import { RNUportHDSigner, getSignerForHDPath } from 'react-native-uport-signer'

import Debug from 'debug'
const debug = Debug('daf:ethr-did-react-native:identity-provider')

// ANDROID OPTIONS
//
// `singleprompt` - Prompt is only asked once per session or period of time
// `prompt`       - Prompt every time
// `simple`       - Not hardware protected but you don't loose your key if you change pin
// `cloud`        - Backed up in some cloud storage

const DEFAULT_LEVEL = 'simple'
const SHOW_SEED_PROMPT = 'Do you want to reveal seed phrase?'

type level = 'singleprompt' | 'prompt' | 'simple' | 'cloud'

export class Identity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly sign: any

  constructor(options: { identityProviderType: string; did: string; sign: any }) {
    super()
    this.did = options.did
    this.identityProviderType = options.identityProviderType
    this.sign = options.sign
  }

  public signer(keyId?: string) {
    return this.sign
  }

  async didDoc() {
    return Promise.reject('not implemented')
  }
  async encrypt(): Promise<any> {
    return Promise.reject('not implemented')
  }
  async decrypt(): Promise<any> {
    return Promise.reject('not implemented')
  }
}

export class IdentityProvider extends AbstractIdentityProvider {
  type = 'rnEthr'
  description = 'Ethr identities backed by native signer'
  private level: level

  constructor(securityLevel?: level) {
    super()
    this.level = securityLevel || DEFAULT_LEVEL
  }

  identityFromAddress(address: string): Identity {
    return new Identity({
      did: this.didFromAddress(address),
      sign: getSignerForHDPath(address) as any,
      identityProviderType: this.type,
    })
  }

  didFromAddress(address: string): string {
    return 'did:ethr:' + address
  }

  async getIdentities() {
    const addresses = await RNUportHDSigner.listSeedAddresses()
    return addresses.map(this.identityFromAddress.bind(this)) as Identity[]
  }

  async createIdentity() {
    const { address } = await RNUportHDSigner.createSeed(this.level)
    const did = this.didFromAddress(address)
    debug('Created', did)
    return this.identityFromAddress(address)
  }

  async deleteIdentity(did: string) {
    const address = did.slice(9)
    try {
      const result = await RNUportHDSigner.deleteSeed(address)
      debug('Deleted', did)
      return true
    } catch (e) {
      debug(e)
      return false
    }
  }

  async getIdentity(did: string) {
    const address = did.slice(9)
    return this.identityFromAddress(address)
  }

  async importIdentity(seed: string) {
    const { address } = await RNUportHDSigner.importSeed(seed, this.level)
    const identity = this.identityFromAddress(address)
    debug('Imported %s', identity.did)
    return identity
  }

  async exportIdentity(did: string) {
    const address = did.slice(9)
    return await RNUportHDSigner.showSeed(address, SHOW_SEED_PROMPT)
  }
}
