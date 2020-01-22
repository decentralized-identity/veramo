import React from 'react'
import { Box } from 'rimble-ui'

const Component = () => {
  return (
    <Box
      p={3}
      bg="#1C1C1C"
      alignItems={'center'}
      justifyContent={'space-between'}
      display={'flex'}
      flexDirection={'column'}
    >
      <Box borderRadius={25} width={50} height={50} bg="#FFFFFF" p={3}></Box>
      <Box borderRadius={5} width={45} height={45} bg="#FFFFFF" p={3}></Box>
    </Box>
  )
}

export default Component
