import {
  CredentialStatusGenerateArgs,
  CredentialStatusReference,
  CredentialStatusUpdateArgs, IAgentPlugin, ICredentialStatusManager, VerifiableCredential
} from '@veramo/core'
import { randomUUID } from 'crypto'

const method: string = "SimpleStatus"

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

export interface SimpleCredentialStatusResponse {
  revoked: boolean
}

/**
 * A simple storage provider used to store the revoked credentials `id`s.
 * 
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface RevocationStorage {
  add(id: string): void
  remove(id: string): void
  contains(id: string): boolean
}

/**
 * The options for updating a credential using the simple revocation method.
 *  
 * @see {@link CredentialStatusUpdateArgs}
 * 
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface SimpleRevocationUpdateOptions extends CredentialStatusUpdateArgs {
  options: {
    /**
     * Indicates if the VC should be revoked or not.
     * 
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    revoke: boolean
  }
}

/**
 * The arguments to generate a simple revocation status field.
 * 
 * @see {@link CredentialStatusGenerateArgs}
 * 
 * @beta This API may change without a BREAKING CHANGE notice. 
 */
export interface SimpleRevocationGenerateArgs extends CredentialStatusGenerateArgs {
  /**
   * The verifiable credential whose status field will be generated.
   * 
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  vc: VerifiableCredential


  /**
   * Endpoint prefix for credential status ID.
   * 
   * It'll be used to prefix the `id` value in the credential status.
   * 
   * @example
   * ```
   *   "credentialStatus": {
   *      "id": "https://www.example.com/credentials/status/",
   *      "type": "SimpleStatus",
   *   },
   * ```
   * 
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  endpoint: string
}

/**
 * A credential revocation plugin which implements a simple revocation mechanism
 * which stores revocation information locally and returns a boolean status per credential 
 * which indicates if it's revoked or not.
 * 
 * The local storage is a simple file with the `id` of the revoked VCs, one per line.
 * 
 * This plugin is merally and example of how a revocation plugin can be implemented using
 * the {@link @veramo/core#ICredentialStatusManager | ICredentialStatusManager} interface.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class SimpleCredentialStatusPlugin implements IAgentPlugin {
  readonly methods: ICredentialStatusManager

  constructor(private readonly storage: RevocationStorage) {
    this.methods = {
      credentialStatusGenerate: this.credentialStatusGenerate.bind(this),
      credentialStatusUpdate: this.credentialStatusUpdate.bind(this),
      credentialStatusRead: this.credentialStatusRead.bind(this),
      credentialStatusTypes: this.credentialStatusTypes.bind(this)
    }
  }


  /**
   * {@inheritdoc ICredentialStatusManager.credentialStatusUpdate}
   */
  async credentialStatusUpdate(args: SimpleRevocationUpdateOptions): Promise<any> {
    const credentialStatus = args.vc.credentialStatus
    if (!credentialStatus || !credentialStatus.id) throw new Error("invalid_argument: `credentialStatus.id` must be defined in the credential")

    if (credentialStatus.type !== method) throw new Error(`invalid_argument: unrecognized method '${credentialStatus.type}'. Expected '${method}'.`)

    // Get the UUID in the `credentialStatus.id` URL 
    const uuid = credentialStatus.id.split('/').pop()
    if (!uuid || !uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) throw new Error(`invalid_argument: invalid 'credentialStatus.id' for method '${method}'`)

    const revoke = args.options.revoke
    if (revoke) {
      this.storage.add(uuid)
    }
    else {
      this.storage.remove(uuid)
    }
  }

  /**
   * {@inheritdoc ICredentialStatusManager.credentialStatusGenerate}
   */
  async credentialStatusGenerate(args: SimpleRevocationGenerateArgs): Promise<CredentialStatusReference> {
    const type = method
    const uuid = randomUUID()
    const endpoint = args.endpoint.replace(/\/$/, "")
    const id = `${endpoint}/${uuid}`
    return { id, type };
  }

  /**
   * Reads the credential status
   */
  async credentialStatusRead(args: CredentialStatusRequestArgs): Promise<SimpleCredentialStatusResponse> {
    const uuid = args.credentialStatus.id.split('/').pop()
    if (!uuid) throw new Error(`invalid_argument: invalid 'credentialStatus.id' for method '${method}'`)

    const revoked = this.storage.contains(uuid)
    return { revoked };
  }

  /**
   * {@inheritdoc ICredentialStatusManager.credentialStatusTypes}
   */
  async credentialStatusTypes(): Promise<Array<string>> {
    return [method]
  }
}
