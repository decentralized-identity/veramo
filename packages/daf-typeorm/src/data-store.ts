import {
  IAgentPlugin,
  IDataStore,
  IDataStoreGetMessageArgs,
  IDataStoreGetVerifiableCredentialArgs,
  IDataStoreGetVerifiablePresentationArgs,
  IDataStoreSaveMessageArgs,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreSaveVerifiablePresentationArgs,
  IMessage,
  VerifiableCredential,
  VerifiablePresentation,
} from 'daf-core'
import { Message, createMessageEntity, createMessage } from './entities/message'
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
      dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
      dataStoreSaveVerifiableCredential: this.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreGetVerifiableCredential: this.dataStoreGetVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation: this.dataStoreSaveVerifiablePresentation.bind(this),
      dataStoreGetVerifiablePresentation: this.dataStoreGetVerifiablePresentation.bind(this),
    }
  }

  async dataStoreSaveMessage(args: IDataStoreSaveMessageArgs): Promise<string> {
    const message = await (await this.dbConnection)
      .getRepository(Message)
      .save(createMessageEntity(args.message))
    return message.id
  }

  async dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage> {
    const messageEntity = await (await this.dbConnection).getRepository(Message).findOneOrFail(args.id)
    return createMessage(messageEntity)
  }

  async dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string> {
    const verifiableCredential = await (await this.dbConnection)
      .getRepository(Credential)
      .save(createCredentialEntity(args.verifiableCredential))
    return verifiableCredential.hash
  }

  async dataStoreGetVerifiableCredential(
    args: IDataStoreGetVerifiableCredentialArgs,
  ): Promise<VerifiableCredential> {
    const credentialEntity = await (await this.dbConnection)
      .getRepository(Credential)
      .findOneOrFail(args.hash)
    return credentialEntity.raw
  }

  async dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string> {
    const verifiablePresentation = await (await this.dbConnection)
      .getRepository(Presentation)
      .save(createPresentationEntity(args.verifiablePresentation))
    return verifiablePresentation.hash
  }

  async dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation> {
    const presentationEntity = await (await this.dbConnection)
      .getRepository(Presentation)
      .findOneOrFail(args.hash)
    return presentationEntity.raw
  }
}
