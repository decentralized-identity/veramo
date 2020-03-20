import { useEffect, useState } from 'react'
import Router from 'next/router'
import { WalletConnectContext } from '../components/WalletConnectContext'
import WalletConnect from '@walletconnect/browser'

function MyApp({ Component, pageProps }) {
  const [walletConnector, updateWalletConnect] = useState(null)
  const [address, updateAddress] = useState(null)
  const [accounts, updateAccounts] = useState([])
  const [chainId, updateChainId] = useState(null)
  const [connected, updateConnected] = useState(false)

  const reset = () => {
    updateWalletConnect(null)
    updateConnected(false)
    updateAddress(null)
    updateAccounts([])
    updateChainId(null)
  }

  const init = async () => {
    const newWalletConnector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
    })

    window.walletConnector = newWalletConnector
    updateWalletConnect(newWalletConnector)

    if (!newWalletConnector.connected) {
      await newWalletConnector.createSession()
    }

    return newWalletConnector.uri
  }

  const subscribeToEvents = () => {
    if (!walletConnector) {
      return
    }

    console.log('Subscribing to events')

    walletConnector.on('session_update', async (error, payload) => {
      console.log('walletConnector.on("session_update")') // tslint:disable-line

      if (error) {
        throw error
      }

      const { chainId, accounts } = payload.params[0]
    })

    walletConnector.on('connect', (error, payload) => {
      console.log('walletConnector.on("connect")') // tslint:disable-line

      if (error) {
        throw error
      }

      const { chainId, accounts } = payload.params[0]
      const address = accounts[0]

      updateConnected(true)
      updateAddress(address)
      updateAccounts(accounts)
      updateChainId(chainId)
    })

    if (walletConnector.connected) {
      const { chainId, accounts } = walletConnector
      const address = accounts[0]

      updateConnected(true)
      updateAddress(address)
      updateChainId(chainId)
      updateAccounts(accounts)
    }
  }

  const killSession = () => {
    if (walletConnector) {
      walletConnector.killSession()
      reset()

      Router.push('/login')
    }
  }

  useEffect(() => {
    if (walletConnector) {
      subscribeToEvents()
    }
  }, [walletConnector])

  useEffect(() => {
    if (connected) {
      Router.push('/dashboard')
    } else {
      init()
      Router.push('/login')
    }
  }, [connected])

  return (
    <WalletConnectContext.Provider value={{ init, killSession, address }}>
      <Component {...pageProps} />
    </WalletConnectContext.Provider>
  )
}

export default MyApp
