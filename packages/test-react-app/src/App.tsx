import * as React from 'react'
import './App.css'
import { getAgent } from './veramo/setup'
import { DIDResolutionResult } from 'did-resolver'
import { VerifiableCredential } from '@veramo/core-types'

function App() {
  const [didDoc, setDidDoc] = React.useState<DIDResolutionResult|undefined>(undefined)
  const [invalidDidDoc, setInvalidDidDoc] = React.useState<DIDResolutionResult|undefined>(undefined)
  const [credential, setCredential] = React.useState<VerifiableCredential|undefined>(undefined)

  const agent = getAgent()

  const resolve = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
    })
    setDidDoc(doc)
  }

  const resolveInvalid = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:ganache:0x16acf3bb1ef0ee8459de2bc2bd9d91532062a7',
    })
    setInvalidDidDoc(doc)
  }
  const issueCredential = async () => {
    const identifier = await agent.didManagerGetOrCreate({
      alias: 'default',
      provider: 'did:ethr:ganache',
    })
    const credential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: identifier.did },
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        credentialSubject: {
          id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          degree: {
            type: 'BachelorDegree',
            name: 'Bachelor of Science and Arts',
          },
        },
      },
      proofFormat: 'jwt',
    })
    const hash = await agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: credential,
    })
    console.log('Credential hash', hash)
    setCredential(credential)
  }
  React.useEffect(() => {
    resolve()
    resolveInvalid()
    issueCredential()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {didDoc && <pre id="result">{JSON.stringify(didDoc, null, 2)}</pre>}
        {credential && <pre >{JSON.stringify(credential, null, 2)}</pre>}
        {invalidDidDoc && <pre id="invalid-result">{JSON.stringify(invalidDidDoc, null, 2)}</pre>}
      </header>
    </div>
  )
}

export default App
