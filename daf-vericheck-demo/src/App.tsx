import * as React from 'react'
import WalletConnect from '@walletconnect/browser'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { convertUtf8ToHex } from '@walletconnect/utils'
import { IInternalEvent } from '@walletconnect/types'
import {
  apiGetAccountAssets,
  // apiGetGasPrices,
  // apiGetAccountNonce
} from './helpers/api'
// import {
//   recoverTypedSignature
// } from "./helpers/ethSigUtil";
import { sanitizeHex, recoverPersonalSignature } from './helpers/utilities'
import {
  // convertAmountToRawNumber,
  convertStringToHex,
} from './helpers/bignumber'
import { IAssetData } from './helpers/types'

import * as SD from 'daf-selective-disclosure'
import * as w3C from 'daf-w3c'
import { core, Message } from './daf'
import { Switch, Route } from 'react-router-dom'
import { withRouter } from 'react-router'
import Home from './components/Home/Home'
import KYC from './components/KYC/KYC'

interface IAppState {
  walletConnector: WalletConnect | null
  fetching: boolean
  connected: boolean
  chainId: number
  showModal: boolean
  pendingRequest: boolean
  uri: string
  accounts: string[]
  address: string
  result: any | null
  assets: IAssetData[]
  activeDid: string
  identities: IIdentityStore[]
  providers: IProvider[]
  name: string
}

interface IIdentityStore {
  identityProviderType: string
  did: string
}
interface IProvider {
  type: string
  description: string
}

const INITIAL_STATE: IAppState = {
  walletConnector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: '',
  accounts: [],
  address: '',
  result: null,
  assets: [],
  activeDid: '',
  identities: [],
  providers: [],
  name: 'DaftMask User',
}

