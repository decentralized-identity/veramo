import { useContext, useState } from 'react'
import { Box, Heading, Button, Text, QR, Modal, Card, Flex } from 'rimble-ui'
import { WalletConnectContext } from '../components/WalletConnectContext'

const Login = props => {
  const { init } = useContext(WalletConnectContext)
  const [uri, updateUri] = useState()
  const [isOpen, setIsOpen] = useState(false)

  const connect = async e => {
    const uri = await init()
    updateUri(uri)
    openModal(e)
    console.log(uri)
  }

  const closeModal = e => {
    setIsOpen(false)
  }

  const openModal = e => {
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
              mt={0}
              mr={0}
              onClick={closeModal}
            />
            {uri && (
              <Box p={4} alignItems={'center'} justifyContent={'center'}>
                <QR value={uri} size={430} />
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
