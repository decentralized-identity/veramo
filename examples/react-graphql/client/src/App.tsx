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
  Modal,
  Text,
  QR,
  Icon,
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

  const [createIdentity] = useMutation(queries.createIdentity, {
    refetchQueries: [{ query: queries.managedIdentities }],
  })

  const { data: managedIdentitiesData } = useQuery(queries.managedIdentities)

  const { loading: messagesLoading, data: messagesData } = useQuery(queries.allMessages, {
    variables: { activeDid },
  })

  const [signVc] = useMutation(queries.actionSignVc)
  const [sendJwt] = useMutation(queries.actionSendJwt, {
    refetchQueries: [
      {
        query: queries.allMessages,
        variables: { activeDid },
      },
    ],
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)
  const [qrValue, setQrValue] = useState('')

  const closeModal = (e: any) => {
    e?.preventDefault()
    setIsOpen(false)
  }

  const openModal = (e: any) => {
    e?.preventDefault()
    setIsOpen(true)
  }

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
      setIsOpen(false)
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
      <Modal isOpen={isQROpen}>
        <QR value={qrValue} size={500} />
        <Button.Outline onClick={() => setIsQROpen(false)}>Close</Button.Outline>
      </Modal>
      <Flex>
        <Box p={3}>
          <Card width={'auto'} mx={'auto'}>
            <Heading>Managed Identities</Heading>

            <Form onSubmit={handleSubmit}>
              <Field label="Active DID" required>
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
            </Form>

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
          </Card>
        </Box>
      </Flex>

      <Button onClick={openModal} disabled={activeDid === ''} ml={3}>
        Send Verifiable Credential
      </Button>
      <Modal isOpen={isOpen}>
        <Flex>
          <Box p={3}>
            <Card width={'auto'} mx={'auto'}>
              <Heading>Send Verifiable Credential</Heading>

              <Form onSubmit={handleSubmit}>
                <Field label="Sender" required>
                  <Text>{activeDid}</Text>
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
                  <Button.Outline onClick={closeModal} ml={3}>
                    Cancel
                  </Button.Outline>
                </Flex>
              </Form>
            </Card>
          </Box>
        </Flex>
      </Modal>

      <Box p={3}>
        <Card width={'auto'} mx={'auto'}>
          <Heading>Messages</Heading>
          {messagesLoading ? <Loader size="20px" /> : <div style={{ height: '20px' }} />}
          <Table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Time</th>
                <th>Type</th>
                <th>Claims</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {messagesData?.identity?.messagesAll?.map((msg: any) => (
                <tr key={msg.id}>
                  <td>{msg.sender.shortId}</td>
                  <td>{msg.receiver.shortId}</td>
                  <td>{msg.timestamp}</td>
                  <td>{msg.type}</td>
                  <td>
                    {msg.vc?.map((vc: any) =>
                      vc.fields.map((field: any) => (
                        <div key={field.type}>
                          {field.type} = {field.value}
                        </div>
                      )),
                    )}
                  </td>
                  <td>
                    <Icon
                      name="Search"
                      size="30"
                      onClick={() => {
                        setQrValue(msg.raw)
                        setIsQROpen(true)
                      }}
                    />
                  </td>
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
