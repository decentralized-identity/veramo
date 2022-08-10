import canonicalize from 'canonicalize'
/**
 * Class containing reusable JSON canonicalization operations using JSON Canonicalization Scheme (JCS).
 */
export class JsonCanonicalizer {
  /**
   * Canonicalizes the given content as a string
   * @param The content to canonicalize
   * @return The canonicalized content
   */
  static asString(content: unknown): string {
    if (content == null) {
      throw Error('Null content received in canonicalizer')
    }
    // We need to remove all properties with `undefined` as value so that JCS canonicalization will not produce invalid JSON.
    const contentWithoutUndefinedProperties = JsonCanonicalizer.removeAllUndefinedProperties(content)
    const canonicalizedString = canonicalize(contentWithoutUndefinedProperties)
    if (!canonicalizedString) {
      throw new Error('Could not canonicalize input')
    }
    return canonicalizedString
  }
  /**
   * Removes all properties within the given object with `undefined` as value as that would mess up the validity
   */
  private static removeAllUndefinedProperties(content: any): unknown {
    for (const key in content) {
      if (typeof content[key] === 'object') {
        JsonCanonicalizer.removeAllUndefinedProperties(content[key])
      } else if (content[key] === undefined) {
        delete content[key]
      }
    }
    return content
  }
}
