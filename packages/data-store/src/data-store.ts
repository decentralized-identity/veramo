import {
  IAgentPlugin,
  IDataStore,
  IDataStoreDeleteVerifiableCredentialArgs,
  IDataStoreGetMessageArgs,
  IDataStoreDeleteMessageArgs,
  IDataStoreGetVerifiableCredentialArgs,
  IDataStoreGetVerifiablePresentationArgs,
  IDataStoreSaveMessageArgs,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreSaveVerifiablePresentationArgs,
  IMessage,
  IMediation,
  VerifiableCredential,
  VerifiablePresentation,
  IDataStoreSaveMediationArgs,
  IDataStoreGetMediationArgs,
  IDataStoreRemoveRecipientDid,
  IDataStoreAddRecipientDid,
  IDataStoreGetRecipientDids,
} from '@veramo/core-types'
import schema from '@veramo/core-types/build/plugin.schema.json' assert { type: 'json' }
import { createMessage, createMessageEntity, Message } from './entities/message.js'
import { createCredentialEntity, Credential } from './entities/credential.js'
import { Claim } from './entities/claim.js'
import { createPresentationEntity, Presentation } from './entities/presentation.js'
import { RecipientDid } from './entities/recipient_did.js'
import { DataSource } from 'typeorm'
import { getConnectedDb } from './utils.js'
import { OrPromise } from '@veramo/utils'
import { Mediation } from './entities/mediation.js'