class App extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE,
  }

  public componentDidMount() {
    this.updateIdentityList()

    core.identityManager.getIdentityProviderTypes().then((providers: any) => {
      this.setState({
        ...this.state,
        providers,
      })
    })
  }

  public updateIdentityList = () => {
    core.identityManager.getIdentities().then((identities: any) => {
      this.setState({
        ...this.state,
        identities,
      })

      if (identities.length > 0) {
        this.setState({
          ...this.state,
          activeDid: identities[0].did,
        })
      } else {
        this.createBrowserIdentity()
      }
    })
  }

  public walletConnectInit = async () => {
    // bridge url
    const bridge = 'https://bridge.walletconnect.org'
    console.log('walletConnectInit 1')

    // create new walletConnector
    const walletConnector = new WalletConnect({ bridge })
    console.log('walletConnectInit 2')

    window.walletConnector = walletConnector
    console.log('walletConnectInit 3')

    await this.setState({ walletConnector })
    console.log('walletConnectInit 4')

    // check if already connected
    if (!walletConnector.connected) {
      console.log('walletConnectInit 5')
      // create new session
      await walletConnector.createSession()

      console.log('walletConnectInit 7')
      // get uri for QR Code modal
      const uri = walletConnector.uri

      // console log the uri for development
      console.log(uri) // tslint:disable-line

      console.log('walletConnectInit 8')
      // display QR Code modal
      WalletConnectQRCodeModal.open(uri, () => {
        console.log('QR Code Modal closed') // tslint:disable-line
      })
    }
    console.log('walletConnectInit 6')
    // subscribe to events
    await this.subscribeToEvents()
  }
  public subscribeToEvents = () => {
    const { walletConnector } = this.state

    if (!walletConnector) {
      return
    }

    walletConnector.on('session_update', async (error, payload) => {
      console.log('walletConnector.on("session_update")') // tslint:disable-line

      if (error) {
        throw error
      }

      const { chainId, accounts } = payload.params[0]
      this.onSessionUpdate(accounts, chainId)
    })

    walletConnector.on('connect', (error, payload) => {
      console.log('walletConnector.on("connect")') // tslint:disable-line

      if (error) {
        throw error
      }

      this.onConnect(payload)
    })

    walletConnector.on('disconnect', (error, payload) => {
      console.log('walletConnector.on("disconnect")') // tslint:disable-line

      if (error) {
        throw error
      }

      this.onDisconnect()
    })

    if (walletConnector.connected) {
      const { chainId, accounts } = walletConnector
      const address = accounts[0]
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      })
    }

    this.setState({ walletConnector })
  }

  public killSession = async () => {
    const { walletConnector } = this.state
    if (walletConnector) {
      walletConnector.killSession()
    }
    this.resetApp()
  }

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE })
  }

  public onConnect = async (payload: IInternalEvent) => {
    const { chainId, accounts } = payload.params[0]
    const address = accounts[0]
    await this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    })
    WalletConnectQRCodeModal.close()

    this.props.history.push('/kyc')

    this.getAccountAssets()
  }

  public onDisconnect = async () => {
    WalletConnectQRCodeModal.close()
    this.resetApp()
  }

  public onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0]
    await this.setState({ chainId, accounts, address })
    // await this.getAccountAssets();
  }

  public getAccountAssets = async () => {
    const { address, chainId } = this.state
    this.setState({ fetching: true })
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId)

      await this.setState({ fetching: false, address, assets })
    } catch (error) {
      console.error(error) // tslint:disable-line
      await this.setState({ fetching: false })
    }
  }

  public createBrowserIdentity = async () => {
    await core.identityManager.createIdentity('rinkeby-ethr-did')

    this.updateIdentityList()
  }

  public logState = () => {
    console.log(this.state)
  }

  public requestDid = async () => {
    const { walletConnector, address } = this.state

    if (!walletConnector) {
      return
    }

    const threadId = Date.now()
    const request = await core.handleAction({
      type: SD.ActionTypes.signSdr,
      did: this.state.activeDid,
      data: {
        tag: threadId.toString(),
        claims: [
          {
            reason: 'We need this information',
            essential: true,
            claimType: 'name',
          },
        ],
      },
    } as SD.ActionSignSdr)

    const customRequest = {
      id: threadId,
      jsonrpc: '2.0',
      method: 'request_credentials',
      params: [request],
    }

    console.log('Sending Selective Disclosure Request', customRequest)

    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      const result = await walletConnector.sendCustomRequest(customRequest)

      // format displayed result
      const formattedResult = {
        method: 'request_credentials',
        address,
        result,
      }

      const message = await core.validateMessage(
        new Message({
          raw: formattedResult.result,
          meta: {
            type: 'walletConnect',
          },
        }),
      )

      const credentialSubject = message.vc[0].payload.vc.credentialSubject

      // display result
      this.setState({
        walletConnector,
        pendingRequest: false,
        result: credentialSubject || null,
      })

      console.log('VerifiablePresentation Receieved!', message)
    } catch (error) {
      this.setState({ walletConnector, pendingRequest: false, result: null })
    }
  }

  public sendCredential = async () => {
    const { walletConnector, address } = this.state

    if (!walletConnector) {
      return
    }

    const credential = await core.handleAction({
      type: w3C.ActionTypes.signVc,
      did: this.state.activeDid,
      data: {
        sub: `did:ethr:rinkeby:${address.toLowerCase()}`,
        vc: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject: {
            name: 'VeriChecked User',
            kyc: 'VALID',
          },
        },
      },
    } as w3C.ActionSignW3cVc)

    const customRequest = {
      id: 1337,
      jsonrpc: '2.0',
      method: 'issue_credential',
      params: [credential],
    }

    console.log('Sending Credential', customRequest)

    try {
      await walletConnector.sendCustomRequest(customRequest)
    } catch (error) {
      console.error(error) // tslint:disable-line
      this.setState({ walletConnector, pendingRequest: false, result: null })
    }
  }

  public toggleModal = () => this.setState({ showModal: !this.state.showModal })

  public testSendTransaction = async () => {
    const { walletConnector, address, chainId } = this.state

    console.log(chainId)

    if (!walletConnector) {
      return
    }

    // from
    const from = address

    // to
    const to = address

    // nonce
    // const _nonce = await apiGetAccountNonce(address, chainId);
    // const nonce = sanitizeHex(convertStringToHex(_nonce));

    // gasPrice
    // const gasPrices = await apiGetGasPrices();
    // const _gasPrice = gasPrices.slow.price;
    // const gasPrice = sanitizeHex(
    //   convertStringToHex(convertAmountToRawNumber(_gasPrice, 9))
    // );

    // gasLimit
    const _gasLimit = 21000
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit))

    // value
    const _value = 0
    const value = sanitizeHex(convertStringToHex(_value))

    // data
    const data = '0x'

    // test transaction
    const tx = {
      from,
      to,
      nonce: 2,
      gasPrice: 10000,
      gasLimit,
      value,
      data,
    }

    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      // send transaction
      const result = await walletConnector.sendTransaction(tx)

      // format displayed result
      const formattedResult = {
        method: 'eth_sendTransaction',
        txHash: result,
        from: address,
        to: address,
        value: '0 ETH',
      }

      // display result
      this.setState({
        walletConnector,
        pendingRequest: false,
        result: formattedResult || null,
      })
    } catch (error) {
      console.error(error) // tslint:disable-line
      this.setState({ walletConnector, pendingRequest: false, result: null })
    }
  }

  public testSignPersonalMessage = async () => {
    const { walletConnector, address } = this.state

    if (!walletConnector) {
      return
    }

    // test message
    const message = 'My email is john@doe.com - 1537836206101'

    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message)

    // personal_sign params
    const msgParams = [hexMsg, `${address}`]

    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      // send message
      const result = await walletConnector.signPersonalMessage(msgParams)

      // verify signature
      const signer = recoverPersonalSignature(result, message)
      const verified = signer.toLowerCase() === address.toLowerCase()

      // format displayed result
      const formattedResult = {
        method: 'personal_sign',
        address,
        signer,
        verified,
        result,
      }

      // display result
      this.setState({
        walletConnector,
        pendingRequest: false,
        result: formattedResult || null,
      })
    } catch (error) {
      console.error(error) // tslint:disable-line
      this.setState({ walletConnector, pendingRequest: false, result: null })
    }
  }

  public testSignTypedData = async () => {
    const { walletConnector, address } = this.state

    if (!walletConnector) {
      return
    }

    // typed data
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'account', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Example Dapp',
        version: '0.7.0',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
      message: {
        from: {
          name: 'Alice',
          account: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
        to: {
          name: 'Bob',
          account: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        },
        contents: 'Hey, Bob!',
      },
    }

    // eth_signTypedData params
    const msgParams = [address, typedData]

    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      // sign typed data
      const result = await walletConnector.signTypedData(msgParams)

      // // verify signature
      // const signer = recoverPublicKey(result, typedData);
      // const verified = signer.toLowerCase() === address.toLowerCase();

      // format displayed result
      const formattedResult = {
        method: 'eth_signTypedData',
        address,
        // signer,
        // verified,
        result,
      }

      // display result
      this.setState({
        walletConnector,
        pendingRequest: false,
        result: formattedResult || null,
      })
    } catch (error) {
      console.error(error) // tslint:disable-line
      this.setState({ walletConnector, pendingRequest: false, result: null })
    }
  }

  public render = () => {
    return (
      <Switch>
        <Route path="/kyc">
          <KYC app={this} />
        </Route>
        <Route path="/">
          <Home app={this} />
        </Route>
      </Switch>
    )
  }
}

export default withRouter(App)
