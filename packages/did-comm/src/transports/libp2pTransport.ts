import { IDIDCommTransport, IDIDCommTransportResult } from "./transports"
// import { WebRTCStar } from '@libp2p/webrtc-star'
import { pipe } from "it-pipe"
import map from "it-map"
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as lp from 'it-length-prefixed'
import { v4 as uuidv4 } from 'uuid'
import type { Libp2p } from "libp2p"

import { createLibp2p } from 'libp2p'
// console.log("createLibp2p: ", createLibp2p)
import { WebSockets } from '@libp2p/websockets'
// console.log("WebSockets: ", WebSockets)
import { WebRTCStar } from '@libp2p/webrtc-star'
// console.log("WebRTCStar: ", WebRTCStar)
import { Noise } from '@chainsafe/libp2p-noise'
// console.log("Noise: ", Noise)
import { Mplex } from '@libp2p/mplex'
// console.log("Mplex: ", Mplex)
import { Bootstrap } from '@libp2p/bootstrap'
// console.log("Bootstrap: ", Bootstrap)

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
    console.log("DIDCommLibp2pTransport constructor. 1")
    this.id = id || uuidv4()
    
    console.log("DIDCommLibp2pTransport constructor. 2")
    // const webRtcStar = new WebRTCStar()
    this.libp2pNode = libp2pNode
    
    console.log("DIDCommLibp2pTransport constructor. 3")
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
    // return {}
  }
}