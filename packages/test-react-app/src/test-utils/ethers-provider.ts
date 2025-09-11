import { BrowserProvider, Eip1193Provider, Wallet } from 'ethers'

export function createEthersProvider(): BrowserProvider {
  const privateKeyHex = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
  const wallet = new Wallet(privateKeyHex)
  const mockProvider = new MockWeb3Provider(wallet)
  const provider = new BrowserProvider(mockProvider)
  return provider
}

class MockWeb3Provider implements Eip1193Provider {
  constructor(private wallet: Wallet) {}

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
        return this.wallet.signTypedData(domain, types, message)
      case 'eth_accounts':
        return [await this.wallet.getAddress()]
      case 'eth_chainId':
        return "1337"
      break
      default:
        throw Error(`not_available: method ${request.method}`)
    }
  }
}
