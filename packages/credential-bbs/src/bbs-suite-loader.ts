import { VeramoBbsSignature } from './bbs-suites.js'
import { TKeyType } from '@veramo/core-types'
import { asArray } from '@veramo/utils'

/**
 * Initializes a list of Veramo-wrapped BBS Signature suites and exposes those to the Agent Module
 */
export class BbsSuiteLoader {
  constructor(options: { veramoBbsSignatures: VeramoBbsSignature[] }) {
    options.veramoBbsSignatures.forEach((bbsSuite) => {
      const keyType = bbsSuite.getSupportedVeramoKeyType()
      let verifierMapping = this.signatureMap[keyType] ?? {}
      asArray(bbsSuite.getSupportedVerificationType()).forEach((verificationType) => {
        verifierMapping[verificationType] = [...(verifierMapping[verificationType] ?? []), bbsSuite]
      })
      return (this.signatureMap[keyType] = { ...this.signatureMap[keyType], ...verifierMapping })
    })
  }

  private signatureMap: Record<string, Record<string, VeramoBbsSignature[]>> = {}

  getSignatureSuiteForKeyType(type: TKeyType, verificationType: string) {
    const suite = this.signatureMap[type]?.[verificationType]
    if (suite) return suite

    throw new Error('No Veramo BBS Signature Suite for ' + type)
  }

  getAllSignatureSuites(): VeramoBbsSignature[] {
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
