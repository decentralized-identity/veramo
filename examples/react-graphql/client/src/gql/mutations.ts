import { gql } from 'apollo-boost'

export const deleteIdentity = gql`
  mutation deleteIdentity($type: String, $did: String) {
    deleteIdentity(type: $type, did: $did)
  }
`

export const signCredentialJwt = gql`
  mutation signCredentialJwt($data: SignCredentialInput!) {
    signCredentialJwt(data: $data) {
      raw
    }
  }
`

export const signPresentationJwt = gql`
  mutation signPresentationJwt($data: SignPresentationInput!) {
    signPresentationJwt(data: $data) {
      raw
    }
  }
`

export const signSdrJwt = gql`
  mutation signSdrJwt($data: SDRInput!) {
    signSdrJwt(data: $data)
  }
`
export const actionSendJwt = gql`
  mutation actionSendJwt($from: String!, $to: String!, $jwt: String!) {
    actionSendJwt(from: $from, to: $to, jwt: $jwt) {
      id
    }
  }
`

export const createIdentity = gql`
  mutation createIdentity($type: String) {
    createIdentity(type: $type) {
      did
    }
  }
`
