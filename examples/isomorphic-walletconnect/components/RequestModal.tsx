import {
  Box,
  Heading,
  Text,
  Icon,
  Modal,
  Card,
  Flex,
  Loader,
  Link,
} from 'rimble-ui'

const RequestModal = ({ isOpen, requestType }) => {
  return (
    <Modal isOpen={isOpen}>
      <Card p={0} borderRadius={1}>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          borderBottom={1}
          borderColor="near-white"
          p={[3, 4]}
          pb={3}
        >
          <Icon name="Person" color="primary" aria-hidden="true" />
          <Heading textAlign="center" as="h1" fontSize={[2, 3]} px={[3, 0]}>
            You have been issued a credential
          </Heading>
          <Link>
            <Icon
              name="Close"
              color="moon-gray"
              aria-label="Close and cancel connection"
            />
          </Link>
        </Flex>
        <Box p={[3, 4]}>
          <Text textAlign="center">
            Accept the credential that has appeared on your device
          </Text>
        </Box>
        <Box px={[3, 4]} pb={[3, 4]}>
          <Flex
            flexDirection={['column', 'row']}
            bg={'primary-2x-light'}
            p={[3, 4]}
            alignItems={['center', 'auto']}
          >
            <Loader size={'3em'} mr={[0, 3]} mb={[2, 0]} />
            <Flex flexDirection="column" alignItems={['center', 'flex-start']}>
              <Text fontWeight={4}>Waiting for you to accept...</Text>
              <Text fontWeight={2}>This won’t cost you any Ether</Text>
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Modal>
  )
}

export default RequestModal
