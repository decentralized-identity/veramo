import { DIDDocument } from 'did-resolver'

interface Options {
  url: string
}

export class UniversalResolver {
  constructor(options: Options) {
    if (!options.url) {
      throw Error('[daf-resolver] Universal: url required')
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
