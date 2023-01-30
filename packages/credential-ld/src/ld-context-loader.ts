/**
 * The LdContextLoader is initialized with a List of Map<string, ContextDoc | Promise<ContextDoc>>
 * that it unifies into a single Map to provide to the documentLoader within
 * the w3c credential module.
 */
import { isIterable, OrPromise, RecordLike } from '@veramo/utils'
import { ContextDoc } from './types.js'

export class LdContextLoader {
  private readonly contexts: Record<string, OrPromise<ContextDoc>>

  constructor(options: { contextsPaths: RecordLike<OrPromise<ContextDoc>>[] }) {
    this.contexts = {}
    Array.from(options.contextsPaths, (mapItem) => {
      const map = isIterable(mapItem) ? mapItem : Object.entries(mapItem)
      // generate-plugin-schema is failing unless we use the cast to `any[]`
      for (const [key, value] of map as any[]) {
        this.contexts[key] = value
      }
    })
  }

  has(url: string): boolean {
    return this.contexts[url] !== null && typeof this.contexts[url] !== 'undefined'
  }

  async get(url: string): Promise<ContextDoc> {
    return this.contexts[url]
  }
}
