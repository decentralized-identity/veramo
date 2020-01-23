import React, { useState, useContext } from 'react'
import { Box, Button, Field, Text, Form, Flex, Input, Loader, ToastMessage } from 'rimble-ui'
import Page from '../../layout/Page'
import Panel from '../../components/Panel/Panel'
import { AppContext } from '../../context/AppProvider'
import { useQuery, useMutation } from '@apollo/react-hooks'
import * as queries from '../../queries'

declare global {
  interface Window {
    toastProvider: any
  }
}

const Component = () => {
  const [appState] = useContext(AppContext)
  const [isSending, setIsSending] = useState(false)
  const [receiver, setReceiver] = useState('did:web:uport.me')
  const [claimType, setClaimType] = useState('name')
  const [claimValue, setClaimValue] = useState('Alice')
  const [signVc] = useMutation(queries.actionSignVc)
  const [sendJwt] = useMutation(queries.actionSendJwt, {
    refetchQueries: [
      {
        query: queries.allMessages,
        variables: { activeDid: appState.defaultDid },
      },
    ],
  })

  const send = async () => {
    setIsSending(true)

    try {
      const credentialSubject: any = {}
      credentialSubject[claimType] = claimValue

      const { data } = await signVc({
        variables: {
          did: appState.defaultDid,
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
          from: appState.defaultDid,
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
    <Page title={'Issue Credential'}>
      <Panel heading={'Credential form'}>
        <Box p={3}>
          <Form onSubmit={handleSubmit}>
            <Field label="Sender" required>
              <Text>{appState.defaultDid}</Text>
            </Field>

            <Flex mx={-3} flexWrap={'wrap'}>
              <Box width={1} px={3}>
                <Field label="Receiver" width={1}>
                  <Input
                    border={0}
                    type="text"
                    required
                    backgroundColor={'#313131'}
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
                    border={0}
                    backgroundColor={'#313131'}
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
                    border={0}
                    backgroundColor={'#313131'}
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
        </Box>
      </Panel>
    </Page>
  )
}

export default Component
