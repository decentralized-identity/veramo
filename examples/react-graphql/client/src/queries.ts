import { gql } from 'apollo-boost'

export const managedIdentitiesQuery = gql`
  query managedIdentities {
    managedIdentityTypes
    managedIdentities {
      did
      type
    }
  }
`

export const createIdentityMutation = gql`
  mutation createIdentity($type: String) {
    createIdentity(type: $type) {
      did
    }
  }
`

export const actionSignVcMutation = gql`
  mutation actionSignVc($did: String!, $data: VerifiableCredentialInput!) {
    actionSignVc(did: $did, data: $data)
  }
`
export const actionSendJwtMutation = gql`
  mutation actionSendJwt($from: String!, $to: String!, $jwt: String!) {
    actionSendJwt(from: $from, to: $to, jwt: $jwt)
  }
`

export const serviceMessagesSince = gql`
  query m($ts: [LastMessageTimestampForInstance]!) {
    serviceMessagesSince(ts: $ts) {
      id
      type
      timestamp
      data
      raw
      sender
      receiver
      metaData {
        type
        id
      }
    }
  }
`
