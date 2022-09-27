import { createLibp2p } from 'libp2p'
console.log("createLibp2p: ", createLibp2p)
import { WebSockets } from '@libp2p/websockets'
console.log("WebSockets: ", WebSockets)
import { WebRTCStar } from '@libp2p/webrtc-star'
console.log("WebRTCStar: ", WebRTCStar)
import { Noise } from '@chainsafe/libp2p-noise'
console.log("Noise: ", Noise)
import { Mplex } from '@libp2p/mplex'
console.log("Mplex: ", Mplex)
import { Bootstrap } from '@libp2p/bootstrap'
console.log("Bootstrap: ", Bootstrap)

export const createLibp2pNode = async () => {
    const webRtcStar = new WebRTCStar()
    const libp2p = await createLibp2p({
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers
        listen: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
        ]
      },
      transports: [
        new WebSockets(),
        webRtcStar
      ],
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
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
          ]
        })
      ]
    })
    return libp2p
}