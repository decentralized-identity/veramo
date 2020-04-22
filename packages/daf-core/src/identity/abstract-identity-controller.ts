export interface ServiceEndpoint {
  id: string
  type: string
  serviceEndpoint: string
  description?: string
}

export abstract class AbstractIdentityController {
  /**
   *
   * @param type String
   * @param proofPurpose String[]
   */
  addPublicKey(type: string, proofPurpose?: string[]): Promise<string> {
    return Promise.reject('Method addPublicKey not implemented')
  }

  /**
   *
   * @param keyId String
   */
  removePublicKey(keyId: string): Promise<boolean> {
    return Promise.reject('Method removePublicKey not implemented')
  }

  /**
   *
   * @param service ServiceEndpoint
   */
  addService(service: ServiceEndpoint): Promise<any> {
    return Promise.reject('Method addService not implemented')
  }

  removeService(service: ServiceEndpoint): Promise<boolean> {
    return Promise.reject('Method removeService not implemented')
  }
}
