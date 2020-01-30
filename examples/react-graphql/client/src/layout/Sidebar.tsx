import React, { useContext } from 'react'
import { Box } from 'rimble-ui'
import { AppContext } from '../context/AppProvider'
import Avatar from '../components/Avatar/Avatar'
import * as queries from '../gql/queries'
import { useQuery } from 'react-apollo'

const Component = () => {
  const [appState] = useContext(AppContext)
  const { data } = useQuery(queries.identity, { variables: { did: appState.defaultDid } })

  return (
    <Box
      p={3}
      bg="#1C1C1C"
      alignItems={'center'}
      justifyContent={'space-between'}
      display={'flex'}
      flexDirection={'column'}
    >
      <Avatar size={45} did={appState.defaultDid} source={data?.identity?.profileImage} type={'circle'} />
      <Box borderRadius={5} width={45} height={45} bg="#FFFFFF" p={3}></Box>
    </Box>
  )
}

export default Component
