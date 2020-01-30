import React from 'react'
import { Box, Heading } from 'rimble-ui'

interface Props {
  padding?: number
  title: string
}

const Component: React.FC<Props> = ({ padding, children, title }) => {
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
        <Heading as={'h4'}>{title}</Heading>
      </Box>
      <Box p={padding} flex={1} pb={64} className={'scroll-container'}>
        {children}
      </Box>
    </>
  )
}

export default Component
