import React from 'react'
import { Box, Heading, Avatar, Text } from 'rimble-ui'
import * as Types from '../../types'

interface Props {
  sender: Types.Identity
  receiver: Types.Identity
  sdr: any
}

const Component: React.FC<Props> = ({ sdr, sender, receiver }) => {
  console.log(sdr, sender, receiver)

  return (
    <Box>
      <Box
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        display={'flex'}
        flex={1}
        py={4}
        bg={'#252731'}
      >
        <Avatar size={'60px'} src={''} />
        <Heading as={'h3'} mt={2}>
          {sender.shortId}
        </Heading>
      </Box>
      <Box bg={'#000000'} p={3}>
        <Text>Share your data with {sender.shortId}</Text>
      </Box>
    </Box>
  )
}

export default Component
