import { Agent, AbstractActionHandler, Action, Credential, Presentation } from 'daf-core'

import { EthrStatusRegistry } from 'ethr-status-registry'
import { Status, CredentialStatus } from 'credential-status'

import { decodeJWT, verifyJWT } from 'did-jwt'
import { DIDDocument } from 'did-resolver'

export const ActionTypes = {
  checkCredentialStatus: 'verify.status.jwt',
}

export interface ActionCheckStatus extends Action {
  data: Credential | any
}

export interface ConfigOptions {
  networks?: [{ name: string; rpcUrl?: string; provider?: object }]
  infuraProjectId?: string
}

export interface Verified {
  payload: any
  doc: DIDDocument
  issuer: string
  signer: object
  jwt: string
  credentialStatus?: CredentialStatus
}

export class CredentialStatusActionHandler extends AbstractActionHandler {
  private statusResolver: Status

  constructor(config: ConfigOptions) {
    super()
    this.statusResolver = new Status({
      ...new EthrStatusRegistry(config).asStatusMethod,
    })
  }

  public async handleAction(action: Action, agent: Agent): Promise<Verified> {
    if (action.type === ActionTypes.checkCredentialStatus) {
      const { data } = action as ActionCheckStatus
      try {
        let rawToken: string = null
        if (typeof data === 'string') {
          rawToken = data
        } else {
          rawToken = data.raw
        }

        const decoded = await decodeJWT(rawToken)
        const verifyResult: Verified = await verifyJWT(rawToken, {
          resolver: agent.didResolver,
          audience: decoded.payload.aud as any,
        })

        const statusResult = await this.statusResolver.checkStatus(rawToken, verifyResult.doc)

        verifyResult.credentialStatus = statusResult

        return verifyResult
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, agent)
  }
}
