import { VeramoLdSignature } from './ld-suites'
import { TKeyType } from '@veramo/core'

/**
 * Initializes a list of Veramo-wrapped LD Signature suites and exposes those to the Agent Module
 */
export class LdSuiteLoader {

  constructor(options: {
    veramoLdSignatures: VeramoLdSignature[]
  }) {
    this.signatureMap = options.veramoLdSignatures.reduce((map, obj) => {
      map.set(obj.getSupportedVeramoKeyType(),  obj);
      return map
    }, new Map<TKeyType, VeramoLdSignature>())
  }

  private signatureMap: Map<TKeyType, VeramoLdSignature>;

  getSignatureForKeyType(type: TKeyType) {
    if (this.signatureMap.has(type)) {
      return this.signatureMap.get(type)
    }

    throw new Error('No Veramo LD Signature Suite for ' + type)
  }

}