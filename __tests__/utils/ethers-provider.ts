import { Web3Provider, ExternalProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

export function createEthersProvider(): Web3Provider {
  const privateKeyHex = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
  const wallet = new Wallet(privateKeyHex)
  const mockProvider = new MockWeb3Provider(wallet)
  const provider = new Web3Provider(mockProvider)
  return provider
}


class MockWeb3Provider implements ExternalProvider {
  constructor(private wallet: Wallet){

  }
  async request(request: { method: string; params?: any[] }): Promise<any> {
    
    switch(request.method) {
      case 'personal_sign':
        // @ts-ignore
        return this.wallet.signMessage(request.params[1])
        break
        case 'eth_signTypedData_v4':
        // @ts-ignore
        const {domain, types, message} = JSON.parse(request.params[1])
        delete(types.EIP712Domain)
        return this.wallet._signTypedData(domain, types, message)
      break
      default:
        throw Error(`not_available: method ${request.method}`)
    }
  }
}
