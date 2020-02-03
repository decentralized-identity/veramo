import { AbstractIdentityProvider, AbstractIdentity, Resolver } from 'daf-core'
import { EthrIdentity } from './ethr-identity'
import { sign } from 'ethjs-signer'
const SignerProvider = require('ethjs-provider-signer')

const EthrDID = require('ethr-did')
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:ethr-did-fs:identity-provider')

interface SerializedIdentity {
  address: string
  privateKey: string
  did: string
}

interface FileContents {
  identities: SerializedIdentity[]
}

export class IdentityProvider extends AbstractIdentityProvider {
  public type = 'ethr-did-fs'
  public description = 'identities saved in JSON file'
  private fileName: string
  private network: string
  private rpcUrl: string
  private resolver: Resolver

  constructor(options: { fileName: string; network: string; rpcUrl: string; resolver: Resolver }) {
    super()
    this.fileName = options.fileName
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.resolver = options.resolver
    this.type = options.network + '-' + this.type
    this.description = 'did:ethr:' + options.network + ' ' + this.description
  }

  private readFromFile(): FileContents {
    try {
      const raw = fs.readFileSync(this.fileName)
      return JSON.parse(raw) as FileContents
    } catch (e) {
      return { identities: [] }
    }
  }

  private writeToFile(json: FileContents) {
    return fs.writeFileSync(this.fileName, JSON.stringify(json))
  }

  private async getSerializedIdentity(did: string): Promise<SerializedIdentity> {
    const { identities } = this.readFromFile()
    const identity = identities.find(identity => identity.did == did)
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }
    return identity
  }

  private identityFromSerialized(serialized: SerializedIdentity): AbstractIdentity {
    return new EthrIdentity({
      did: serialized.did,
      privateKey: serialized.privateKey,
      address: serialized.address,
      identityProviderType: this.type,
      rpcUrl: this.rpcUrl,
      resolver: this.resolver,
    })
  }

  async getIdentities() {
    const { identities } = this.readFromFile()
    return identities.map(this.identityFromSerialized.bind(this)) as EthrIdentity[]
  }

  async createIdentity() {
    const keyPair = EthrDID.createKeyPair()

    const serialized = {
      did: 'did:ethr:' + this.network + ':' + keyPair.address,
      address: keyPair.address,
      privateKey: keyPair.privateKey,
    }

    this.saveIdentity(serialized)
    return this.identityFromSerialized(serialized)
  }

  async saveIdentity(serialized: SerializedIdentity) {
    const { identities } = this.readFromFile()
    this.writeToFile({
      identities: [...identities, serialized],
    })

    debug('Saved', serialized.did)
  }

  async deleteIdentity(did: string) {
    const { identities } = this.readFromFile()
    if (!identities.find(identity => identity.did == did)) {
      return false
    }
    const filteredIdentities = identities.filter(identity => identity.did != did)
    this.writeToFile({ identities: filteredIdentities })
    debug('Deleted', did)
    return true
  }

  async getIdentity(did: string) {
    const serialized = await this.getSerializedIdentity(did)
    return this.identityFromSerialized(serialized)
  }

  async exportIdentity(did: string) {
    const serialized = await this.getSerializedIdentity(did)
    return JSON.stringify(serialized)
  }

  async importIdentity(json: string) {
    const serialized = JSON.parse(json)
    this.saveIdentity(serialized)
    return this.identityFromSerialized(serialized)
  }

  async addService(
    did: string,
    service: { id: string; type: string; serviceEndpoint: string },
  ): Promise<any> {
    const serialized = await this.getSerializedIdentity(did)
    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) => cb(null, sign(rawTx, '0x' + serialized.privateKey)),
    })
    const ethrDid = new EthrDID({ address: serialized.address, provider })
    return ethrDid.setAttribute('did/svc/' + service.type, service.serviceEndpoint, 86400, 100000)
  }
}
