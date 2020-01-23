import React, { useContext } from 'react'
import { Box, Avatar } from 'rimble-ui'
import { AppContext } from '../context/AppProvider'
import md5 from 'md5'

const Component = () => {
  const [appState] = useContext(AppContext)

  const gravatarType = 'identicon'
  const GRAVATAR_URI = 'https://www.gravatar.com/avatar/'
  const uri = GRAVATAR_URI + md5(appState.defaultDid) + '?s=100' + '&d=' + gravatarType

  return (
    <Box
      p={3}
      bg="#1C1C1C"
      alignItems={'center'}
      justifyContent={'space-between'}
      display={'flex'}
      flexDirection={'column'}
    >
      <Avatar size="45px" src={uri} />
      <Box borderRadius={5} width={45} height={45} bg="#FFFFFF" p={3}></Box>
    </Box>
  )
}

export default Component
