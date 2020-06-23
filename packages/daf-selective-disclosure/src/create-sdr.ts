import { IAgentContext, IIdentityManager, IKeyManager, IPluginMethodMap } from 'daf-core'
import { ISelectiveDisclosureRequest } from './types'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

const debug = Debug('daf:selective-disclosure:create-sdr')

type IContext = IAgentContext<IIdentityManager & IKeyManager>

export type TCreateSelectiveDisclosureRequest = (
  args: {
    data: ISelectiveDisclosureRequest
  },
  context: IContext,
) => Promise<string>

export interface ICreateSelectiveDisclosureRequest extends IPluginMethodMap {
  createSelectiveDisclosureRequest: TCreateSelectiveDisclosureRequest
}

export const createSelectiveDisclosureRequest: TCreateSelectiveDisclosureRequest = async (args, context) => {
  const { data } = args
  try {
    const identity = await context.agent.identityManagerGetIdentity({ did: data.issuer })
    delete data.issuer
    debug('Signing SDR with', identity.did)

    const key = identity.keys.find(k => k.type === 'Secp256k1')
    if (!key) throw Error('Signing key not found')
    const signer = (data: string) => context.agent.keyManagerSignJWT({ kid: key.kid, data })
    const jwt = await createJWT(
      {
        type: 'sdr',
        ...data,
      },
      {
        signer,
        alg: 'ES256K-R',
        issuer: identity.did,
      },
    )
    debug(jwt)
    return jwt
  } catch (error) {
    debug(error)
    return Promise.reject(error)
  }
}
