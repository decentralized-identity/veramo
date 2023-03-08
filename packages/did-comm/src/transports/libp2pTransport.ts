import { IDIDCommTransport, IDIDCommTransportResult } from "./transports"
import { pipe } from "it-pipe"
import map from "it-map"
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as lp from 'it-length-prefixed'
import { v4 as uuidv4 } from 'uuid'
import type { Libp2p } from "libp2p"


/**
 * Implementation of {@link IDIDCommTransport} to provide a
 * transport based on libp2p streams
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
 export class DIDCommLibp2pTransport implements IDIDCommTransport {
  id: string
  libp2pNode: Libp2p

  /**
   * Creates a new {@link DIDCommLibp2pTransport}.
   * @param libp2pNodeConfig - Config used for "dialer" node.
   */
  constructor(libp2pNode: Libp2p, id?: string) {
    this.id = id || uuidv4()
    
    // const webRtcStar = new WebRTCStar()
    this.libp2pNode = libp2pNode
    
  }

  /** {@inheritdoc AbstractDIDCommTransport.isServiceSupported} */
  isServiceSupported(service: any) {
    return (
      typeof service.serviceEndpoint !== 'string' &&
      service.serviceEndpoint.transportType === 'libp2p' &&
      (service.serviceEndpoint.multiAddr/* || 
        (service.serviceEndpoint.peerId && service.serviceEndpoint.routingKeys)*/
        // TODO(nickreynolds): support peerId+routingKeys
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
        (source) => map(source, (string) => uint8ArrayFromString(string)),
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
  }
}