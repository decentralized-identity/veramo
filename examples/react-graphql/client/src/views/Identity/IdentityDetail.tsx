import React, { useContext } from 'react'
import { Box, Heading, Field, Input, Icon, Flash, Button, Text } from 'rimble-ui'
import { useParams, useHistory } from 'react-router-dom'
import { AppContext } from '../../context/AppProvider'
import { useMutation } from '@apollo/react-hooks'
import * as queries from '../../queries'

const Component = () => {
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
    })
    history.push('/identities')
  }

  return (
    <Box width={450} bg="#1C1C1C" borderLeft={1} borderColor={'#4B4B4B'}>
      <Box
        p={3}
        borderColor={'#4B4B4B'}
        flexDirection={'row'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        bg="#222222"
      >
        <Heading as={'h4'}>Identity</Heading>
        <Icon name={'Close'} onClick={() => history.push('/identities')} style={{ cursor: 'pointer' }} />
      </Box>
      <Box p={3} pb={64} className={'scroll-container'}>
        <Box borderRadius={1} bg="#222222" mb={32}>
          <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
            <Heading as={'h5'}>DID Details</Heading>
          </Box>
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
      </Box>
    </Box>
  )
}

export default Component
