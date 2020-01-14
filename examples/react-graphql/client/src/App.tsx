import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import * as queries from './queries'

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
  Table,
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

  const [createIdentity] = useMutation(queries.createIdentityMutation, {
    refetchQueries: [{ query: queries.managedIdentitiesQuery }],
  })
  const { data: managedIdentitiesData } = useQuery(queries.managedIdentitiesQuery)
  const { data: serviceMessagesData } = useQuery(queries.serviceMessagesSince, { variables: { ts: [] } })
  const [signVc] = useMutation(queries.actionSignVcMutation)
  const [sendJwt] = useMutation(queries.actionSendJwtMutation)

  const send = async () => {
    setIsSending(true)

    try {
      const credentialSubject: any = {}
      credentialSubject[claimType] = claimValue

      const { data } = await signVc({
        variables: {
          did: activeDid,
          data: {
            sub: receiver,
            vc: {
              context: ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential'],
              credentialSubject,
            },
          },
        },
      })

      console.log(data)

      const { data: dataSend } = await sendJwt({
        variables: {
          from: activeDid,
          to: receiver,
          jwt: data.actionSignVc,
        },
      })

      console.log(dataSend)

      window.toastProvider.addMessage('Credential sent!', { variant: 'success' })
    } catch (e) {
      window.toastProvider.addMessage(e.message, { variant: 'failure' })
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

            {managedIdentitiesData?.managedIdentityTypes?.map((type: string) => (
              <Button.Outline
                mt={3}
                mb={3}
                mr={3}
                key={type}
                onClick={() => createIdentity({ variables: { type } })}
              >
                Create {type} DID
              </Button.Outline>
            ))}

            <Form onSubmit={handleSubmit}>
              <Field label="Sender" required>
                <div>
                  {managedIdentitiesData?.managedIdentities?.map(
                    (identity: { did: string; type: string }) => (
                      <Radio
                        key={identity.did}
                        name="selecedDid"
                        required
                        onChange={(e: any) => setActiveDid(identity.did)}
                        label={`${identity.did} (${identity.type})`}
                        value={identity.did}
                        checked={activeDid === identity.did}
                      />
                    ),
                  )}
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
      <Box p={3}>
        <Card width={'auto'} mx={'auto'}>
          <Heading>Messages</Heading>
          <Table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Time</th>
                <th>Type</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {serviceMessagesData?.serviceMessagesSince.map((msg: any) => (
                <tr key={msg.id}>
                  <td>{msg.sender}</td>
                  <td>{msg.receiver}</td>
                  <td>{msg.timestamp}</td>
                  <td>{msg.type}</td>
                  <td>{msg.data}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Box>
    </BaseStyles>
  )
}

export default App
