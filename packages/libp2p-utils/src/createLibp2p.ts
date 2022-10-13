import { createLibp2p } from 'libp2p'
import { WebSockets } from '@libp2p/websockets'
import { Noise } from '@chainsafe/libp2p-noise'
import { Mplex } from '@libp2p/mplex'
import { TCP } from '@libp2p/tcp'
import { PeerId } from '@libp2p/interface-peer-id'

export const createLibp2pNode = async (peerId?: PeerId) => {
  const libp2p = await createLibp2p({
    peerId,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/10333']
    },
    transports: [
      new TCP(),
      new WebSockets()
    ],
    streamMuxers: [
      new Mplex()
    ],
    connectionEncryption: [
      new Noise()
    ]
  })
  // await libp2p.start()
  return libp2p
}