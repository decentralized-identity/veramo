import React, { useEffect, useState } from 'react'
import './App.css'
import { agent } from './veramo/setup'

function App() {
  const [didDoc, setDidDoc] = useState<any>(null)
  const [invalidDidDoc, setInvalidDidDoc] = useState<any>(null)

  const resolve = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
    })
    setDidDoc(doc)
  }

  const resolveInvalid = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:rinkeby:0x6acf3bb1ef0ee8459de2bc2bd9d91532062a730',
    })
    setInvalidDidDoc(doc)
  }

  useEffect(() => {
    resolve()
    resolveInvalid()
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
