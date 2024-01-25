import {
  FindArgs,
  IAgentContext,
  IAgentPlugin,
  ICredentialIssuer,
  IDataStoreORM,
  IDIDManager,
  IKey,
  IKeyManager,
  KEY_ALG_MAPPING,
  TAlg,
  TClaimsColumns,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'

import {
  ICreateProfileCredentialsArgs,
  ICreateSelectiveDisclosureRequestArgs,
  ICredentialsForSdr,
  IGetVerifiableCredentialsForSdrArgs,
  IPresentationValidationResult,
  ISelectiveDisclosure,
  ISelectiveDisclosureRequest,
  IValidatePresentationAgainstSdrArgs,
} from './types.js'
import { schema } from './plugin.schema.js'
import { createJWT } from 'did-jwt'
import Debug from 'debug'
import {
  asArray,
  bytesToBase64,
  computeEntryHash,
  decodeCredentialToObject,
  extractIssuer,
  intersect,
} from '@veramo/utils'

/**
 * This class adds support for creating
 * {@link https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md | uPort Selective Disclosure}
 * requests and interpret the responses received.
 *
 * This implementation of the uPort protocol uses
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Presentation}
 * as the response encoding instead of a `shareReq`.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 *
 * @deprecated This plugin is deprecated as it implements a non-standard protocol created for the uPort project. It
 *   will be removed in a future release.
 */
export class SelectiveDisclosure implements IAgentPlugin {
  readonly methods: ISelectiveDisclosure
  readonly schema = schema.ISelectiveDisclosure

  constructor() {
    this.methods = {
      createSelectiveDisclosureRequest: this.createSelectiveDisclosureRequest,
      getVerifiableCredentialsForSdr: this.getVerifiableCredentialsForSdr,
      validatePresentationAgainstSdr: this.validatePresentationAgainstSdr,
      createProfilePresentation: this.createProfilePresentation,
    }
  }

  /**
   * Creates a Selective disclosure request, encoded as a JWT.
   *
   * @remarks See
   *   {@link https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md | uPort Selective Disclosure}
   *
   * @param args - The param object with the properties necessary to create the request. See
   *   {@link ISelectiveDisclosureRequest}
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  async createSelectiveDisclosureRequest(
    args: ICreateSelectiveDisclosureRequestArgs,
    context: IAgentContext<IDIDManager & IKeyManager>,
  ): Promise<string> {
    try {
      const identifier = await context.agent.didManagerGet({ did: args.data.issuer })
      const data: Partial<ISelectiveDisclosureRequest> = args.data
      delete data.issuer
      Debug('veramo:selective-disclosure:create-sdr')('Signing SDR with', identifier.did)

      // only these signature algorithms are supported
      const algs: TAlg[] = ['ES256K', 'ES256K-R', 'EdDSA', 'ES256']

      const key = identifier.keys.find((k: IKey) => {
        return (
          Object.keys(KEY_ALG_MAPPING).includes(k.type) &&
          KEY_ALG_MAPPING[k.type] &&
          intersect(intersect(k.meta?.algorithms, KEY_ALG_MAPPING[k.type]), algs).length > 0
        )
      })

      if (!key) throw Error('Signing key not found')

      const algorithm = KEY_ALG_MAPPING[key.type]?.[0]

      if (!algorithm) throw Error('Unsupported key type')

      const signer = (data: string | Uint8Array) => {
        let dataString, encoding: 'base64' | undefined
        if (typeof data === 'string') {
          dataString = data
          encoding = undefined
        } else {
          ;(dataString = bytesToBase64(data)), (encoding = 'base64')
        }
        return context.agent.keyManagerSign({ keyRef: key.kid, data: dataString, encoding, algorithm })
      }
      const jwt = await createJWT(
        {
          type: 'sdr',
          ...data,
        },
        {
          signer,
          alg: algorithm,
          issuer: identifier.did,
        },
      )
      return jwt
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Gathers the required credentials necessary to fulfill a Selective Disclosure Request.
   * It uses a {@link @veramo/core-types#IDataStoreORM} plugin implementation to query the local database for
   * the required credentials.
   *
   * @param args - Contains the Request to be fulfilled and the DID of the subject
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
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

      if (credentialRequest.issuers && credentialRequest.issuers.length > 0) {
        findArgs.where?.push({ column: 'issuer', value: credentialRequest.issuers.map((i) => i.did) })
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

  /**
   * Validates a
   * {@link https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md | uPort Selective Disclosure response} encoded as a `Presentation`
   *
   * @param args - Contains the request and the response `Presentation` that needs to be checked.
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  async validatePresentationAgainstSdr(
    args: IValidatePresentationAgainstSdrArgs,
    context: IAgentContext<{}>,
  ): Promise<IPresentationValidationResult> {
    let valid = true
    let claims = []
    for (const credentialRequest of args.sdr.claims) {
      let credentials = (args.presentation?.verifiableCredential || [])
        .map(decodeCredentialToObject)
        .filter((credential: VerifiableCredential) => {
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
            !credentialRequest.issuers
              .map((i) => i.did)
              .includes(extractIssuer(credential, { removeParameters: true }))
          ) {
            return false
          }
          if (
            credentialRequest.credentialContext &&
            !asArray(credential['@context'] || []).includes(credentialRequest.credentialContext)
          ) {
            return false
          }

          if (
            credentialRequest.credentialType &&
            !asArray(credential.type || []).includes(credentialRequest.credentialType)
          ) {
            return false
          }

          return true
        })

      if (credentialRequest.essential === true && credentials.length == 0) {
        valid = false
      }

      claims.push({
        ...credentialRequest,
        credentials: credentials.map((vc) => ({
          hash: computeEntryHash(vc),
          verifiableCredential: vc,
        })),
      })
    }
    return { valid, claims }
  }

  /**
   * Creates profile credentials
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  async createProfilePresentation(
    args: ICreateProfileCredentialsArgs,
    context: IAgentContext<ICredentialIssuer & IDIDManager>,
  ): Promise<VerifiablePresentation> {
    const identifier = await context.agent.didManagerGet({ did: args.holder })

    const credentials = []

    if (args.name) {
      const credential = await context.agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            name: args.name,
          },
        },
        proofFormat: 'jwt',
      })

      credentials.push(credential)
    }

    if (args.picture) {
      const credential = await context.agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Profile'],
          credentialSubject: {
            id: identifier.did,
            picture: args.picture,
          },
        },
        proofFormat: 'jwt',
      })

      credentials.push(credential)
    }

    if (args.url) {
      const credential = await context.agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          type: ['Profile'],
          credentialSubject: {
            id: identifier.did,
            url: args.url,
          },
        },
        proofFormat: 'jwt',
      })

      credentials.push(credential)
    }

    const profile = await context.agent.createVerifiablePresentation({
      presentation: {
        verifier: args.holder ? [args.holder] : [],
        holder: identifier.did,
        type: ['Profile'],
        verifiableCredential: credentials,
      },
      proofFormat: 'jwt',
      save: args.save,
    })

    if (args.verifier && args.send) {
      await context.agent.sendMessageDIDCommAlpha1({
        save: args.save,
        data: {
          from: identifier.did,
          to: args.verifier,
          type: 'jwt',
          body: profile.proof.jwt,
        },
      })
    }

    return profile
  }
}
