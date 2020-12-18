import { DIDDocument, ParsedDID, Resolver } from 'did-resolver'
import fetch from 'cross-fetch'

interface Options {
  url: string
}

export class UniversalResolver {
  constructor(options: Options) {
    if (!options.url) {
      throw Error('[did-resolver] Universal: url required')
    }

    const resolve = async (didUrl: string): Promise<DIDDocument> => {
      try {
        const result = await fetch(options.url + didUrl)
        const ddo = await result.json()
        return ddo.didDocument
      } catch (e) {
        return Promise.reject(e)
      }
    }

    return resolve
  }
}
