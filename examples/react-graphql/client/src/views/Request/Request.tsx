import React, { useState, useContext } from 'react'
import { Box, Button, Field, Text, Form, Flex, Input, Loader, Checkbox } from 'rimble-ui'
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
  const [claims, updateClaims] = useState<any>([])
  const [claimType, updateClaimType] = useState()
  const [claimReason, updateClaimReason] = useState()
  const [claimTypeRequired, updateClaimTypeRequired] = useState(false)
  const [jwt, setJwt] = useState()
  const [actionSendJwt] = useMutation(queries.actionSendJwt, {
    onCompleted: response => {
      if (response?.actionSendJwt?.id) {
        setIsSending(false)
        window.toastProvider.addMessage('Request sent!', { variant: 'success' })
      }
    },
  })

  const [actionSignSDR] = useMutation(queries.signSdrJwt, {
    onCompleted: response => {
      if (response && response.actionSignSDR) {
        setJwt(response.actionSignSDR)
        setIsSending(true)

        if (receiver) {
          setIsSending(true)

          actionSendJwt({
            variables: {
              from: appState.defaultDid,
              to: receiver,
              jwt: response.signSdrJwt,
            },
          })
        }
      }
    },
  })

  const addClaimField = (type: string, reason: string, essential: boolean) => {
    const field = {
      claimType: type,
      reason,
      essential,
    }
    const updatedClaims = claims.concat([field])
    updateClaims(updatedClaims)
    updateClaimType('')
    updateClaimReason('')
    updateClaimTypeRequired(false)
  }

  const removeClaimField = (index: number) => {
    const updatedClaims = claims.filter((item: any, i: number) => i !== index)
    updateClaims(updatedClaims)
  }

  const sendRequest = () => {
    actionSignSDR({
      variables: {
        data: {
          issuer: appState.defaultDid,
          tag: 'tag-' + Date.now().toString(),
          subject: receiver || null,
          claims: claims,
        },
      },
    })
  }

  return (
    <Page title={'Request'} padding={3}>
      <Panel heading={'Selective disclosure request'}>
        <Box p={3}>
          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={1} px={3}>
              <Field label="Sender" width={1}>
                <Input
                  border={0}
                  type="text"
                  disabled
                  required
                  backgroundColor={'#313131'}
                  value={appState.defaultDid}
                  spellCheck={false}
                  width={1}
                />
              </Field>
            </Box>
          </Flex>

          <Flex mx={-3} flexWrap={'wrap'}>
            <Box width={1} px={3}>
              <Field label="Receiver" width={1}>
                <Input
                  spellCheck={false}
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
                  onChange={(e: any) => updateClaimType(e.target.value)}
                  width={1}
                  placeholder={'name'}
                />
              </Field>
            </Box>
            <Box width={[1, 1, 1 / 2]} px={3}>
              <Field label="Claim reason" width={1}>
                <Form.Input
                  type="text"
                  border={0}
                  backgroundColor={'#313131'}
                  value={claimReason}
                  onChange={(e: any) => updateClaimReason(e.target.value)}
                  width={1}
                  placeholder={'We need this'}
                />
              </Field>
            </Box>
          </Flex>

          <Flex mx={-3} flexWrap={'wrap'}>
            <Box px={3}>
              <Button
                variant={'success'}
                disabled={!claimType}
                small
                onClick={() => addClaimField(claimType, claimReason, claimTypeRequired)}
              >
                Add
              </Button>
            </Box>
            <Box px={3}>
              <Checkbox
                label="Required"
                my={2}
                checked={claimTypeRequired}
                onChange={() => updateClaimTypeRequired(!claimTypeRequired)}
              />
            </Box>
          </Flex>

          <Box py={3}>
            {claims.map((c: any, i: number) => {
              return (
                <Box key={i} borderRadius={5} p={3} bg={'#1C1C1C'} mb={3}>
                  <Text fontSize={1} fontFamily={'Monaco, Lucida Console'} color={'#8a8a8a'}>
                    {c.claimType}
                  </Text>
                  <Text fontSize={1} fontFamily={'Monaco, Lucida Console'} color={'#8a8a8a'}>
                    {c.reason}
                  </Text>
                  <Text fontSize={1} fontFamily={'Monaco, Lucida Console'} color={'#8a8a8a'}>
                    {c.essential ? 'Required' : 'Not Required'}
                  </Text>
                </Box>
              )
            })}
          </Box>

          <Flex flexWrap={'wrap'}>
            {isSending ? (
              <Loader size="40px" />
            ) : (
              <Button onClick={() => sendRequest()} disabled={claims.length === 0}>
                Sign and send
              </Button>
            )}
          </Flex>
        </Box>
      </Panel>
    </Page>
  )
}

export default Component
