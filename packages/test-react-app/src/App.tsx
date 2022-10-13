import * as React from 'react'
import './App.css'
import { getAgent, setup } from './veramo/setup'
import { DIDResolutionResult } from 'did-resolver'
import { IIdentifier } from '@veramo/core'

function App() {
  const [didDoc, setDidDoc] = React.useState<DIDResolutionResult>(null)
  const [invalidDidDoc, setInvalidDidDoc] = React.useState<DIDResolutionResult>(null)

  let agent = getAgent()
  let sender: IIdentifier
  let receiver: IIdentifier
  let listenerMultiAddr: string

  const setup2 = async () => {
    await setup()
    console.log("agent: ", agent)
    agent = getAgent()
    console.log("agent again: ", agent)
    await resolve()
    await resolveInvalid()
    // await new Promise(r => setTimeout(r, 10000))
    // await sendDidcommMessage()
  }

  const resolve = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:goerli:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
    })
    setDidDoc(doc)
  }

  const resolveInvalid = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:goerli:0x6acf3bb1ef0ee8459de2bc2bd9d91532062a730',
    })
    setInvalidDidDoc(doc)
  }

  // const sendDidcommMessage = async () => {    
  //   console.log("go send")
  //   sender = await agent.didManagerImport({
  //     did: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
  //     keys: [
  //       {
  //         type: 'Ed25519',
  //         kid: 'didcomm-senderKey-1',
  //         publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
  //         privateKeyHex:
  //           'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
  //         kms: 'local',
  //       },
  //     ],
  //     provider: 'did:fake',
  //     alias: 'sender',
  //   })

  //   const addrs = await agent.getListenerMultiAddrs()
  //   console.log("addrs: ", addrs)
  //   listenerMultiAddr = addrs[0].toString()
  //   console.log("listenerMultiAddr: ", listenerMultiAddr)
  //   receiver = await agent.didManagerImport({
  //     did: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
  //     keys: [
  //       {
  //         type: 'Ed25519',
  //         kid: 'didcomm-receiverKey-1',
  //         publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
  //         privateKeyHex:
  //           '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
  //         kms: 'local',
  //       },
  //     ],
  //     services: [
  //       {
  //         id: 'msg2',
  //         type: 'DIDCommMessaging',
  //         serviceEndpoint: {
  //           transportType: 'libp2p',
  //           multiAddr: listenerMultiAddr
  //         },
  //       },
  //     ],
  //     provider: 'did:fake',
  //     alias: 'receiver',
  //   })
  //   const message = {
  //     type: 'test',
  //     to: receiver.did,
  //     from: sender.did,
  //     id: 'test',
  //     body: { hello: 'world' },
  //   }
  //   const packedMessage = await agent.packDIDCommMessage({
  //     packing: 'authcrypt',
  //     message,
  //   })
  //   const result = await agent.sendDIDCommMessage({
  //     messageId: '123',
  //     packedMessage,
  //     recipientDidUrl: receiver.did,
  //   })
  //   await new Promise(r => setTimeout(r, 2000));
  //   console.log("result: ", result)
  // }

  React.useEffect(() => {
    setup2()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {didDoc && <pre id="result">{JSON.stringify(didDoc, null, 2)}</pre>}
        {invalidDidDoc && <pre id="invalid-result">{JSON.stringify(invalidDidDoc, null, 2)}</pre>}
      </header>
    </div>
  )
}

export default App
