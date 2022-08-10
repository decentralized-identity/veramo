import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'

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
