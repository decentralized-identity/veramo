import { IdentityController, Issuer } from 'daf-core'
const DidJwt = require('did-jwt')
const SimpleSigner = DidJwt.SimpleSigner
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:3id-fs:identity-controller')
const crypto = require('crypto')
const IdentityWallet = require('identity-wallet')

interface Identity {
  signingPrivateKey: string
  managementPrivateKey: string
  seed: string
  did: string
}

interface FileContents {
  identities: Identity[]
}

function getConsent() {
  return true
}

export class ThreeIdFsController implements IdentityController {
  public type = '3id-fs'
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
    const issuer: Issuer = {
      did: identity.did,
      signer: SimpleSigner(identity.signingPrivateKey),
      type: this.type,
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

    const seed = '0x' + crypto.randomBytes(16).toString('hex')
    const idWallet = new IdentityWallet(getConsent, { seed })

    const did = await idWallet._get3id()
    const sigPrivKey = idWallet._keyring._rootKeys.signingKey
    console.log(sigPrivKey)
    const mgmtPrivKey = idWallet._keyring._rootKeys.managementKey
    console.log(mgmtPrivKey)

    this.writeToFile({
      identities: [
        ...identities,
        {
          did: did,
          signingPrivateKey: sigPrivKey,
          managementPrivateKey: mgmtPrivKey,
          seed: seed,
        },
      ],
    })

    debug('Created', did)

    return did
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
    return identity.signingPrivateKey
  }
}
