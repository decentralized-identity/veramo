import { AbstractDIDCommTransport, IDIDCommTransportResult } from "./transports"
// import { WebRTCStar } from '@libp2p/webrtc-star'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as lp from 'it-length-prefixed'

// TODO(nickreynolds): should use it-map package, but having schema generation issue when using this package
// import map from "it-map"
const map = async function * (source: any, func: any) {
    for await (const val of source) {
        yield func(val)
    }
}

/**
 * Implementation of {@link IDIDCommTransport} to provide a
 * transport based on libp2p streams
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
 export class DIDCommLibp2pTransport extends AbstractDIDCommTransport {

  libp2pNode: any

  /**
   * Creates a new {@link DIDCommLibp2pTransport}.
   * @param libp2pNodeConfig - Config used for "dialer" node.
   */
  constructor(libp2pNode: any) {
    super()
    
    // const webRtcStar = new WebRTCStar()
    this.libp2pNode = libp2pNode
  }

  /** {@inheritdoc AbstractDIDCommTransport.isServiceSupported} */
  isServiceSupported(service: any) {
    return (
      typeof service.serviceEndpoint === 'string' &&
      service.serviceEndpoint.transportType === 'libp2p' &&
      (service.serviceEndpoint.multiAddr || 
        (service.serviceEndpoint.peerId && service.serviceEndpoint.routingKeys)
      )
    )
  }

  /** {@inheritdoc AbstractDIDCommTransport.send} */
  async send(service: any, message: string): Promise<IDIDCommTransportResult> {
    try {
      const stream = await this.libp2pNode.dialProtocol(service.serviceEndpoint.multiAddr, 'didcomm/v2')

      // TODO(nickreynolds): add support for serviceEndpoint.routingKeys

      await pipe(
        message, 
        (source) => map(source, (s: any) => uint8ArrayFromString(s)),
        lp.encode(),
        stream.sink
      )
      stream.close()
    
      return {
        result: 'successfully sent message over libp2p',
      }
    } catch (e) {
      return {
        error: 'failed to send message: ' + e,
      }
    }
    // return {}
  }
}