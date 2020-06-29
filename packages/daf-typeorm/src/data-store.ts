import { IAgentPlugin, IDataStore, IMessage, VerifiableCredential, VerifiablePresentation } from 'daf-core'
import { Message, createMessageEntity } from './entities/message'
import { Credential, createCredentialEntity } from './entities/credential'
import { Presentation, createPresentationEntity } from './entities/presentation'
import { Connection } from 'typeorm'

export class DataStore implements IAgentPlugin {
  readonly methods: IDataStore
  private dbConnection: Promise<Connection>

  constructor(dbConnection: Promise<Connection>) {
    this.dbConnection = dbConnection

    this.methods = {
      dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
      dataStoreSaveVerifiableCredential: this.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation: this.dataStoreSaveVerifiablePresentation.bind(this),
    }
  }

  async dataStoreSaveMessage(args: IMessage): Promise<boolean> {
    await (await this.dbConnection).getRepository(Message).save(createMessageEntity(args))
    return true
  }

  async dataStoreSaveVerifiableCredential(args: VerifiableCredential): Promise<boolean> {
    await (await this.dbConnection).getRepository(Credential).save(createCredentialEntity(args))
    return true
  }

  async dataStoreSaveVerifiablePresentation(args: VerifiablePresentation): Promise<boolean> {
    await (await this.dbConnection).getRepository(Presentation).save(createPresentationEntity(args))
    return true
  }
}
