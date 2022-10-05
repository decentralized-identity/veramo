import { createLibp2pNode } from '../libp2pNode.js'
import { Noise } from "@chainsafe/libp2p-noise"
import { TCP } from "@libp2p/tcp"
import { WebSockets } from '@libp2p/websockets'
import { Mplex } from '@libp2p/mplex'
import { jest } from '@jest/globals'

jest.setTimeout(1000)


describe('libp2p-client', () => {
  it('should create noise', async () => {
    const noise = new Noise()
    expect(noise).toBeDefined()
  })
  it('should create TCP', async () => {
    const tcp = new TCP()
    expect(tcp).toBeDefined()
  })
  it('should create WebSockets', async () => {
    const websockets = new WebSockets()
    expect(websockets).toBeDefined()
  })
  it('should create Mplex', async () => {
    const mplex = new Mplex()
    expect(mplex).toBeDefined()
  })
  it('should create libp2p node', async () => {
    const node = await createLibp2pNode()
    expect(node).toBeDefined()
  })
})
