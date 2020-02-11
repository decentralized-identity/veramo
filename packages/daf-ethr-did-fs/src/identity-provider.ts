import { AbstractIdentityProvider, AbstractIdentity, Resolver } from 'daf-core'
import { Identity } from './identity'
import { sign } from 'ethjs-signer'
const SignerProvider = require('ethjs-provider-signer')
const EthrDID = require('ethr-did')
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:ethr-did-fs:identity-provider')
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
import { DIDComm } from './didcomm'
const didcomm = new DIDComm()

import { keccak_256 } from 'js-sha3'
import { sha256 as sha256js, Message } from 'js-sha256'

export function sha256(payload: Message): Buffer {
  return Buffer.from(sha256js.arrayBuffer(payload))
}

function keccak(data: any): Buffer {
  return Buffer.from(keccak_256.arrayBuffer(data))
}
export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${keccak(Buffer.from(hexPublicKey.slice(2), 'hex'))
    .slice(-20)
    .toString('hex')}`
}

export interface Key {
  type: string
  privateKey: string
  publicKey: string
  address?: string
}

interface SerializedIdentity {
  did: string
  controller: Key
  keys: Key[]
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
    this.description = 'did:ethr ' + options.network + ' ' + this.description
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

  private identityFromSerialized(serialized: SerializedIdentity): AbstractIdentity {
    return new Identity({
      did: serialized.did,
      keys: serialized.keys,
      identityProviderType: this.type,
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
    const kp = secp256k1.genKeyPair()
    const publicKey = kp.getPublic('hex')
    const privateKey = kp.getPrivate('hex')
    const address = toEthereumAddress(publicKey)

    const key = {
      privateKey,
      publicKey,
      address,
      type: 'Secp256k1',
    }

    const serialized = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + address,
      controller: key,
      keys: [key],
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

    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) =>
        cb(null, sign(rawTx, '0x' + serialized.controller.privateKey)),
    })
    const ethrDid = new EthrDID({ address: serialized.controller.address, provider })

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async addPublicKey(did: string, type: 'Ed25519' | 'Secp256k1', proofPurpose?: string[]): Promise<any> {
    const serialized = await this.getSerializedIdentity(did)

    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) =>
        cb(null, sign(rawTx, '0x' + serialized.controller.privateKey)),
    })
    const ethrDid = new EthrDID({ address: serialized.controller.address, provider })

    let usg = ''
    let publicKey
    let privateKey
    let address
    switch (type) {
      case 'Ed25519':
        await didcomm.ready
        const keyPair = await didcomm.generateKeyPair()
        privateKey = Buffer.from(keyPair.privateKey).toString('hex')
        publicKey = Buffer.from(keyPair.publicKey).toString('hex')
        usg = 'veriKey'
        break
      case 'Secp256k1':
        const kp = secp256k1.genKeyPair()
        publicKey = kp.getPublic('hex')
        privateKey = kp.getPrivate('hex')
        address = toEthereumAddress(publicKey)
        usg = 'veriKey'
        break
    }

    const attribute = 'did/pub/' + type + '/' + usg + '/hex'
    const value = '0x' + publicKey
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)

    if (txHash) {
      debug({ txHash })
      serialized.keys = [...serialized.keys, { privateKey, publicKey, address, type }]
      this.saveIdentity(serialized)
      return true
    }

    return false
  }
}
