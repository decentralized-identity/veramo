import { gql } from 'apollo-boost'

export const managedIdentities = gql`
  query managedIdentities {
    managedIdentityTypes
    managedIdentities {
      did
      type
      shortId
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
