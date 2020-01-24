import React from 'react'
import { Box, Heading, Icon } from 'rimble-ui'
import { useHistory } from 'react-router-dom'

interface Props {
  title: string
  closeUrl: string
}

const Component: React.FC<Props> = ({ title, closeUrl, children }) => {
  let history = useHistory()

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
        <Heading as={'h4'}>{title}</Heading>
        <Icon name={'Close'} onClick={() => history.push(closeUrl)} style={{ cursor: 'pointer' }} />
      </Box>
      <Box p={3} pb={64} className={'scroll-container'}>
        {children}
      </Box>
    </Box>
  )
}

export default Component
