// import { createLibp2pNode } from '../../../libp2p-utils/src'
// import { noise } from "@chainsafe/libp2p-noise"
// import { TCP } from "@libp2p/tcp"
// import { webSockets } from '@libp2p/websockets'
import { mplex } from '@libp2p/mplex'
// console.log("mplex: ", Mplex)
import { jest } from '@jest/globals'

jest.setTimeout(6000)


describe('libp2p-client', () => {
  it('should say wassup', async () => {
    expect(true).toBeTruthy()
  })
  // it('should create noise', async () => {
  //   const n = noise()
  //   expect(n).toBeDefined()
  // })
  // it('should create TCP', async () => {
  //   const tcp = new TCP()
  //   expect(tcp).toBeDefined()
  // })
  // it('should create WebSockets', async () => {
  //   const websockets = webSockets()
  //   expect(websockets).toBeDefined()
  // })
  it('should create Mplex', async () => {
    const m = mplex()
    expect(m).toBeDefined()
  })
  // it('should create libp2p node', async () => {
  //   const node = await createLibp2pNode()
  //   expect(node).toBeDefined()
  // })
})
