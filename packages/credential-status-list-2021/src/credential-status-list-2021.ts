import {
  CredentialStatus,
  CredentialStatusGenerateArgs,
  CredentialStatusReference,
  CredentialStatusUpdateArgs, IAgentContext, IAgentPlugin, ICheckCredentialStatusArgs, ICredentialStatus, IResolver, ProofType, UnsignedCredential
} from '@veramo/core'
import statusList from "@digitalcredentials/vc-status-list"
import { ICredentialIssuer } from '@veramo/credential-w3c'

const method: string = "StatusList2021Entry"

/**
 * 
 * `revocation`: Used to cancel the validity of a verifiable credential. This status is not reversible.
 * `suspension`: Used to temporarily prevent the acceptance of a verifiable credential. This status is reversible.   * 
 */
export type StatusPurpose = 'revocation' | 'suspension'

export interface CredentialStatusList2021Reference extends CredentialStatusReference {
  /**   
   * @inheritdoc {@link CredentialStatusReference.id}
   * 
   * It MUST NOT be the URL for the status list.
   */
  id: string

  /**   
   * @inheritdoc {@link CredentialStatusReference.type}
   */
  type: 'StatusList2021Entry'

  /**
   * The purpose of the status entry MUST be a string. While the value of the string is arbitrary, the following values MUST be used for their intended purpose: 
   */
  statusPurpose: StatusPurpose

  /**
   * 	Identify the bit position of the status of the verifiable credential (arbitrary integer >= 0).
   */
  statusListIndex: string

  /**
   * 	URL to the `StatusList2021Credential` credential.
   */
  statusListCredential: string
}

/**
 * Arguments to generate a credential status referencing a new/existent status list.
 */
export interface StatusList2021GenerateArgs extends CredentialStatusGenerateArgs {
  /**
   * The `credentialStatus.id` URL prefix (NOT the entry index)
   */
  statusListCredential: string

  /**
   * The credential status index in the list (greater than 0)
   */
  statusListIndex: number

  /**
   * The purpose of the status entry
   */
  statusPurpose: StatusPurpose
}

/**
 * Arguments to update a verificable credential status.
 */
export interface StatusList2021UpdateArgs extends CredentialStatusUpdateArgs {
  options: {
    purpose: StatusPurpose
    value: boolean
  }
}

/**
 * Arguments to request the verifiable credential status value.
 * 
 * @beta This API may change without a BREAKING CHANGE notice. 
 */
export interface CredentialStatusRequestArgs {
  /**
   * The credential status reference
   * 
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  credentialStatus: CredentialStatusReference
}

/**
 * Used to store the credntials status list by an ID.
 * 
 * @beta
 */
export interface StatusListStorage {
  /**
   * Store the status list (as string) referenced by a key.
   * 
   * @param key the status list id
   * @param value the status list encoded
   */
  set(key: string, value: string): Promise<void>

  /**
   * Restore a credential status list (as string) by its key.
   * 
   * @param key The status list id
   */
  get(key: string): Promise<string | undefined>

  /**
   * List all the keys from stored status lists.
   */
  keys(): string[]
}

/**
 * A Veramo plugin that enables status information for verifiable credentials 
 * using the [Status List 2021](https://w3c-ccg.github.io/vc-status-list-2021/) method.
 *  
 * This plugin implements the {@link @veramo/core#ICredentialStatusManager | ICredentialStatusManager} interface.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialStatusList2021Plugin implements IAgentPlugin {
  readonly methods: ICredentialStatus

  /**
   * @param storage A storage provider for storing the lists is expected as parameter.
   */
  constructor(private readonly storage: StatusListStorage) {
    this.methods = {
      checkCredentialStatus: this.checkCredentialStatus.bind(this),
      credentialStatusGenerate: this.credentialStatusGenerate.bind(this),
      credentialStatusUpdate: this.credentialStatusUpdate.bind(this),
      credentialStatusRead: this.credentialStatusRead.bind(this),
      credentialStatusTypes: this.credentialStatusTypes.bind(this)
    }
  }

  /**
   * @see https://w3c-ccg.github.io/vc-status-list-2021/#generate-algorithm
   * 
   * {@inheritdoc ICredentialStatusManager.credentialStatusGenerate}
   */
  async credentialStatusGenerate(args: StatusList2021GenerateArgs): Promise<CredentialStatusList2021Reference> {
    if (args.type !== method) throw new Error(`invalid_argument: unrecognized method '${args.type}'. Expected '${method}'.`)

    const statusListCredential = args.statusListCredential
    const statusListIndex = args.statusListIndex
    let encodedList = await this.storage.get(statusListCredential); // Load the list if exists
    if (!encodedList) {
      // Creates a new list if not found
      const list = statusList.createList({ length: Math.max(statusListIndex, 100000) })
      encodedList = await list.encode()
      if (!encodedList) throw new Error("illegal_state: the list should be encoded")
      await this.storage.set(statusListCredential, encodedList)
    }

    const statusPurpose = args.statusPurpose
    return {
      id: `${statusListCredential}#${statusListIndex}`,
      type: "StatusList2021Entry",
      statusListIndex: `"${statusListIndex}"`,
      statusPurpose,
      statusListCredential: `${statusListCredential}`,
    }
  }

