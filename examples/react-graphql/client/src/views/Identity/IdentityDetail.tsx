import React, { useContext } from 'react'
import { Box, Heading, Button, Text } from 'rimble-ui'
import { useParams, useHistory } from 'react-router-dom'
import { AppContext } from '../../context/AppProvider'
import { useMutation } from '@apollo/react-hooks'
import * as queries from '../../queries'

interface IdentityDetail {}

const Component: React.FC<IdentityDetail> = () => {
  let { id } = useParams()
  let history = useHistory()
  const [appState, setDefaultDid] = useContext(AppContext)
  const { defaultDid } = appState
  const [deleteIdentity] = useMutation(queries.deleteIdentity, {
    refetchQueries: [{ query: queries.managedIdentities }],
  })

  const deleteId = (did: string | undefined) => {
    deleteIdentity({
      variables: {
        type: 'ethr-did-fs',
        did: did,
      },
    }).then(() => {
      window.toastProvider.addMessage('Identity deleted', { variant: 'success' })
    })
    history.push('/identities')
  }

  return (
    <>
      <Box borderRadius={1} bg="#222222" mb={32}>
        <Box p={3} bg="#222222" mb={10}>
          <Heading as={'h5'} pb={2}>
            did
          </Heading>
          {id}
        </Box>
      </Box>
      <Box flexDirection={'column'} display={'flex'}>
        <Box mb={4}>
          <Text>
            {defaultDid === id
              ? 'This is your current default identity'
              : 'Set this DID as the default identity'}
          </Text>
          <Button mt={3} mb={3} mr={3} onClick={() => setDefaultDid(id)} disabled={defaultDid === id}>
            Set as default
          </Button>
        </Box>
        <Box>
          <Text>
            {defaultDid === id
              ? 'You cannot delete your default identity. Set another identity as your default to delete this identity'
              : 'Delete this identity. All data associated with it will be lost.'}
          </Text>
          <Text></Text>
          <Button
            variant="danger"
            mt={3}
            mb={3}
            mr={3}
            onClick={() => deleteId(id)}
            disabled={defaultDid === id}
          >
            Delete DID
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default Component
