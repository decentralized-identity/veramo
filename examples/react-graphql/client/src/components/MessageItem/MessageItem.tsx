import React from 'react'
import { Box, Heading, Text, Icon, Avatar } from 'rimble-ui'

import Credential from '../../components/Credential/Credential'

interface Props {
  credentialAction?: () => void
}

const Component: React.FC<Props> = ({ credentialAction }) => {
  return (
    <Box>
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
        <Avatar size={'50'} src="https://airswap-token-images.s3.amazonaws.com/DAI.png" />
        <Box ml={2}>
          <Text>
            <b>Simon</b> sent 4 credentials to <b>Mircea</b>
          </Text>
        </Box>
      </Box>
      <Box p={3} pl={4}>
        <Credential onClick={credentialAction} />
        <Credential onClick={credentialAction} />
        <Credential onClick={credentialAction} />
        <Credential onClick={credentialAction} />
      </Box>
    </Box>
  )
}

export default Component