  /**
   * {@inheritdoc ICredentialStatusVerifier.checkCredentialStatus}
   */
  async checkCredentialStatus(args: ICheckCredentialStatusArgs, context: IAgentContext<IResolver>): Promise<CredentialStatus> {
    const vc = args.credential
    const statusReference = <CredentialStatusList2021Reference>vc.credentialStatus

    const statusListCredential = statusReference.statusListCredential
    const encodedList = await this.storage.get(statusListCredential)
    if (!encodedList) throw new Error(`invalid_state: no status list found at '${statusReference.statusListCredential}'`)

    const list = await statusList.decode(encodedList)
    const verified: boolean = await list.getStatus(statusReference.statusListIndex)
    return { verified }
  }

  /**
   * {@inheritdoc ICredentialStatusManager.credentialStatusUpdate}
   */
  async credentialStatusUpdate(args: StatusList2021UpdateArgs): Promise<any> {
    const credentialStatus = args.vc.credentialStatus
    if (!credentialStatus || !credentialStatus.id) throw new Error("invalid_argument: `credentialStatus.id` must be defined in the credential")

    if (credentialStatus.type !== method) throw new Error(`invalid_argument: unrecognized method '${credentialStatus.type}'. Expected '${method}'.`)

    const vc = args.vc
    const statusReference = <CredentialStatusList2021Reference>vc.credentialStatus

    let encodedList = await this.storage.get(statusReference.statusListCredential)
    if (!encodedList) throw new Error(`invalid_state: the status list "${statusReference.statusListCredential}" was not found`)

    const statusListIndex = statusReference.statusListIndex
    const list = await statusList.decode(encodedList)
    list.setStatus(statusListIndex, args.options.value)
    encodedList = await list.encode()
    if (!encodedList) throw new Error("illegal_state: the list should be encoded")
    await this.storage.set(statusReference.statusListCredential, encodedList)

  }

  /**
   * Reads the credential status
   */
  async credentialStatusRead(args: CredentialStatusRequestArgs, context: IAgentContext<ICredentialIssuer>): Promise<StatusList2021CredentialSigned> {
    const statusReference = <CredentialStatusList2021Reference>args.credentialStatus

    const statusListCredential = statusReference.statusListCredential
    const encodedList = await this.storage.get(statusListCredential)
    if (!encodedList) throw new Error(`invalid_state: no status list found at '${statusReference.statusListCredential}'`)

    const list = await statusList.decode(encodedList)
    const verified: boolean = await list.getStatus(statusReference.statusListIndex)

    const issuer: string = "" // TODO: 
    const unsignedStatusListCredential = buildStatusList2021Credential(statusListCredential, issuer, statusReference.statusPurpose, encodedList)
    const signed = <StatusList2021CredentialSigned>await context.agent.createVerifiableCredential({
      credential: unsignedStatusListCredential,
      proofFormat: 'lds',
    })

    return signed
  }

  /**
   * {@inheritdoc ICredentialStatusManager.credentialStatusTypes}
   */
  async credentialStatusTypes(): Promise<Array<string>> {
    return [method]
  }
}

export interface StatusList2021Credential extends UnsignedCredential {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  id: string,
  type: ["VerifiableCredential", "StatusList2021Credential"],
  issuer: string,
  issuanceDate: string,
  credentialSubject: {
    id: string,
    type: 'StatusList2021',
    statusPurpose: StatusPurpose,
    encodedList: string
  }
}

export type StatusList2021CredentialSigned = StatusList2021Credential & { proof: ProofType }

/**
 * Build a VC that encapsulates the status list.
 * 
 * @see https://w3c-ccg.github.io/vc-status-list-2021/#statuslist2021credential
 * 
 * @param statusListCredential  URL to the VC that contains the status list. Example: "https://example.com/credentials/status/3"
 * @param issuer DID issuing the status list. Example: "did:example:12345"
 * @param statusPurpose The purpose of the status entry
 * @param encodedList The GZIP-compressed [RFC1952], base-64 encoded [RFC4648] bitstring values 
 *                    for the associated range of verifiable credential status values. 
 *                    The uncompressed bitstring MUST be at least 16KB in size.
 * @returns 
 */
function buildStatusList2021Credential(statusListCredential: string, issuer: string, statusPurpose: StatusPurpose, encodedList: string): StatusList2021Credential {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc/status-list/2021/v1"
    ],
    id: statusListCredential,
    type: ["VerifiableCredential", "StatusList2021Credential"],
    issuer,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `${statusListCredential}#list`,
      type: "StatusList2021",
      statusPurpose,
      encodedList
    },
  }
}
