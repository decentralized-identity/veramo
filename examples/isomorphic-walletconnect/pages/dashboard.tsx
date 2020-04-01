import { useContext, useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Text,
  Icon,
  Blockie,
  Modal,
  Card,
  Flex,
  Loader,
  Link,
} from 'rimble-ui'
import { WalletConnectContext } from '../components/WalletConnectContext'
import RequestModal from '../components/RequestModal'
import ContentBlock from '../components/ContentBlock'
import useSignVC from '../hooks/use-sign-vc'

const Welcome = props => {
  const [isOpen, setIsOpen] = useState(false)
  const [requestType, setRequestType] = useState('')
  const closeModal = () => {
    setIsOpen(false)
  }
  const openModal = () => {
    setIsOpen(true)
  }
  const { killSession, address, walletConnector } = useContext(
    WalletConnectContext,
  )

  const receiveCredential = async (shouldWait: boolean) => {
    if (!walletConnector) {
      return
    }
    const { accounts } = walletConnector
    const address = accounts[0]
    const { data } = await useSignVC(address)

    const customRequest = {
      id: 1000,
      jsonrpc: '2.0',
      method: shouldWait ? 'issue_credential_callback' : 'issue_credential',
      params: [data],
    }

    if (shouldWait) {
      openModal()
      setRequestType('CREDENTIAL_ISSUE')
    }

    const response = await walletConnector.sendCustomRequest(customRequest)

    if (shouldWait && response === 'CREDENTIAL_ACCEPTED') {
      closeModal()
    }
  }

  return (
    <Box>
      <RequestModal isOpen={isOpen} requestType={requestType} />
      <Box
        bg={'#2F2F2F'}
        pl={3}
        pr={4}
        height={65}
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
          <Box
            bg={'#FFFFFF'}
            height={45}
            width={45}
            borderRadius={23}
            mr={2}
          ></Box>
          <Heading as={'h3'} color={'#FFFFFF'}>
            Dafhub
          </Heading>
        </Box>
        <Box flexDirection={'row'} display={'flex'} alignItems={'center'}>
          <Box
            mr={3}
            flexDirection={'row'}
            display={'flex'}
            alignItems={'center'}
          >
            <Blockie
              borderRadius={5}
              opts={{
                seed: 'foosss',
                color: '#dfe',
                bgcolor: '#a71',
                size: 7,
                scale: 5,
                spotcolor: '#000',
              }}
            />

            <Icon name={'ArrowDropDown'} color={'#FFFFFF'} />
          </Box>
          <Button.Text mainColor={'#FFFFFF'} onClick={killSession}>
            Log out
          </Button.Text>
        </Box>
      </Box>
      <Box p={4}>
        <Box>
          <Heading as={'h2'}>Hey username!</Heading>
        </Box>

        <Box mt={4}>
          <Heading as={'h3'}>Verifiable Credentials</Heading>
        </Box>
        <Box flexDirection={'row'} display={'flex'} mt={3}>
          <ContentBlock
            title={'Receive credential with callback'}
            text={
              'Issue a credential from DafHub to your mobile. This will wait for you to accept the credential'
            }
            action={() => receiveCredential(true)}
            buttonText={'Receive'}
          />
          <ContentBlock
            title={'Receive credential standard'}
            text={
              'Issue a credential from DafHub to your mobile. The credential will just appear on your device without a response from you.'
            }
            action={() => receiveCredential(false)}
            buttonText={'Receive'}
          />
          <ContentBlock
            title={'Request credentials'}
            text={
              'Gwei based on a fundamental analysis although Zilliqa froze some safe ICO! Since Basic Attention Token detected the stablecoin'
            }
            action={() => {}}
            buttonText={'Request'}
          />
          <ContentBlock
            title={'Issue credential'}
            text={
              'Gwei based on a fundamental analysis although Zilliqa froze some safe ICO! Since Basic Attention Token detected the stablecoin'
            }
            action={() => {}}
            buttonText={'Issue'}
          />
        </Box>
        <Box mt={6}>
          <Heading as={'h3'}>Ethereum Signing</Heading>
        </Box>
        <Box flexDirection={'row'} display={'flex'} mt={3}>
          <ContentBlock
            title={'Send Transaction*'}
            text={
              'Gwei based on a fundamental analysis although Zilliqa froze some safe ICO! Since Basic Attention Token detected the stablecoin'
            }
            action={() => {}}
            buttonText={'Send'}
          />
          <ContentBlock
            title={'Personal Sign'}
            text={
              'Gwei based on a fundamental analysis although Zilliqa froze some safe ICO! Since Basic Attention Token detected the stablecoin'
            }
            action={() => {}}
            buttonText={'Sign'}
          />
          <ContentBlock
            title={'Sign Eth Typed Data'}
            text={
              'Gwei based on a fundamental analysis although Zilliqa froze some safe ICO! Since Basic Attention Token detected the stablecoin'
            }
            action={() => {}}
            buttonText={'Sign'}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Welcome
