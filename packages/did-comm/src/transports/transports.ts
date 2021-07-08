import 'cross-fetch/polyfill'
import { v4 as uuidv4 } from 'uuid'

/**
 * Result interface for sending DIDComm messages through
 * {@link IDIDCommTransport.send}.
 * @beta
 */
export interface IDIDCommTransportResult {
  result?: string
  error?: string
}

/**
 * Common interface for transports that can be used in the
 * {@link DIDComm} module.
 * @beta
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
   * @param service The DID Document service section
   * @beta
   */
  isServiceSupported(service: any): boolean

  /**
   * Sends the provided raw message (without further processing) to
   * the service endpoint defined in the provided DID Document service
   * section.
   *
   * @param service The DID Document service section that contains
   * a `serviceEndpoint` entry.
   * @param message The message to be sent.
   * @beta
   */
  send(service: any, message: string): Promise<IDIDCommTransportResult>
}

/**
 * Abstract implementation of {@link IDIDCommTransport}.
 * @beta
 */
export abstract class AbstractDIDCommTransport implements IDIDCommTransport {
  id: string

  /**
   * Shared constructor that takes an optional identifier (for reusing) for
   * this {@link IDIDCommTransport}.
   * @param id An optional identifier for this {@link IDIDCommTransport}.
   * @beta
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
 * @beta
 */
export class DIDCommHttpTransport extends AbstractDIDCommTransport {
  /**
   * Defines the default HTTP method to use if not specified
   * in the DID Document service entry of the recipient.
   */
  httpMethod: 'post' | 'get'

  /**
   * Creates a new {@link DIDCommHttpTransport}.
   * @param httpMethod Default HTTP method if not specified in the service
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
