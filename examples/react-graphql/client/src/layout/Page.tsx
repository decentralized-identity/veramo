import React from 'react'
import { Box, Heading } from 'rimble-ui'

const Component = (props: any) => {
  return (
    <>
      <Box
        p={3}
        bg="#1C1C1C"
        borderBottom={1}
        borderColor={'#4B4B4B'}
        flexDirection={'row'}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <Heading as={'h4'}>{props.title}</Heading>
      </Box>
      <Box p={3} flex={1} pb={64} className={'scroll-container'}>
        {props.children}
      </Box>
    </>
  )
}

export default Component
