import { TypedDataDomain, TypedDataField } from 'ethers'

/**
 * The payload that is sent to be signed according to EIP712
 * @see {@link https://eips.ethereum.org/EIPS/eip-712}
 * @beta
 */
export type Eip712Payload = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  primaryType: string
  message: Record<string, any>
}
