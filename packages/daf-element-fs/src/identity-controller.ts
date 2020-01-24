import { IdentityController, Issuer } from 'daf-core'
const element = require('@transmute/element-lib')
const DidJwt = require('did-jwt')
const SimpleSigner = DidJwt.SimpleSigner
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:element-fs:identity-controller')

interface Identity {
  primaryPrivateKey: string
  recoveryPrivateKey: string
  did: string
}

interface FileContents {
  identities: Identity[]
}

export class ElementFsController implements IdentityController {
  public type = 'element-fs'
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
      signer: SimpleSigner(identity.primaryPrivateKey),
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

    const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic())
    const primaryKey = mks.getKeyForPurpose('primary', 0)
    const recoveryKey = mks.getKeyForPurpose('recovery', 0)
    const didDocumentModel = element.op.getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey)
    console.log('didDocumentModel:')
    console.log(didDocumentModel)

    const createPayload = await element.op.getCreatePayload(didDocumentModel, primaryKey)
    console.log('createPayload:')
    console.log(createPayload)

    const didUniqueSuffix = element.func.getDidUniqueSuffix(createPayload)
    console.log(didUniqueSuffix)
    const did = 'did:elem:' + didUniqueSuffix

    this.writeToFile({
      identities: [
        ...identities,
        {
          did: did,
          primaryPrivateKey: primaryKey.privateKey,
          recoveryPrivateKey: recoveryKey.privateKey,
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
    return identity.primaryPrivateKey
  }
}
