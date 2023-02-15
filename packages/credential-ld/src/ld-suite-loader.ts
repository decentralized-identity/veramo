import { VeramoLdSignature } from './ld-suites.js'
import { TKeyType } from '@veramo/core-types'

/**
 * Initializes a list of Veramo-wrapped LD Signature suites and exposes those to the Agent Module
 */
export class LdSuiteLoader {
  constructor(options: { veramoLdSignatures: VeramoLdSignature[] }) {
    options.veramoLdSignatures.forEach((obj) => {
      const keyType = obj.getSupportedVeramoKeyType()
      const verificationType = obj.getSupportedVerificationType()
      return this.signatureMap[keyType] = { ...this.signatureMap[keyType], [verificationType]: obj }
    })
  }
  private signatureMap: Record<string, Record<string, VeramoLdSignature>> = {}

  getSignatureSuiteForKeyType(type: TKeyType, verificationType: string) {
    const suite = this.signatureMap[type]?.[verificationType]
    if (suite) return suite

    throw new Error('No Veramo LD Signature Suite for ' + type)
  }

  getAllSignatureSuites(): VeramoLdSignature[] {
    return Object.values(this.signatureMap).map((x) => Object.values(x)).flat()
  }

  getAllSignatureSuiteTypes() {
    return Object.values(this.signatureMap).map((x) => Object.keys(x)).flat()
  }
}
