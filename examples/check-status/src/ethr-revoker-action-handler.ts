import { Agent, AbstractActionHandler, Action, Credential, Presentation, Key, Identity } from 'daf-core'

import { EthrCredentialRevoker } from 'ethr-status-registry'

import { decodeJWT, verifyJWT } from 'did-jwt'
import { DIDDocument } from 'did-resolver'
import { ethers } from 'ethers'

export const ActionTypes = {
  revokeCredential: 'jwt.status.revoke.ethr',
}

export interface ActionEthrRevoke extends Action {
  data: Credential | string
  revoker?: Identity | string
  matchDidDoc?: boolean
  waitForTx?: boolean
}

export interface ConfigOptions {
  networks?: [{ name: string; rpcUrl?: string; provider?: object }]
  infuraProjectId?: string
}

export class EthrRevokerActionHandler extends AbstractActionHandler {
  private statusRevoker: EthrCredentialRevoker

  constructor(config: ConfigOptions) {
    super()
    this.statusRevoker = new EthrCredentialRevoker(config)
  }

  public async handleAction(action: Action, agent: Agent): Promise<string> {
    if (action.type === ActionTypes.revokeCredential) {
      const { data, revoker, matchDidDoc, waitForTx } = action as ActionEthrRevoke
      try {
        let rawToken: string = null
        if (typeof data === 'string') {
          rawToken = data
        } else {
          rawToken = data.raw
        }

        const decoded = await decodeJWT(rawToken)

        let revokerDID: string

        if (revoker) {
          if (typeof revoker === 'string') {
            revokerDID = revoker
          } else {
            revokerDID = (revoker as Identity).did
          }
        } else {
          revokerDID = decoded?.payload?.iss
        }

        const identity = await agent.identityManager.getIdentity(revokerDID)
        const revokerKey = await identity.keyByType('Secp256k1')

        if (matchDidDoc) {
          const didDoc: DIDDocument = await agent.didResolver.resolve(revokerDID)
          const ethAddress = ethers.utils.computeAddress(revokerKey.serialized.publicKeyHex)
          const docKey =
            didDoc &&
            didDoc.publicKey &&
            didDoc.publicKey.find(item => typeof item.ethereumAddress !== 'undefined')
          //TODO: check if docKey matches the revokerKey
        }

        const txHash = await this.statusRevoker.revoke(rawToken, revokerKey.signEthTransaction)

        if (waitForTx) {
          //TODO: wait for transaction. use constructor config to build provider => await provider.waitForTransaction(txHash)
        }

        return txHash
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, agent)
  }
}
