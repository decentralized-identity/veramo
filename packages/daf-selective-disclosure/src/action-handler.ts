import {
  IAgentContext,
  IIdentityManager,
  IKeyManager,
  IPluginMethodMap,
  IAgentPlugin,
  VerifiablePresentation,
} from 'daf-core'
import { IDataStoreORM, TClaimsColumns, FindArgs } from 'daf-typeorm'
import { ISelectiveDisclosureRequest, ICredentialsForSdr, IPresentationValidationResult } from './types'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

export interface ICreateSelectiveDisclosureRequestArgs {
  data: ISelectiveDisclosureRequest
}

export interface IGetVerifiableCredentialsForSdrArgs {
  sdr: Omit<ISelectiveDisclosureRequest, 'issuer'>
  did?: string
}

export interface IValidatePresentationAgainstSdrArgs {
  presentation: VerifiablePresentation
  sdr: ISelectiveDisclosureRequest
}

export interface ISdr extends IPluginMethodMap {
  createSelectiveDisclosureRequest(
    args: ICreateSelectiveDisclosureRequestArgs,
    context: IAgentContext<IIdentityManager & IKeyManager>,
  ): Promise<string>
  getVerifiableCredentialsForSdr(
    args: IGetVerifiableCredentialsForSdrArgs,
    context: IAgentContext<IDataStoreORM>,
  ): Promise<Array<ICredentialsForSdr>>
  validatePresentationAgainstSdr(
    args: IValidatePresentationAgainstSdrArgs,
    context: IAgentContext<{}>,
  ): Promise<IPresentationValidationResult>
}

export class Sdr implements IAgentPlugin {
  readonly methods: ISdr

  constructor() {
    this.methods = {
      createSelectiveDisclosureRequest: this.createSelectiveDisclosureRequest,
      getVerifiableCredentialsForSdr: this.getVerifiableCredentialsForSdr,
      validatePresentationAgainstSdr: this.validatePresentationAgainstSdr,
    }
  }

  async createSelectiveDisclosureRequest(
    args: ICreateSelectiveDisclosureRequestArgs,
    context: IAgentContext<IIdentityManager & IKeyManager>,
  ): Promise<string> {
    const { data } = args
    try {
      const identity = await context.agent.identityManagerGetIdentity({ did: data.issuer })
      delete data.issuer
      Debug('daf:selective-disclosure:create-sdr')('Signing SDR with', identity.did)

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
      return jwt
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getVerifiableCredentialsForSdr(
    args: IGetVerifiableCredentialsForSdrArgs,
    context: IAgentContext<IDataStoreORM>,
  ): Promise<ICredentialsForSdr[]> {
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

  async validatePresentationAgainstSdr(
    args: IValidatePresentationAgainstSdrArgs,
    context: IAgentContext<{}>,
  ): Promise<IPresentationValidationResult> {
    let valid = true
    let claims = []
    for (const credentialRequest of args.sdr.claims) {
      let credentials = args.presentation.verifiableCredential.filter(credential => {
        if (
          credentialRequest.claimType &&
          credentialRequest.claimValue &&
          credential.credentialSubject[credentialRequest.claimType] !== credentialRequest.claimValue
        ) {
          return false
        }

        if (
          credentialRequest.claimType &&
          !credentialRequest.claimValue &&
          credential.credentialSubject[credentialRequest.claimType] === undefined
        ) {
          return false
        }

        if (
          credentialRequest.issuers &&
          !credentialRequest.issuers.map(i => i.did).includes(credential.issuer.id)
        ) {
          return false
        }
        if (
          credentialRequest.credentialContext &&
          !credential['@context'].includes(credentialRequest.credentialContext)
        ) {
          return false
        }

        if (credentialRequest.credentialType && !credential.type.includes(credentialRequest.credentialType)) {
          return false
        }

        return true
      })

      if (credentialRequest.essential === true && credentials.length == 0) {
        valid = false
      }

      claims.push({
        ...credentialRequest,
        credentials,
      })
    }
    return { valid, claims }
  }
}
