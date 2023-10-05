import type { JsonRpcError, JsonRpcPayload, JsonRpcResult } from 'ethers'
import { assertArgument, Contract, ContractFactory, JsonRpcApiProvider, Network } from 'ethers'
import { EthereumDIDRegistry } from 'ethr-did-resolver'
import type { EthereumProvider } from 'ganache'
import ganache from 'ganache'

export type GanacheConfig = Parameters<typeof ganache.provider>[0]

/**
 * A JsonRpcApiProvider that connects to a local ganache instance.
 *
 * Code mostly copied from ethersjs test tooling
 * (https://github.com/ethers-io/ext-provider-ganache/blob/335566b563b0a48844e2427ff9e3cd809e37d2b8/src.ts/provider-ganache.ts#L30)
 */
export class GanacheProvider extends JsonRpcApiProvider {
  readonly ganache: EthereumProvider

  constructor(providerOrOptions?: EthereumProvider | GanacheConfig) {
    let provider: EthereumProvider
    if (providerOrOptions == null || typeof (<any>providerOrOptions).getOptions !== 'function') {
      provider = ganache.provider(<any>providerOrOptions)
    } else {
      provider = <EthereumProvider>providerOrOptions
    }

    const network = new Network('testnet', provider.getOptions().chain.chainId)
    super(network, {
      staticNetwork: network,
      batchMaxCount: 1,
      batchStallTime: 0,
      cacheTimeout: -1,
    })

    this.ganache = provider
  }

  async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>> {
    assertArgument(!Array.isArray(payload), 'batch requests unsupported', 'UNSUPPORTED_OPERATION', {
      operation: '_send',
      info: { payload },
    })

    const result = await this.ganache.request(<any>payload)
    return [{ id: payload.id, result }]
  }
}

/**
 * Creates a Web3Provider that connects to a local ganache instance with a bunch of known keys and an ERC1056 contract.
 *
 * This provider can only be used in a single test suite, because of some concurrency issues with ganache.
 */
export async function createGanacheProvider(): Promise<{ provider: JsonRpcApiProvider; registry: string }> {
  const provider = new GanacheProvider({
    logging: { quiet: true },
    accounts: [
      {
        secretKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
        //  address: '0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
        //  publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000001',
        //  address: '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf',
        //  publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000002',
        //  address: '0x2b5ad5c4795c026514f8317c7a215e218dccd6cf',
        //  publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000003',
        //  address: '0x6813eb9362372eef6200f3b1dbc3f819671cba69',
        //  publicKey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000004',
        //  address: '0x1eff47bc3a10a45d4b230b5d10e37751fe6aa718',
        //  publicKey: '02e493dbf1c10d80f3581e4904930b1404cc6c13900ee0758474fa94abe8c4cd13'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000005',
        //  address: '0xe1ab8145f7e55dc933d51a18c793f901a3a0b276'
        //  publicKey: '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4'
        balance: '0x1000000000000000000000',
      },
      {
        secretKey: '0x0000000000000000000000000000000000000000000000000000000000000006',
        balance: `0x1000000000000000000000`,
      },
    ],
  })
  await provider.ready
  const factory = ContractFactory.fromSolidity(EthereumDIDRegistry).connect(await provider.getSigner(0))

  let registryContract: Contract = await factory.deploy()
  registryContract = await registryContract.waitForDeployment()

  const registry = await registryContract.getAddress()
  return { provider, registry }
}
