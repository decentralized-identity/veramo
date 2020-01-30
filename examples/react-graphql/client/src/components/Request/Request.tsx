import React, { useState, useContext, useEffect } from 'react'
import { Box, Heading, Text, Radio, Button, Loader } from 'rimble-ui'
import Avatar from '../../components/Avatar/Avatar'
import * as Types from '../../types'
import Credential from '../Credential/Credential'
import { AppContext } from '../../context/AppProvider'
import { useMutation } from 'react-apollo'
import * as mutations from '../../gql/mutations'
import * as queries from '../../gql/queries'

const S = require('sugar/string')

interface Props {
  sender: Types.Identity
  receiver: Types.Identity
  threadId: string
  sdr: any
  close: () => void
}

interface ValidationState {
  [index: string]: {
    required: boolean
    jwt: string | null
  }
}

const Component: React.FC<Props> = ({ sdr, sender, receiver, threadId, close }) => {
  const [sending, updateSending] = useState<boolean>(false)
  const [selected, updateSelected] = useState<ValidationState>({})
  const [formValid, setValid] = useState(true)
  const [appState] = useContext(AppContext)

  const checkValidity = () => {
    let valid = true

    if (Object.keys(selected).length === 0) {
      valid = false
    }
    Object.keys(selected).map(key => {
      if (selected[key].required && !selected[key].jwt) {
        valid = false
      }
    })

    setValid(valid)
  }

  const [actionSendJwt] = useMutation(mutations.actionSendJwt, {
    refetchQueries: [
      {
        query: queries.allMessages,
        variables: { activeDid: appState.defaultDid },
      },
    ],
    onCompleted: response => {
      if (response.actionSendJwt) {
        updateSending(false)
        window.toastProvider.addMessage('Response sent!', { variant: 'success' })
        close()
      }
    },
    onError: () => {
      window.toastProvider.addMessage('There was a problem sending your response', { variant: 'error' })
    },
  })
  const [actionSignVp] = useMutation(mutations.actionSignVp, {
    onCompleted: response => {
      if (response.actionSignVp) {
        updateSending(true)

        actionSendJwt({
          variables: {
            to: sender.did,
            from: appState.defaultDid,
            jwt: response.actionSignVp,
          },
        })
      }
    },
  })

  const accept = () => {
    if (formValid) {
      const selectedVp = Object.keys(selected)
        .map(key => selected[key].jwt)
        .filter(item => item)

      const payload = {
        variables: {
          did: appState.defaultDid,
          data: {
            aud: sender.did,
            tag: threadId,
            vp: {
              context: ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential'],
              verifiableCredential: selectedVp,
            },
          },
        },
      }

      actionSignVp(payload)
    }
  }

  const onSelectItem = (id: string | null, jwt: string | null, claimType: string) => {
    const updatedSelection = {
      ...selected,
      [claimType]: { ...selected[claimType], jwt },
    }

    updateSelected(updatedSelection)
  }

  useEffect(() => {
    checkValidity()
  }, [selected])

  useEffect(() => {
    let defaultSelected: ValidationState = {}
    sdr.map((sdr: any) => {
      if (sdr && sdr.essential) {
        if (sdr.vc.length) {
          defaultSelected[sdr.claimType] = {
            required: true,
            jwt: sdr.vc[0].jwt,
          }
        } else {
          defaultSelected[sdr.claimType] = {
            required: true,
            jwt: null,
          }
          setValid(false)
        }
      }
    })
    updateSelected(defaultSelected)
  }, [])

  const isSelected = (jwt: string, claimtype: string): Boolean => {
    return selected[claimtype] && selected[claimtype].jwt === jwt
  }
  console.log({ sender })
  return (
    <Box borderRadius={5} overflow={'hidden'} border={1} borderColor={'#333333'} bg={'#222222'}>
      <Box
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        display={'flex'}
        flex={1}
        py={4}
      >
        <Avatar size={60} did={sender.did} source={sender.profileImage} type={'circle'} />
        <Heading as={'h3'} mt={2}>
          {sender.shortId}
        </Heading>
      </Box>
      <Box bg={'#1b1b1b'} p={3}>
        <Text>Share your data with {sender.shortId}</Text>
      </Box>
      {sdr.map((requestItem: any) => {
        return (
          <Box p={3} borderBottom={1} borderColor={'#333333'} key={requestItem.claimType}>
            <Box>
              <b>
                {S.String.titleize(requestItem.claimType)} {requestItem.essential && '*'}
              </b>
            </Box>
            <Box>
              <Text>{requestItem.reason}</Text>
            </Box>
            <Box pt={3}>
              {requestItem.vc.map((credential: any) => {
                return (
                  <Credential
                    selected={isSelected(credential.jwt, requestItem.claimType)}
                    key={credential.hash}
                    {...credential}
                    onClick={() => onSelectItem(credential.hash, credential.jwt, requestItem.claimType)}
                  />
                )
              })}
              {requestItem.vc.length === 0 && (
                <Text>
                  Cannot find a credential for <b>{S.String.titleize(requestItem.claimType)}</b>
                </Text>
              )}
            </Box>
          </Box>
        )
      })}
      <Box p={3}>
        <Text color={'#ea3939'}>{formValid ? '' : 'There are some missing fields'}</Text>
      </Box>
      <Box p={3} justifyContent={'space-between'} display={'flex'} flexDirection={'row'}>
        {sending ? (
          <Loader size="40px" />
        ) : (
          <>
            <Button onClick={() => accept()} disabled={sending || !formValid}>
              Share
            </Button>

            <Button.Outline onClick={close}>Later</Button.Outline>
          </>
        )}
      </Box>
    </Box>
  )
}

export default Component
