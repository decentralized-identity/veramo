import { IdentityController, Issuer } from 'daf-core'
import { RNUportHDSigner, getSignerForHDPath } from 'react-native-uport-signer'

import Debug from 'debug'
const debug = Debug('ethr-did-controller')

// ANDROID OPTIONS
//
// `singleprompt` - Prompt is only asked once per session or period of time
// `prompt`       - Prompt every time
// `simple`       - Not hardware protected but you don't loose your key if you change pin
// `cloud`        - Backed up in some cloud storage

const DEFAULT_LEVEL = 'simple'
const SHOW_SEED_PROMPT = 'Do you want to reveal seed phrase?'

type level = 'singleprompt' | 'prompt' | 'simple' | 'cloud'

class EthrDidRnController implements IdentityController {
  type = 'rnEthr'
  private level: level

  constructor(securityLevel?: level) {
    this.level = securityLevel || DEFAULT_LEVEL
  }

  issuerFromAddress(address: string): Issuer {
    return {
      did: this.didFromAddress(address),
      signer: getSignerForHDPath(address) as any,
      type: this.type,
    }
  }

  didFromAddress(address: string): string {
    return 'did:ethr:' + address
  }

  async listDids() {
    const addresses = await RNUportHDSigner.listSeedAddresses()
    return addresses.map(this.didFromAddress)
  }

  async listIssuers() {
    const addresses = await RNUportHDSigner.listSeedAddresses()
    return addresses.map(this.issuerFromAddress.bind(this)) as Issuer[]
  }

  async create() {
    const { address } = await RNUportHDSigner.createSeed(this.level)
    const did = this.didFromAddress(address)
    debug('Created', did)
    return did
  }

  async delete(did: string) {
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

  async issuer(did: string) {
    const address = did.slice(9)
    return this.issuerFromAddress(address)
  }

  async import(seed: string) {
    const { address } = await RNUportHDSigner.importSeed(seed, this.level)
    const issuer = this.issuerFromAddress(address)
    debug('Imported %s', issuer.did)
    return issuer
  }

  async export(did: string) {
    const address = did.slice(9)
    return await RNUportHDSigner.showSeed(address, SHOW_SEED_PROMPT)
  }
}

export default EthrDidRnController
