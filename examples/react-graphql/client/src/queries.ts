import { gql } from 'apollo-boost'

export const credential = gql`
  query credential($id: ID!) {
    credential(id: $id) {
      hash
      rowId
      iss {
        did
        shortId
      }
      sub {
        did
        shortId
      }
      jwt
      nbf
      iat
      fields {
        isObj
        type
        value
      }
    }
  }
`

export const identity = gql`
  query identity($did: ID!) {
    identity(did: $did) {
      did
      provider
      shortId
    }
  }
`

export const managedIdentities = gql`
  query managedIdentities {
    identityProviders {
      type
      description
    }
    managedIdentities {
      did
      provider
      shortId
      profileImage
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

export const allMessages = gql`
  query allMessages($activeDid: ID!) {
    identity(did: $activeDid) {
      did
      messagesAll {
        id
        raw
        data
        threadId
        type
        timestamp
        sender {
          did
          shortId
          profileImage
        }
        receiver {
          did
          shortId
          profileImage
        }
        vc {
          rowId
          hash
          iss {
            did
            shortId
            profileImage
          }
          sub {
            did
            shortId
            profileImage
          }
          fields {
            type
            value
            isObj
          }
        }
        metaData {
          type
          id
          value
        }
      }
    }
  }
`
