import {
  IAgentPlugin,
  IDataStore,
  IDataStoreDeleteVerifiableCredentialArgs,
  IDataStoreGetMessageArgs,
  IDataStoreGetVerifiableCredentialArgs,
  IDataStoreGetVerifiablePresentationArgs,
  IDataStoreSaveMessageArgs,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreSaveVerifiablePresentationArgs,
  IMessage,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import schema from '@veramo/core/build/plugin.schema.json' assert { type: 'json' }
import { Message } from '../../../data-store'
import { Credential } from '../../../data-store'
import { Claim } from '../../../data-store'
import { Presentation } from '../../../data-store'
import { DataSource } from 'typeorm'
import { OrPromise } from '@veramo/utils'

/**
 * This class implements the {@link @veramo/core#IDataStore} interface using a TypeORM compatible database.
 *
 * This allows you to store and retrieve Verifiable Credentials, Presentations and Messages by their IDs.
 *
 * For more complex queries you should use {@link @veramo/data-store#DataStoreORM} which is the default way to query
 * the stored data by some common properties. These two classes MUST also share the same database connection.
 *
 * @see {@link @veramo/core#IDataStoreORM}
 * @see {@link @veramo/core#IDataStore}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class MockDataStore implements IAgentPlugin {
  readonly methods: IDataStore
  readonly schema = schema.IDataStore

  constructor() {
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
    return "1"
  }

  async dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage> {
    return { id: "x", type: "y"}
  }

  async dataStoreDeleteVerifiableCredential(
    args: IDataStoreDeleteVerifiableCredentialArgs,
  ): Promise<boolean> {
    return true
  }

  async dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string> {
    return "1"
  }

  async dataStoreGetVerifiableCredential(
    args: IDataStoreGetVerifiableCredentialArgs,
  ): Promise<VerifiableCredential> {
    return { issuer: "x", "@context": "y", "issuanceDate": "z", credentialSubject: {}, proof: {}}
  }

  async dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string> {
    return ""
  }

  async dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation> {
    return { holder: "x", "@context": "y", credentialSubject: {}, proof: {}}
  }
}
