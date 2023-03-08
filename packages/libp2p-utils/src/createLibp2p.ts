import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp'
import { PeerId } from '@libp2p/interface-peer-id'

export const createLibp2pNode = async (peerId?: any) => {
  const libp2p = await createLibp2p({
    peerId,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/10333']
    },
    transports: [
      tcp(),
      webSockets()
    ],
    streamMuxers: [
      mplex()
    ],
    connectionEncryption: [
      noise()
    ]
  })
  await libp2p.start()
  return libp2p
}