function concatMaps<K,V>(mapList: Map<K,V>[]) {
  const map = new Map<K,V>()
  for (const mapItem of mapList) {
    for (const item of mapItem) {
      map.set(...item);
    }
  }
  return map
}

/**
 * The LdContextLoader is initialized with a List of Map<string, object>
 * that it unifies into a single Map to provide to the documentLoader within
 * the w3c credential module.
 */
export class LdContextLoader extends Map<string, object> {

  constructor(options: {
    contextsPaths: Map<string, object>[]
  }) {

    super(concatMaps(options.contextsPaths))
  }
}