import { gql } from 'apollo-boost'

export const createIdentity = gql`
  mutation createIdentity($type: String) {
    createIdentity(type: $type) {
      did
    }
  }
`

export const deleteIdentity = gql`
  mutation deleteIdentity($type: String, $did: String) {
    deleteIdentity(type: $type, did: $did)
  }
`

export const signCredentialJwt = gql`
  mutation signCredentialJwt($data: SignCredentialInput!, $save: Boolean) {
    signCredentialJwt(data: $data, save: $save) {
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
export const sendMessageDidCommAlpha1 = gql`
  mutation sendMessageDidCommAlpha1($data: SendMessageDidCommAlpha1Input!, $url: String) {
    sendMessageDidCommAlpha1(data: $data, url: $url, save: true) {
      id
    }
  }
`
