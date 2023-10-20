import { IPluginMethodMap } from './IAgent.js'
import { IMessage } from './IMessage.js'
import { VerifiableCredential, VerifiablePresentation } from './vc-data-model.js'

/**
 * Input arguments for {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}
 * @public
 */
export interface IDataStoreSaveMessageArgs {
  /**
   * Required. Message
   */
  message: IMessage
}

/**
 * Input arguments for {@link IDataStore.dataStoreGetMessage | dataStoreGetMessage}
 * @public
 */
export interface IDataStoreGetMessageArgs {
  /**
   * Required. Message ID
   */
  id: string
}

/**
 * Input arguments for {@link IDataStore.dataStoreDeleteMessage | dataStoreDeleteMessage}
 * @public
 */
export interface IDataStoreDeleteMessageArgs {
  /**
   * Required. Message ID
   */
  id: string
}

/**
 * Input arguments for {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}
 * @public
 */
export interface IDataStoreSaveVerifiableCredentialArgs {
  /**
   * Required. VerifiableCredential
   */
  verifiableCredential: VerifiableCredential
}

/**
 * Input arguments for {@link IDataStore.dataStoreGetVerifiableCredential | dataStoreGetVerifiableCredential}
 * @public
 */
export interface IDataStoreGetVerifiableCredentialArgs {
  /**
   * Required. VerifiableCredential hash
   */
  hash: string
}

/**
 * Input arguments for {@link IDataStoreDeleteVerifiableCredentialArgs | IDataStoreDeleteVerifiableCredentialArgs}
 * @public
 */
export interface IDataStoreDeleteVerifiableCredentialArgs {
  /**
   * Required. VerifiableCredential hash
   */
  hash: string
}

/**
 * Input arguments for {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}
 * @public
 */
export interface IDataStoreSaveVerifiablePresentationArgs {
  /**
   * Required. VerifiablePresentation
   */
  verifiablePresentation: VerifiablePresentation
}

/**
 * Input arguments for {@link IDataStore.dataStoreGetVerifiablePresentation | dataStoreGetVerifiablePresentation}
 * @public
 */
export interface IDataStoreGetVerifiablePresentationArgs {
  /**
   * Required. VerifiablePresentation hash
   */
  hash: string
}

/**
 * Input arguments for {@link IDataStore.dataStoreSaveMediation | dataStoreSaveMediation}
 * @public
 */
export interface IDataStoreSaveMediationArgs {
  /**
   * Required. did
   */
  did: string
  /**
   * Required. mediation status
   */
  status: 'GRANTED' | 'DENIED'
}

/**
 * Input arguments for {@link IDataStore.dataStoreAddRecipientDid | dataStoreAddRecipientDid}
 * @public
 */
// export interface IDataStoreAddRecipientDid {
//   /**
//    * Required. did
//    */
//   did: string
//   /**
//    * Required. recipient did
//    */
//   recipient_did: string
// }

/**
 * Input arguments for {@link IDataStore.dataStoreRemoveRecipientDid | dataStoreRemoveRecipientDid}
 * @public
 */
// export interface IDataStoreRemoveRecipientDid {
//   /**
//    * Required. did
//    */
//   did: string
//   /**
//    * Required. recipient did
//    */
//   recipient_did: string
// }

// export interface IDataStoreListRecipientDids {
//   /**
//    * Required. did
//    */
//   did: string
//   /**
//    * Optional. limit
//    */
//   limit?: number
//   /**
//    * Optional. offset
//    */
//   offset?: number
// }

/**
 * Basic data store interface
 * @public
 */
export interface IDataStore extends IPluginMethodMap {
  /**
   * Saves message to the data store
   * @param args - message
   * @returns a promise that resolves to the id of the message
   */
  dataStoreSaveMessage(args: IDataStoreSaveMessageArgs): Promise<string>

  /**
   * Gets message from the data store
   * @param args - arguments for getting message
   * @returns a promise that resolves to the message
   */
  dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage>

  /**
   * Deletes message from the data store
   * @param args - arguments for deleting message
   * @returns a promise that resolves to a boolean
   */
  dataStoreDeleteMessage(args: IDataStoreDeleteMessageArgs): Promise<boolean>

  /**
   * Saves verifiable credential to the data store
   * @param args - verifiable credential
   * @returns a promise that resolves to the hash of the VerifiableCredential
   */
  dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string>

  /**
   * Deletes verifiable credential from the data store
   * @param args - verifiable credential
   * @returns a promise that resolves to a boolean
   */
  dataStoreDeleteVerifiableCredential(args: IDataStoreDeleteVerifiableCredentialArgs): Promise<boolean>

  /**
   * Gets verifiable credential from the data store
   * @param args - arguments for getting verifiable credential
   * @returns a promise that resolves to the verifiable credential
   */
  dataStoreGetVerifiableCredential(args: IDataStoreGetVerifiableCredentialArgs): Promise<VerifiableCredential>

  /**
   * Saves verifiable presentation to the data store
   * @param args - verifiable presentation
   * @returns a promise that resolves to the hash of the VerifiablePresentation
   */
  dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string>

  /**
   * Gets verifiable presentation from the data store
   * @param args - arguments for getting Verifiable Presentation
   * @returns a promise that resolves to the Verifiable Presentation
   */
  dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation>

  /**
   * Saves mediation status to the data store
   * @param args - mediation status
   * @returns a promise that resolves to the recipient did
   */
  dataStoreSaveMediation(args: IDataStoreSaveMediationArgs): Promise<void>

  /**
   * Saves recipient dids to the data store
   * @param args - recipient dids
   * @returns a promise that resolves to the list of recipient dids
   */
  // dataStoreAddRecipientDid(args: IDataStoreAddRecipientDid): Promise<string>

  /**
   * Saves recipient dids to the data store
   * @param args - recipient dids
   * @returns a promise that resolves to the list of recipient dids
   */
  // dataStoreRemoveRecipientDid(args: IDataStoreRemoveRecipientDid): Promise<string | null>
}
