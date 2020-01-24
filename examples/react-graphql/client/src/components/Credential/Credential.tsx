import React from 'react'
import { Box, Heading, Text, Icon, Avatar } from 'rimble-ui'
import Page from '../../layout/Page'

interface Props {
  onClick?: () => void
}

const Component: React.FC<Props> = ({ onClick }) => {
  return (
    <Box border={1} borderRadius={5} borderColor={'#555555'} p={3} maxWidth={350} mb={16} onClick={onClick}>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'40'} src={''} />
        <Box ml={2}>
          <Text fontWeight={'bold'}>Simon</Text>
          <Box flexDirection={'row'} display={'flex'}>
            <Icon name={'PlayArrow'} />
            <Text>Mircea</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Component
