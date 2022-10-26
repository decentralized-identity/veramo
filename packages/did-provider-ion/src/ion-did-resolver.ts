import { fetch } from 'cross-fetch'
import { IIdentifier } from '@veramo/core'
import { DIDResolutionOptions, DIDResolutionResult, DIDResolver } from 'did-resolver'
import { IonDidForm } from './types/ion-provider-types'

export const resolveDidIonFromIdentifier = async (
  identifier: IIdentifier,
  ionDidForm: IonDidForm = IonDidForm.LONG,
  options?: DIDResolutionOptions
): Promise<DIDResolutionResult> => {
  return await resolve(ionDidForm == IonDidForm.LONG ? identifier.did : identifier.alias!, options)
}

export const resolveDidIon: DIDResolver = async (didUrl: string, options?: DIDResolutionOptions): Promise<DIDResolutionResult> => {
  return resolve(didUrl, options)
}

const resolve = async (didUrl: string, options?: DIDResolutionOptions) => {
  return fetch(
    (options?.nodeEndpoint || 'https://beta.discover.did.microsoft.com/1.0/identifiers/') + didUrl,
  ).then(async (response) => {
    if (response.status >= 400) {
      throw new Error(`Not Found:\r\n${didUrl}\r\n${JSON.stringify(await response.json())}`)
    }
    return response.json()
  })
}

/**
 * @public
 */
export function getDidIonResolver() {
  return { ion: resolveDidIon }
}
