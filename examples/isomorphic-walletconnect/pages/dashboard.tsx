import { useContext } from 'react'
import { Box, Button, Heading, Text } from 'rimble-ui'
import { WalletConnectContext } from '../components/WalletConnectContext'
import { core } from '../daf/setup'

const Welcome = props => {
  const { killSession, address } = useContext(WalletConnectContext)
  const { issuer } = props

  return (
    <div>
      <Box>
        <Heading>Welcome</Heading>
        <Text>Logged in as: {address}</Text>
        <Text>Dapp Issuer: {issuer}</Text>
        <Button onClick={killSession}>Log out</Button>
      </Box>
    </div>
  )
}

export async function getServerSideProps(context) {
  const data = await core.identityManager.getIdentities()

  if (data.length === 0) {
    core.identityManager.createIdentity('rinkeby-ethr-did')
  }

  return {
    props: {
      issuer: data[0].did,
    },
  }
}

export default Welcome
