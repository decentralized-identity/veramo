import React, { useState, useContext } from 'react'
import { Box, Button, Field, Text, Form, Flex, Input, Loader, ToastMessage, QR } from 'rimble-ui'
import Page from '../../layout/Page'
import Panel from '../../components/Panel/Panel'
import { AppContext } from '../../context/AppProvider'
import { useQuery, useMutation } from '@apollo/react-hooks'
import * as queries from '../../gql/queries'
import * as mutations from '../../gql/mutations'

declare global {
  interface Window {
    toastProvider: any
  }
}

const Component = () => {
  const { appState } = useContext(AppContext)
  const [isSending, setIsSending] = useState(false)
  const [receiver, setReceiver] = useState('did:web:uport.me')
  const [claimType, setClaimType] = useState('name')
  const [claimValue, setClaimValue] = useState('Alice')
  const [signedVC, setSignedVC] = useState<any>(null)
  const [signVc] = useMutation(mutations.signCredentialJwt)
  const [sendMessageDidCommAlpha1] = useMutation(mutations.sendMessageDidCommAlpha1, {
    refetchQueries: [
      {
        query: queries.allMessages,
        variables: { activeDid: appState.defaultDid },
      },
    ],
  })

  const signVC = async (e: any) => {
    e.preventDefault()

    try {
      const credentialSubject: any = {}
      credentialSubject['id'] = receiver
      credentialSubject[claimType] = claimValue

      const { data } = await signVc({
        variables: {
          data: {
            issuer: appState.defaultDid,
            context: ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            credentialSubject,
          },
          save: true,
        },
      })
      setSignedVC(data.signCredentialJwt.raw)
    } catch (e) {}
  }

  const send = async (e: any) => {
    e.preventDefault()

    if (!signedVC) {
      return
    }

    setIsSending(true)

    try {
      console.log(signedVC)
      const { data: dataSend } = await sendMessageDidCommAlpha1({
        variables: {
          data: {
            from: appState.defaultDid,
            to: receiver,
            type: 'jwt',
            body: signedVC,
          },
        },
      })

      console.log(dataSend)

      window.toastProvider.addMessage('Credential sent!', { variant: 'success' })
    } catch (e) {
      window.toastProvider.addMessage(e.message, { variant: 'failure' })
    }

    setIsSending(false)
  }

  return (
    <Page title={'Issue Credential'} padding={3}>
      <Panel heading={'Credential form'}>
        <Box p={3}>
          <Form>
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

            {signedVC && (
              <Box p={3} border={10} borderColor={'#FFFFFF'}>
                <QR size={300} value={signedVC} />
              </Box>
            )}

            <Flex flexWrap={'wrap'}>
              {isSending ? (
                <Loader size="40px" />
              ) : (
                <Box>
                  <Button type="submit" mr={4} onClick={signVC}>
                    Sign
                  </Button>
                  <Button type="submit" disabled={!signedVC} onClick={send}>
                    Send
                  </Button>
                </Box>
              )}
            </Flex>
          </Form>
        </Box>
      </Panel>
    </Page>
  )
}

export default Component
