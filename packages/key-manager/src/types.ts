import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'

export type Eip712Payload = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  primaryType: string
  message: Record<string, any>
}