/**
 * This class implements the {@link @veramo/core-types#IDataStore} interface using a TypeORM compatible database.
 *
 * This allows you to store and retrieve Verifiable Credentials, Presentations and Messages by their IDs.
 *
 * For more complex queries you should use {@link @veramo/data-store#DataStoreORM} which is the default way to query
 * the stored data by some common properties. These two classes MUST also share the same database connection.
 *
 * @see {@link @veramo/core-types#IDataStoreORM}
 * @see {@link @veramo/core-types#IDataStore}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DataStore implements IAgentPlugin {
  readonly methods: IDataStore
  readonly schema = schema.IDataStore
  private dbConnection: OrPromise<DataSource>

  constructor(dbConnection: OrPromise<DataSource>) {
    this.dbConnection = dbConnection

    this.methods = {
      dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
      dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
      dataStoreDeleteMessage: this.dataStoreDeleteMessage.bind(this),
      dataStoreDeleteVerifiableCredential: this.dataStoreDeleteVerifiableCredential.bind(this),
      dataStoreSaveVerifiableCredential: this.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreGetVerifiableCredential: this.dataStoreGetVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation: this.dataStoreSaveVerifiablePresentation.bind(this),
      dataStoreGetVerifiablePresentation: this.dataStoreGetVerifiablePresentation.bind(this),
      dataStoreSaveMediation: this.dataStoreSaveMediation.bind(this),
      dataStoreGetMediation: this.dataStoreGetMediation.bind(this),
      dataStoreAddRecipientDid: this.dataStoreAddRecipientDid.bind(this),
      dataStoreRemoveRecipientDid: this.dataStoreRemoveRecipientDid.bind(this),
      dataStoreGetRecipientDids: this.dataStoreGetRecipientDids.bind(this),
    }
  }

  async dataStoreSaveMessage(args: IDataStoreSaveMessageArgs): Promise<string> {
    const message = await (await getConnectedDb(this.dbConnection))
      .getRepository(Message)
      .save(createMessageEntity(args.message))
    return message.id
  }

  async dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage> {
    const messageEntity = await (await getConnectedDb(this.dbConnection)).getRepository(Message).findOne({
      where: { id: args.id },
      relations: ['credentials', 'presentations'],
    })
    if (!messageEntity) throw new Error('not_found: Message not found')

    return createMessage(messageEntity)
  }

  async dataStoreDeleteMessage(args: IDataStoreDeleteMessageArgs): Promise<boolean> {
    const messageEntity = await (await getConnectedDb(this.dbConnection)).getRepository(Message).findOne({
      where: { id: args.id },
      relations: ['credentials', 'presentations'],
    })
    if (!messageEntity) {
      return false
    }

    await (await getConnectedDb(this.dbConnection)).getRepository(Message).remove(messageEntity)

    return true
  }

  async dataStoreDeleteVerifiableCredential(
    args: IDataStoreDeleteVerifiableCredentialArgs,
  ): Promise<boolean> {
    const credentialEntity = await (await getConnectedDb(this.dbConnection))
      .getRepository(Credential)
      .findOneBy({ hash: args.hash })
    if (!credentialEntity) {
      return false
    }

    const claims = await (await getConnectedDb(this.dbConnection))
      .getRepository(Claim)
      .find({ where: { credential: { hash: credentialEntity.hash } } })

    await (await getConnectedDb(this.dbConnection)).getRepository(Claim).remove(claims)

    await (await getConnectedDb(this.dbConnection)).getRepository(Credential).remove(credentialEntity)

    return true
  }

  async dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string> {
    const verifiableCredential = await (await getConnectedDb(this.dbConnection))
      .getRepository(Credential)
      .save(createCredentialEntity(args.verifiableCredential))
    return verifiableCredential.hash
  }

  async dataStoreGetVerifiableCredential(
    args: IDataStoreGetVerifiableCredentialArgs,
  ): Promise<VerifiableCredential> {
    const credentialEntity = await (await getConnectedDb(this.dbConnection))
      .getRepository(Credential)
      .findOneBy({ hash: args.hash })
    if (!credentialEntity) throw new Error('not_found: Verifiable credential not found')

    return credentialEntity.raw
  }

  async dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string> {
    const verifiablePresentation = await (await getConnectedDb(this.dbConnection))
      .getRepository(Presentation)
      .save(createPresentationEntity(args.verifiablePresentation))
    return verifiablePresentation.hash
  }

  async dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation> {
    const presentationEntity = await (await getConnectedDb(this.dbConnection))
      .getRepository(Presentation)
      .findOneBy({ hash: args.hash })
    if (!presentationEntity) throw new Error('not_found: Verifiable presentation not found')

    return presentationEntity.raw
  }

  async dataStoreSaveMediation({ did, status }: IDataStoreSaveMediationArgs): Promise<string> {
    const db = await getConnectedDb(this.dbConnection)
    const saveResult = await db.getRepository(Mediation).save({ did, status })
    return saveResult.did
  }

  async dataStoreGetMediation({ did, status }: IDataStoreGetMediationArgs): Promise<IMediation> {
    const db = await getConnectedDb(this.dbConnection)
    const findFilter = { where: { did, status } } as const
    const mediation = await db.getRepository(Mediation).findOne(findFilter)
    if (!mediation) throw new Error('not_found: Mediation not found')
    return mediation
  }

  async dataStoreAddRecipientDid({ did, recipient_did }: IDataStoreAddRecipientDid): Promise<string> {
    const db = await getConnectedDb(this.dbConnection)
    const result = await db.getRepository(RecipientDid).save({ did, recipient_did })
    return result.recipient_did
  }

  async dataStoreRemoveRecipientDid({ did, recipient_did }: IDataStoreRemoveRecipientDid) {
    const db = await getConnectedDb(this.dbConnection)
    const findFilter = { where: { did, recipient_did } }
    const existingEntry = await db.getRepository(RecipientDid).findOne(findFilter)
    if (!existingEntry) return null
    await db.getRepository(RecipientDid).remove(existingEntry)
    return existingEntry.recipient_did
  }

  async dataStoreGetRecipientDids({ did, offset: _offset, limit: _limit }: IDataStoreGetRecipientDids) {
    const db = await getConnectedDb(this.dbConnection)
    const dids = await db.getRepository(RecipientDid).findBy({ did })
    return dids
  }
}
