import { AbstractIdentityProvider, AbstractIdentity, Resolver } from 'daf-core'
import * as jose from 'jose'
import { convertECKeyToEthHexKeys } from './daf-jose'

import { EthrIdentity } from './ethr-identity'
import { sign } from 'ethjs-signer'
const SignerProvider = require('ethjs-provider-signer')

const EthrDID = require('ethr-did')
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:ethr-did-fs:identity-provider')

interface SerializedIdentity {
  did: string
  keySet: jose.JSONWebKeySet
}

interface FileContents {
  [did: string]: SerializedIdentity
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
      return {}
    }
  }

  private writeToFile(json: FileContents) {
    return fs.writeFileSync(this.fileName, JSON.stringify(json))
  }

  private async getSerializedIdentity(did: string): Promise<SerializedIdentity> {
    const identities = this.readFromFile()
    const identity = identities[did]
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }
    return identity
  }

  private getEthKeysFromSerialized(serialized: SerializedIdentity) {
    const keyStore = jose.JWKS.asKeyStore(serialized.keySet)
    const key = keyStore.get({ kty: 'EC', crv: 'secp256k1' }) as jose.JWK.ECKey
    if (!key) throw Error('Key not found')
    return convertECKeyToEthHexKeys(key)
  }

  private identityFromSerialized(serialized: SerializedIdentity): AbstractIdentity {
    const hexKeys = this.getEthKeysFromSerialized(serialized)
    return new EthrIdentity({
      did: serialized.did,
      privateKey: hexKeys.hexPrivateKey,
      address: hexKeys.address,
      identityProviderType: this.type,
      rpcUrl: this.rpcUrl,
      resolver: this.resolver,
    })
  }

  async getIdentities() {
    const identities = this.readFromFile()
    const result = []
    for (const did of Object.keys(identities)) {
      result.push(this.identityFromSerialized(identities[did]))
    }
    return result
  }

  async createIdentity() {
    const key = jose.JWK.generateSync('EC', 'secp256k1')
    const hexKeys = convertECKeyToEthHexKeys(key)

    const serialized = {
      did: 'did:ethr:' + this.network + ':' + hexKeys.address,
      keySet: new jose.JWKS.KeyStore([key]).toJWKS(true),
    }

    this.saveIdentity(serialized)
    return this.identityFromSerialized(serialized)
  }

  async saveIdentity(serialized: SerializedIdentity) {
    const identities = this.readFromFile()
    identities[serialized.did] = serialized
    this.writeToFile(identities)
    debug('Saved', serialized.did)
  }

  async deleteIdentity(did: string) {
    const identities = this.readFromFile()
    delete identities[did]
    this.writeToFile(identities)
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
    const hexKeys = this.getEthKeysFromSerialized(serialized)
    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) => cb(null, sign(rawTx, '0x' + hexKeys.hexPrivateKey)),
    })
    const ethrDid = new EthrDID({ address: hexKeys.address, provider })
    return ethrDid.setAttribute('did/svc/' + service.type, service.serviceEndpoint, 86400, 100000)
  }
}
