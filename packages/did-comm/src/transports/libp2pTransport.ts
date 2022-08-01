import { AbstractDIDCommTransport, IDIDCommTransportResult } from "./transports"
import { createLibp2p } from 'libp2p'
import { WebSockets } from '@libp2p/websockets'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { Noise } from '@chainsafe/libp2p-noise'
import { Mplex } from '@libp2p/mplex'
import { Bootstrap } from '@libp2p/bootstrap'
import filters from 'libp2p-websockets/src/filters'
import { pipe } from "it-pipe"
import map from "it-map"
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as lp from 'it-length-prefixed'

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
  constructor() {
    super()
    
    const webRtcStar = new WebRTCStar()
    this.libp2pNode = createLibp2p({
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers
        listen: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        ],
      },
      transports: [new WebSockets(), webRtcStar],
      connectionEncryption: [new Noise()],
      streamMuxers: [new Mplex()],
      peerDiscovery: [
        webRtcStar.discovery,
        new Bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
          ],
        }),
      ],
      // TODO(nickreynolds): fix config transport filters
      // config: {
      //   transport: {
      //     [transportKey]: {
      //       // by default websockets do not allow localhost dials
      //       // let's enable it for testing purposes in this example
      //       filter: filters.all
      //     }
      // },
      // }
    })
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
  }
}
