import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { Flex, Box, Text, Heading, Button, Icon } from 'rimble-ui'

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [sidePanelOpen, toggleSidePanel] = useState(false)

  return (
    <Flex flexDirection={'row'} flex={1}>
      <Box p={3} bg="#1C1C1C">
        <Box borderRadius={1} width={40} height={40} bg="white"></Box>
      </Box>
      <Box p={3} width={220} bg="#28292B" borderRight={1} borderColor={'#4B4B4B'}>
        <Box mb={32}>
          <Heading as={'h3'}>Daf Dashboard</Heading>
          <Text>Description</Text>
        </Box>
        <Box bg="#222222" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Activity</Text>
        </Box>
        <Box bg="#983587" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Explore</Text>
        </Box>
        <Box bg="#222222" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Issue Credential</Text>
        </Box>
        <Box bg="#222222" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Request</Text>
        </Box>
        <Box bg="#222222" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Link 1</Text>
        </Box>
        <Box bg="#222222" mb={2} p={1} pl={3} borderRadius={1}>
          <Text>Link 1</Text>
        </Box>
      </Box>
      <Box flex={1} bg="#1C1C1C">
        <Box
          p={3}
          bg="#1C1C1C"
          borderBottom={1}
          borderColor={'#4B4B4B'}
          flexDirection={'row'}
          display={'flex'}
          justifyContent={'space-between'}
        >
          <Heading as={'h4'}>Page Header</Heading>
          <Icon name={'Menu'} color={'#CCC'} size={35} onClick={() => toggleSidePanel(!sidePanelOpen)} />
        </Box>

        <Box p={3} flex={1} height={'100%'} overflow={'scroll'} pb={64}>
          <Box borderRadius={1} bg="#2B2B2B" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>

          <Box borderRadius={1} bg="#222222" flex={1} mb={32}>
            <Box p={3} borderBottom={1} borderColor={'#4B4B4B'}>
              <Heading as={'h5'}>Panel Header</Heading>
            </Box>
            <Box p={3}>Panel body</Box>
          </Box>
        </Box>
      </Box>
      {sidePanelOpen && (
        <Box width={350} bg="#1C1C1C" borderLeft={1} borderColor={'#4B4B4B'}>
          <Box p={3}>
            <Heading as={'h4'}>Context Panel</Heading>
          </Box>
          <Box p={3}>
            <Text>We can show contextual information here</Text>
          </Box>
        </Box>
      )}
    </Flex>
  )
}

export default Dashboard
