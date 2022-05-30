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
  schema,
  IDataStoreDeleteVerifiableCredentialArgs,
} from '@veramo/core'
import { Message, createMessageEntity, createMessage } from './entities/message'
import { Credential, createCredentialEntity } from './entities/credential'
import { Claim } from './entities/claim'
import { Presentation, createPresentationEntity } from './entities/presentation'
import { Connection } from 'typeorm'

export class DataStore implements IAgentPlugin {
  readonly methods: IDataStore
  readonly schema = schema.IDataStore
  private dbConnection: Promise<Connection>

  constructor(dbConnection: Promise<Connection>) {
    this.dbConnection = dbConnection

    this.methods = {
      dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
      dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
      dataStoreDeleteVerifiableCredential: this.dataStoreDeleteVerifiableCredential.bind(this),
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
    try {
      const messageEntity = await (await this.dbConnection).getRepository(Message).findOne({
        where: { id: args.id },
        relations: ['credentials', 'presentations'],
      })
      if (!messageEntity) throw new Error('Message not found')

      return createMessage(messageEntity)
    } catch (e) {
      throw Error('Message not found')
    }
  }

  async dataStoreDeleteVerifiableCredential(
    args: IDataStoreDeleteVerifiableCredentialArgs,
  ): Promise<boolean> {
    const credentialEntity = await (await this.dbConnection)
      .getRepository(Credential)
      .findOneBy({ hash: args.hash })
    if (!credentialEntity) throw new Error('Verifiable credential not found')

    const claims = await (await this.dbConnection)
      .getRepository(Claim)
      .find({ where: { credential: { id: credentialEntity.id } } })
    // .find({ where: [{ column: 'credential', value: [credentialEntity.id] }] })

    await (await this.dbConnection).getRepository(Claim).remove(claims)

    await (await this.dbConnection).getRepository(Credential).remove(credentialEntity)

    return true
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
    try {
      const credentialEntity = await (await this.dbConnection)
        .getRepository(Credential)
        .findOneBy({ hash: args.hash })
      if (!credentialEntity) throw new Error('Verifiable credential not found')

      return credentialEntity.raw
    } catch (e) {
      throw Error('Verifiable credential not found')
    }
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
    try {
      const presentationEntity = await (await this.dbConnection)
        .getRepository(Presentation)
        .findOneBy({ hash: args.hash })
      if (!presentationEntity) throw new Error('Verifiable presentation not found')

      return presentationEntity.raw
    } catch (e) {
      throw Error('Verifiable presentation not found')
    }
  }
}
