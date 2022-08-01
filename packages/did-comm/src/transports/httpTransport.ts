import { AbstractDIDCommTransport, IDIDCommTransportResult } from "./transports"

/**
 * Implementation of {@link IDIDCommTransport} to provide a simple
 * transport based on HTTP(S) requests.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
 export class DIDCommHttpTransport extends AbstractDIDCommTransport {
    /**
     * Defines the default HTTP method to use if not specified
     * in the DID Document service entry of the recipient.
     */
    httpMethod: 'post' | 'get'
  
    /**
     * Creates a new {@link DIDCommHttpTransport}.
     * @param httpMethod - Default HTTP method if not specified in the service
     * section.
     */
    constructor(httpMethod?: 'post' | 'get') {
      super()
      this.httpMethod = httpMethod || 'post'
    }
  
    /** {@inheritdoc AbstractDIDCommTransport.isServiceSupported} */
    isServiceSupported(service: any) {
      // FIXME: TODO: addtionally handle serviceEndpoint objects in did docs
      return (
        typeof service.serviceEndpoint === 'string' &&
        (service.serviceEndpoint.startsWith('http://') || service.serviceEndpoint.startsWith('https://'))
      )
    }
  
    /** {@inheritdoc AbstractDIDCommTransport.send} */
    async send(service: any, message: string): Promise<IDIDCommTransportResult> {
      try {
        const response = await fetch(service.serviceEndpoint, {
          method: this.httpMethod,
          body: message,
        })
  
        let result
        if (response.ok) {
          result = {
            result: 'successfully sent message: ' + response.statusText,
          }
        } else {
          result = {
            error: 'failed to send message: ' + response.statusText,
          }
        }
        return result
      } catch (e) {
        return {
          error: 'failed to send message: ' + e,
        }
      }
    }
  }
  