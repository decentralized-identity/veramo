import { IAgentContext, IKey, IKeyManager, IService, MinimalImportableKey } from '@veramo/core'
import { IonPublicKeyPurpose, IonPublicKeyModel, JwkEs256k } from '@decentralized-identity/ion-sdk'

export type IContext = IAgentContext<IKeyManager>

export interface VerificationMethod extends KeyOpts {
  purposes: IonPublicKeyPurpose[] // In sidetree these are called purposes, but in DID-Core Verification Relationships
}

export interface KeyOpts {
  kid?: string // Key ID to assign in case we are importing a key
  key?: MinimalImportableKey // Optional key to import. If not specified a key with random kid will be created
  type?: KeyType // The key type. Defaults to Secp256k1
}

export interface ICreateIdentifierOpts {
  verificationMethods?: VerificationMethod[] // The Verification method to add
  recoveryKey?: KeyOpts // Recovery key options
  updateKey?: KeyOpts // Update key options
  services?: IService[] // Service(s) to add
  actionTimestamp?: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  anchor?: boolean // Whether the DID should be anchored on ION or not. Handy for testing or importing an ID
}

export interface IAddKeyOpts extends IUpdateOpts {
  purposes: IonPublicKeyPurpose[] // In sidetree these are called purposes, but in DID-Core Verification Relationships
}

export interface IUpdateOpts {
  actionTimestamp?: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  anchor?: boolean // Whether the DID should be anchored on ION or not. Handy for testing or importing an ID
}

export interface IonKeyMetadata {
  purposes?: IonPublicKeyPurpose[] // The Verification Method Relationships, or purposes as they are called in ION/Sidetree
  actionTimestamp: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  relation: KeyIdentifierRelation // The type of key, which is either recovery, update or DID
  commitment?: string // Commitment value in case this is an update or recovery key. Used to get latest update/recovery keys
}

export enum KeyType {
  Ed25519 = 'Ed25519', // EdDSA key type
  Secp256k1 = 'Secp256k1', // EcDSA key type (not yet supported)
}

export enum KeyIdentifierRelation {
  RECOVERY = 'recovery', // A recovery key can be used to recover access to a DID, after loosing the update key(s)
  UPDATE = 'update', // An update key is used to commit changes on ION. Please note that new update keys will be automatically created on every update
  DID = 'did', // A key which ends up as a Verification Method in a DID document
}

export enum IonDidForm {
  LONG = 'long', // A long form ION DID, which contains the short form, but also a self-certifying part, which can be resolved before the anchor happened. This is handy during the initial anchoring (as that might take a long time)
  SHORT = 'short', // The short form ION DID, which can only be used once anchored
}

export interface IKeyRotation {
  currentVeramoKey: IKey // Current update/recovery Veramo Key
  currentIonKey: IonPublicKeyModel // Current update/recovery Key in ION form
  currentJwk: JwkEs256k // Current update/recovery JWK of the key
  nextVeramoKey: IKey // Next Veramo update/recovery key
  nextIonKey: IonPublicKeyModel // Next update/recovery key in ION form
  nextJwk: JwkEs256k // Next JWK of the update/recovery key
}


/** Secp256k1 Private Key  */
export interface ISecp256k1PrivateKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** private point */
  d: string;

  /** public point */
  x: string;

  /** public point */
  y: string;

  /** key id */
  kid: string;
}

/** Secp256k1 Public Key  */
export interface ISecp256k1PublicKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** public point */
  x: string;

  /** public point */
  y: string;

  /** key id */
  kid: string;
}

export type IRequiredContext = IAgentContext<IKeyManager>
