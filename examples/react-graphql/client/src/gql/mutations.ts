import { gql } from 'apollo-boost'

export const deleteIdentity = gql`
  mutation deleteIdentity($type: String, $did: String) {
    deleteIdentity(type: $type, did: $did)
  }
`

export const actionSignVc = gql`
  mutation actionSignVc($did: String!, $data: VerifiableCredentialInput!) {
    actionSignVc(did: $did, data: $data)
  }
`

export const actionSignVp = gql`
  mutation signVp($did: String!, $data: VerifiablePresentationInput!) {
    actionSignVp(did: $did, data: $data)
  }
`

export const actionSignSDR = gql`
  mutation signSDR($did: String!, $data: SDRInput!) {
    actionSignSDR(did: $did, data: $data)
  }
`
export const actionSendJwt = gql`
  mutation actionSendJwt($from: String!, $to: String!, $jwt: String!) {
    actionSendJwt(from: $from, to: $to, jwt: $jwt)
  }
`

export const createIdentity = gql`
  mutation createIdentity($type: String) {
    createIdentity(type: $type) {
      did
    }
  }
`
