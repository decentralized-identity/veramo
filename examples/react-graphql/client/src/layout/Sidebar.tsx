import React, { useContext } from 'react'
import { Box } from 'rimble-ui'
import { AppContext } from '../context/AppProvider'
import Avatar from '../components/Avatar/Avatar'

const Component = () => {
  const [appState] = useContext(AppContext)

  return (
    <Box
      p={3}
      bg="#1C1C1C"
      alignItems={'center'}
      justifyContent={'space-between'}
      display={'flex'}
      flexDirection={'column'}
    >
      <Avatar size={45} did={appState.defaultDid} type={'circle'} />
      <Box borderRadius={5} width={45} height={45} bg="#FFFFFF" p={3}></Box>
    </Box>
  )
}

export default Component
