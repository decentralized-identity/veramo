import { AbstractIdentity, AbstractKeyManagementSystem, SerializedIdentity } from 'daf-core'

export class Identity extends AbstractIdentity {
  public readonly did: string
  private readonly serializedIdentity: SerializedIdentity
  public readonly identityProviderType: string
  private readonly kms: AbstractKeyManagementSystem

  constructor(options: {
    identityProviderType: string
    serializedIdentity: SerializedIdentity
    kms: AbstractKeyManagementSystem
  }) {
    super()
    this.did = options.serializedIdentity.did
    this.serializedIdentity = options.serializedIdentity
    this.identityProviderType = options.identityProviderType
    this.kms = options.kms
  }

  async keyById(kid: string) {
    const serializedKey = this.serializedIdentity.keys.find(item => item.kid === kid)
    if (!serializedKey) throw Error('Key not found')
    return this.kms.getKey(serializedKey.kid)
  }

  async keyByType(type: string) {
    const serializedKey = this.serializedIdentity.keys.find(item => item.type === type)
    if (!serializedKey) throw Error('Key not found')
    return this.kms.getKey(serializedKey.kid)
  }
}
