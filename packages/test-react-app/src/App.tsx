import * as React from 'react'
import './App.css'
import { getAgent } from './veramo/setup'
import { DIDResolutionResult } from 'did-resolver'

function App() {
  const [didDoc, setDidDoc] = React.useState<DIDResolutionResult>(null)
  const [invalidDidDoc, setInvalidDidDoc] = React.useState<DIDResolutionResult>(null)

  const agent = getAgent()

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

  React.useEffect(() => {
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
