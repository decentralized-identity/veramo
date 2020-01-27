import React from 'react'
import { Box, Heading } from 'rimble-ui'
import * as Types from '../../types'

interface Props {
  sender: Types.Identity
  receiver: Types.Identity
  sdr: any
}

const Component: React.FC<Props> = ({ sdr }) => {
  console.log(sdr)

  return <Box>Show contents from query. Results are logged in console..</Box>
}

export default Component
