/**
 * The LdContextLoader is initialized with a List of Map<string, object>
 * that it unifies into a single Map to provide to the documentLoader within
 * the w3c credential module.
 */
export class LdContextLoader {
  private contexts: Record<string, object>

  constructor(options: {
    contextsPaths: (Map<string, object> | Record<string, object>)[]
  }) {
    this.contexts = {};
    // generate-plugin-schema is failing unless we use the cast to `any[]`
    Array.from(options.contextsPaths as any[], (mapItem) => {
      for (const [key, value] of mapItem) {
        this.contexts[key] = value
      }
    })
  }

  has(url: string): boolean {
    return this.contexts[url] !== null && typeof this.contexts[url] !== 'undefined'
  }

  get(url: string): object | undefined {
    return this.contexts[url]
  }
}