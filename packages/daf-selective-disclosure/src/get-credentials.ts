import { IAgentContext, IPluginMethodMap } from 'daf-core'
import { IDataStoreORM, TClaimsColumns, FindArgs } from 'daf-typeorm'
import { ISelectiveDisclosureRequest, ICredentialsForSdr } from './types'

type IContext = IAgentContext<IDataStoreORM>

export type TGetVerifiableCredentialsForSdr = (
  args: {
    sdr: Omit<ISelectiveDisclosureRequest, 'issuer'>
    did?: string
  },
  context: IContext,
) => Promise<ICredentialsForSdr[]>

export interface IGetVerifiableCredentialsForSdr extends IPluginMethodMap {
  getVerifiableCredentialsForSdr: TGetVerifiableCredentialsForSdr
}

export const getVerifiableCredentialsForSdr: TGetVerifiableCredentialsForSdr = async (args, context) => {
  const result: ICredentialsForSdr[] = []
  const findArgs: FindArgs<TClaimsColumns> = { where: [] }
  for (const credentialRequest of args.sdr.claims) {
    if (credentialRequest.claimType) {
      findArgs.where?.push({ column: 'type', value: [credentialRequest.claimType] })
    }

    if (credentialRequest.claimValue) {
      findArgs.where?.push({ column: 'value', value: [credentialRequest.claimValue] })
    }

    if (credentialRequest.issuers) {
      findArgs.where?.push({ column: 'issuer', value: credentialRequest.issuers.map(i => i.did) })
    }

    if (credentialRequest.credentialType) {
      findArgs.where?.push({
        column: 'credentialType',
        value: ['%' + credentialRequest.credentialType + '%'],
        op: 'Like',
      })
    }

    if (credentialRequest.credentialContext) {
      findArgs.where?.push({
        column: 'context',
        value: ['%' + credentialRequest.credentialContext + '%'],
        op: 'Like',
      })
    }

    if (args.did || args.sdr.subject) {
      findArgs.where?.push({ column: 'subject', value: ['' + (args.did || args.sdr.subject)] })
    }

    const credentials = await context.agent.dataStoreORMGetVerifiableCredentialsByClaims(findArgs)

    result.push({
      ...credentialRequest,
      credentials,
    })
  }
  return result
}
