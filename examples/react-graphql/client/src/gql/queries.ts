import { gql } from 'apollo-boost'

export const credential = gql`
  query credential($id: ID!) {
    credential(id: $id) {
      hash
      rowId
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
      profileImage
    }
  }
`

export const allIdentities = gql`
  query allIdentities {
    identities {
      isManaged
      did
      shortId
      firstName
      lastName
      profileImage
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

export const queryMessage = gql`
  query message($id: ID!, $defaultDid: ID!) {
    message(id: $id) {
      id
      threadId
      type
      timestamp
      sdr(sub: $defaultDid) {
        iss {
          did {
            did
            shortId
            profileImage
          }
          url
        }
        claimType
        reason
        essential
        vc {
          hash
          rowId
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
          jwt
          fields {
            type
            value
            isObj
          }
        }
      }
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
        sdr(sub: $activeDid) {
          iss {
            did {
              did
              shortId
              profileImage
            }
            url
          }
          claimType
          reason
          essential
          vc {
            hash
            rowId
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
            jwt
            fields {
              type
              value
              isObj
            }
          }
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
