import 'cross-fetch/polyfill'
import { v4 as uuidv4 } from 'uuid'

/**
 * Result interface for sending DIDComm messages through
 * {@link IDIDCommTransport.send}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommTransportResult {
  result?: string
  error?: string
}

/**
 * Common interface for transports that can be used in the
 * {@link DIDComm} module.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommTransport {
  /**
   * Identifier of this transport that can be used in case the
   * message thread supports reusing the transport connection.
   */
  id: string

  /**
   * Returns `true` if this transport is suitable for the provided
   * DID Document service section, otherwise `false`.
   * @param service - The DID Document service section
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  isServiceSupported(service: any): boolean

  /**
   * Sends the provided raw message (without further processing) to
   * the service endpoint defined in the provided DID Document service
   * section.
   *
   * @param service - The DID Document service section that contains
   * a `serviceEndpoint` entry.
   * @param message - The message to be sent.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  send(service: any, message: string): Promise<IDIDCommTransportResult>
}

/**
 * Abstract implementation of {@link IDIDCommTransport}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export abstract class AbstractDIDCommTransport implements IDIDCommTransport {
  id: string

  /**
   * Shared constructor that takes an optional identifier (for reusing) for
   * this {@link IDIDCommTransport}.
   *
   * @param id - An optional identifier for this {@link IDIDCommTransport}.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  constructor(id?: string) {
    this.id = id || uuidv4()
  }

  /** {@inheritdoc IDIDCommTransport.isServiceSupported} */
  abstract isServiceSupported(service: any): boolean

  /** {@inheritdoc IDIDCommTransport.send} */
  abstract send(service: any, message: string): Promise<IDIDCommTransportResult>
}

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
    // serviceEndpoint can be a string, a ServiceEndpoint object, or an array of strings or ServiceEndpoint objects
    return (
      (typeof service.serviceEndpoint === 'string'  && (
        service.serviceEndpoint.startsWith('http://') || service.serviceEndpoint.startsWith('https://')
      ))
      || 
      (service.serviceEndpoint.uri &&  typeof service.serviceEndpoint.uri === 'string' && (
        service.serviceEndpoint.uri.startsWith('http://') || service.serviceEndpoint.uri.startsWith('https://')
      ))
      || 
      (service.serviceEndpoint.length > 0 &&  typeof service.serviceEndpoint[0] === 'string' && (
        service.serviceEndpoint[0].startsWith('http://') || service.serviceEndpoint[0].startsWith('https://')
      ))
      || 
      (service.serviceEndpoint.length > 0 &&  typeof service.serviceEndpoint[0].uri === 'string' && (
        service.serviceEndpoint[0].uri.startsWith('http://') || service.serviceEndpoint[0].uri.startsWith('https://')
      ))
    )
  }

  /** {@inheritdoc AbstractDIDCommTransport.send} */
  async send(service: any, message: string): Promise<IDIDCommTransportResult> {
    let serviceEndpointUrl = ''
    if (typeof service.serviceEndpoint === 'string') {
      serviceEndpointUrl = service.serviceEndpoint
    } else if (service.serviceEndpoint.uri) {
      serviceEndpointUrl = service.serviceEndpoint.uri
    } else if (service.serviceEndpoint.length > 0) {
      if (typeof service.serviceEndpoint[0] === 'string') {
        serviceEndpointUrl = service.serviceEndpoint[0]
      } else if (service.serviceEndpoint[0].uri) {
        serviceEndpointUrl = service.serviceEndpoint[0].uri
      }
    }
    
    try {
      const response = await fetch(serviceEndpointUrl, {
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
