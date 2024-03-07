import { VeramoLdSignature } from './ld-suites.js'
import { TKeyType } from '@veramo/core-types'
import { asArray } from '@veramo/utils'

/**
 * Initializes a list of Veramo-wrapped LD Signature suites and exposes those to the Agent Module
 */
export class LdSuiteLoader {
  constructor(options: { veramoLdSignatures: VeramoLdSignature[] }) {
    options.veramoLdSignatures.forEach((ldSuite) => {
      const keyType = ldSuite.getSupportedVeramoKeyType()
      let verifierMapping = this.signatureMap[keyType] ?? {}
      asArray(ldSuite.getSupportedVerificationType()).forEach((verificationType) => {
        verifierMapping[verificationType] = [...(verifierMapping[verificationType] ?? []), ldSuite]
      })
      return (this.signatureMap[keyType] = { ...this.signatureMap[keyType], ...verifierMapping })
    })
  }

  private signatureMap: Record<string, Record<string, VeramoLdSignature[]>> = {}

  getSignatureSuiteForKeyType(type: TKeyType, verificationType: string) {
    const suite = this.signatureMap[type]?.[verificationType]
    if (suite) return suite

    throw new Error('No Veramo LD Signature Suite for ' + type)
  }

  getAllSignatureSuites(): VeramoLdSignature[] {
    return Object.values(this.signatureMap)
      .map((x) => Object.values(x))
      .flat(2)
  }

  getAllSignatureSuiteTypes() {
    return Object.values(this.signatureMap)
      .map((x) => Object.keys(x))
      .flat()
  }
}
