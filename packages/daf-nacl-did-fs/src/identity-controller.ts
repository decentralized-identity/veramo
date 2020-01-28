import { IdentityController, Issuer } from 'daf-core'
import { createIdentity, loadIdentity, SerializableNaCLIdentity } from 'nacl-did'
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:nacl-did-fs:identity-controller')

interface FileContents {
  identities: SerializableNaCLIdentity[]
}

export class NaclDidFsController implements IdentityController {
  public type = 'nacl-did-fs'
  private fileName: string

  constructor(fileName: string) {
    this.fileName = fileName
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

  private issuerFromIdentity(identity: SerializableNaCLIdentity): Issuer {
    const naclId = loadIdentity(identity)
    const issuer: Issuer = {
      did: naclId.did,
      // TODO: Fix. Proposal below, needs to handle Uint8Array.
      signer: s => Promise.resolve(s),
      //signer: data => Promise.resolve(naclId.sign(data).signature), // FIX
      type: this.type,
      ethereumAddress: undefined, // TODO: what should we do here?
    }
    return issuer
  }

  async listDids() {
    const { identities } = this.readFromFile()
    return identities.map(identity => identity.did)
  }

  async listIssuers() {
    const { identities } = this.readFromFile()
    return identities.map(this.issuerFromIdentity.bind(this)) as Issuer[]
  }

  async create() {
    const { identities } = this.readFromFile()
    const naclId = createIdentity()

    this.writeToFile({
      identities: [...identities, naclId.toJSON()],
    })

    debug('Created', naclId.did)

    return naclId.did
  }

  async delete(did: string) {
    const { identities } = this.readFromFile()

    if (!identities.find(identity => identity.did == did)) {
      return false
    }

    const filteredIdentities = identities.filter(identity => identity.did != did)

    this.writeToFile({ identities: filteredIdentities })

    debug('Deleted', did)

    return true
  }

  async issuer(did: string) {
    const { identities } = this.readFromFile()

    const identity = identities.find(identity => identity.did == did)
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }

    return this.issuerFromIdentity(identity)
  }

  async export(did: string) {
    const { identities } = this.readFromFile()

    const identity = identities.find(identity => identity.did == did)
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }
    return identity.privateKey
  }
}
