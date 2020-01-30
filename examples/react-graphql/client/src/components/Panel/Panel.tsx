import React, { useState } from 'react'
import { Box, Text, Heading } from 'rimble-ui'

interface PanelProps {
  heading: string
  description?: string
  headerRight?: React.ReactNode
  headerBorder?: number
}

const Panel: React.FC<PanelProps> = props => {
  return (
    <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
      <Box
        p={3}
        borderBottom={props.headerBorder !== undefined ? props.headerBorder : 1}
        borderColor={'#4B4B4B'}
        flexDirection={'row'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
        height={60}
      >
        <Box>
          <Heading as={'h5'}>{props.heading}</Heading>
          {props.description && <Text small>{props.description}</Text>}
        </Box>
        {props.headerRight && props.headerRight}
      </Box>
      <Box>{props.children}</Box>
    </Box>
  )
}

export default Panel
