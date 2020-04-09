import React, { useState, useEffect } from 'react'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import { agent } from './setup'
const {
  BaseStyles,
  Box,
  Flex,
  Card,
  Heading,
  Button,
  Radio,
  Field,
  Form,
  Input,
  Loader,
  ToastMessage,
} = require('rimble-ui')

declare global {
  interface Window {
    toastProvider: any
  }
}

const App: React.FC = () => {
  const [isSending, setIsSending] = useState(false)
  const [activeDid, setActiveDid] = useState('')
  const [receiver, setReceiver] = useState('did:web:uport.me')
  const [claimType, setClaimType] = useState('name')
  const [claimValue, setClaimValue] = useState('Alice')
  const [identityProviders, setIdentityProviders] = useState([{ type: '', description: '' }])
  const [identities, setIdentities] = useState([{ identityProviderType: '', did: '' }])

  useEffect(() => {
    agent.identityManager.getIdentityProviders().then((providers: any) => {
      setIdentityProviders(providers)
    })
  }, [])

  const updateIdentityList = () => {
    agent.identityManager.getIdentities().then((identities: any) => {
      setIdentities(identities)
      if (identities.length > 0) setActiveDid(identities[0].did)
    })
  }

  useEffect(() => {
    updateIdentityList()
  }, [])

  const send = async () => {
    // Sign credential
    setIsSending(true)

    try {
      const credentialSubject: any = {}
      credentialSubject['id'] = receiver
      credentialSubject[claimType] = claimValue

      const credential = await agent.handleAction({
        type: W3c.ActionTypes.signCredentialJwt,
        data: {
          issuer: activeDid,
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject,
        },
      } as W3c.ActionSignW3cVc)

      console.log(credential)

      // Send credential using TrustGraph
      await agent.handleAction({
        type: TG.ActionTypes.sendJwt,
        data: {
          from: activeDid,
          to: receiver,
          jwt: credential,
        },
      } as TG.ActionSendJWT)

      window.toastProvider.addMessage('Credential sent!', { variant: 'success' })
    } catch (e) {
      window.toastProvider.addMessage('Ooops', { variant: 'failure' })
    }

    setIsSending(false)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    send()
  }

  return (
    <BaseStyles>
      <ToastMessage.Provider ref={(node: any) => (window.toastProvider = node)} />
      <Flex>
        <Box p={3}>
          <Card width={'auto'} mx={'auto'}>
            <Heading>Send Verifiable Credential</Heading>

            {identityProviders.map(identityProvider => (
              <Button.Outline
                mt={3}
                mb={3}
                mr={3}
                key={identityProvider.type}
                onClick={async () => {
                  await agent.identityManager.createIdentity(identityProvider.type)
                  updateIdentityList()
                }}
              >
                Create {identityProvider.type} DID
              </Button.Outline>
            ))}

            <Form onSubmit={handleSubmit}>
              <Field label="Sender" required>
                <div>
                  {identities.map(identity => (
                    <Radio
                      key={identity.did}
                      name="selecedDid"
                      required
                      onChange={(e: any) => setActiveDid(identity.did)}
                      label={`${identity.did} (${identity.identityProviderType})`}
                      value={identity.did}
                      checked={activeDid === identity.did}
                    />
                  ))}
                </div>
              </Field>

              <Flex mx={-3} flexWrap={'wrap'}>
                <Box width={1} px={3}>
                  <Field label="Receiver" width={1}>
                    <Input
                      type="text"
                      required
                      value={receiver}
                      onChange={(e: any) => setReceiver(e.target.value)}
                      width={1}
                    />
                  </Field>
                </Box>
              </Flex>

              <Flex mx={-3} flexWrap={'wrap'}>
                <Box width={[1, 1, 1 / 2]} px={3}>
                  <Field label="Claim type" width={1}>
                    <Input
                      type="text"
                      required
                      value={claimType}
                      onChange={(e: any) => setClaimType(e.target.value)}
                      width={1}
                    />
                  </Field>
                </Box>
                <Box width={[1, 1, 1 / 2]} px={3}>
                  <Field label="Claim value" width={1}>
                    <Form.Input
                      type="text"
                      required
                      value={claimValue}
                      onChange={(e: any) => setClaimValue(e.target.value)}
                      width={1}
                    />
                  </Field>
                </Box>
              </Flex>

              <Flex flexWrap={'wrap'}>
                {isSending ? <Loader size="40px" /> : <Button type="submit">Sign and send</Button>}
              </Flex>
            </Form>
          </Card>
        </Box>
      </Flex>
    </BaseStyles>
  )
}

export default App
