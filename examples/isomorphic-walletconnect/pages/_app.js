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

  /**
   * Reset state back to default
   */
  const reset = () => {
    updateWalletConnect(null)
    updateConnected(false)
    updateAddress(null)
    updateAccounts([])
    updateChainId(null)
  }

  /**
   * Initialize walletconnect
   */
  const init = async () => {
    const newWalletConnector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
    })

    /**
     * Walletconnect uses localstorage and window to rehydrate its sesion cache
     */
    window.walletConnector = newWalletConnector
    updateWalletConnect(newWalletConnector)

    if (!newWalletConnector.connected) {
      await newWalletConnector.createSession()
    }

    return newWalletConnector.uri
  }

  /**
   * Subscribe to walletconnect events
   */
  const subscribeToEvents = () => {
    console.log('Subscribing to events')

    if (!walletConnector) {
      return
    }

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

  /**
   * Kill walletconnect session
   */
  const killSession = () => {
    if (walletConnector) {
      Router.push('/login')
      walletConnector.killSession()
      reset()
    }
  }

  /**
   * Check for previous state on refresh
   */
  useEffect(() => {
    init()
  }, [])

  /**
   * Subscribe to events on change
   */
  useEffect(() => {
    if (walletConnector) {
      subscribeToEvents()
    }
  }, [walletConnector])

  /**
   * Subscribe to connection status
   */
  useEffect(() => {
    console.log(connected)

    if (connected) {
      Router.push('/dashboard')
    } else {
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
