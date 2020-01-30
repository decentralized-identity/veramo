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
      type
      shortId
    }
  }
`

export const managedIdentities = gql`
  query managedIdentities {
    managedIdentityTypes
    managedIdentities {
      did
      type
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

export const actionSignVc = gql`
  mutation actionSignVc($did: String!, $data: VerifiableCredentialInput!) {
    actionSignVc(did: $did, data: $data)
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
          data
        }
      }
    }
  }
`
