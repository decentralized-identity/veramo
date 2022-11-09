import * as React from 'react'
import './App.css'
import { getAgent } from './veramo/setup'
import { DIDResolutionResult } from 'did-resolver'
import { createVerifiableCredentialJwt } from 'did-jwt-vc'

function App() {
  console.log("react - createVerifiableCredentialJwt: ", createVerifiableCredentialJwt)
  const [didDoc, setDidDoc] = React.useState<DIDResolutionResult>(null)
  const [invalidDidDoc, setInvalidDidDoc] = React.useState<DIDResolutionResult>(null)
  const [res, setRes] = React.useState(false)

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

  const createDidIssueJwtCheckJwt = async () => {
    const did = await agent.didManagerGetOrCreate({ alias: "test", provider: "did:key" })
    console.log("did: ", did)
    const cred = await agent.createVerifiableCredential({ credential: {
      issuer: did.did,
      credentialSubject: { test: "yes" }
    }, proofFormat: 'jwt'})
    console.log("cred: ", cred)
    const res = await agent.verifyCredential({ credential: cred })
    console.log("res: ", res)
    setRes(res.verified)
  }

  React.useEffect(() => {
    resolve()
    resolveInvalid()
    createDidIssueJwtCheckJwt()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {didDoc && <pre id="result">{JSON.stringify(didDoc, null, 2)}</pre>}
        {invalidDidDoc && <pre id="invalid-result">{JSON.stringify(invalidDidDoc, null, 2)}</pre>}
        {res && <pre id="res">{"yes"}</pre>}
      </header>
    </div>
  )
}

export default App
