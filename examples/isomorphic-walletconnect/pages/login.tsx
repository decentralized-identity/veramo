import { useContext, useState } from 'react'
import { Box, Heading, Button, Text, QR, Modal, Card, Flex } from 'rimble-ui'
import { WalletConnectContext } from '../components/WalletConnectContext'

const Login = props => {
  const { init, killSession } = useContext(WalletConnectContext)
  const [uri, updateUri] = useState()
  const [isOpen, setIsOpen] = useState(false)

  const connect = async e => {
    const uri = await init()
    updateUri(uri)
    openModal(e)
    console.log(uri)
  }

  const closeModal = e => {
    e.preventDefault()
    setIsOpen(false)
  }

  const openModal = e => {
    e.preventDefault()
    setIsOpen(true)
  }

  return (
    <div>
      <Box>
        <Heading>Login</Heading>
        <Button onClick={connect}>Connect</Button>

        <Modal isOpen={isOpen}>
          <Card width={'500px'} p={0}>
            <Button.Text
              icononly
              icon={'Close'}
              color={'moon-gray'}
              position={'absolute'}
              top={0}
              right={0}
              mt={3}
              mr={3}
              onClick={closeModal}
            />

            {uri && (
              <Box p={4} mb={3}>
                <QR value={uri} size={500} />
              </Box>
            )}
          </Card>
        </Modal>
      </Box>
    </div>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      data: '',
    },
  }
}
export default Login
