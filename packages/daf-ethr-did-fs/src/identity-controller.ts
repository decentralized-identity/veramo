import { IdentityController, Issuer } from 'daf-core'
const EthrDID = require('ethr-did')
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('fs-ethr-did-controller')

interface Identity {
  address: string
  privateKey: string
  did: string
}

interface FileContents {
  identities: Identity[]
}

export class EthrDidFsController implements IdentityController {
  public type = 'ethr-did-fs'
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

  private issuerFromIdentity(identity: Identity): Issuer {
    const ethrDid = new EthrDID({ ...identity })
    const issuer: Issuer = {
      did: identity.did,
      signer: ethrDid.signer,
      type: this.type,
      ethereumAddress: ethrDid.address,
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
    const keyPair = EthrDID.createKeyPair()
    const ethrDid = new EthrDID({ ...keyPair })

    this.writeToFile({
      identities: [
        ...identities,
        {
          did: ethrDid.did,
          address: ethrDid.address,
          privateKey: keyPair.privateKey,
        },
      ],
    })

    debug('Created', ethrDid.did)

    return ethrDid.did
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
