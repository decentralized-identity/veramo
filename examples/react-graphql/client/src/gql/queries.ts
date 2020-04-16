import { gql } from 'apollo-boost'

export const credential = gql`
  query credential($id: ID!) {
    credential(id: $id) {
      hash
      rowId
      iss {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
      sub {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
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
  query identity($did: String!) {
    identity(did: $did) {
      did
      provider
      shortId: shortDid
      profileImage: latestClaimValue(type: "profileImage")
    }
  }
`

export const allIdentities = gql`
  query allIdentities {
    identities {
      isManaged
      did
      shortId: shortDid
      firstName
      lastName
      profileImage: latestClaimValue(type: "profileImage")
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
      type
      shortId: shortDid
      profileImage: latestClaimValue(type: "profileImage")
    }
  }
`

export const queryMessage = gql`
  query message($id: ID!, $defaultDid: String!) {
    message(id: $id) {
      id
      threadId
      type
      timestamp
      sdr(sub: $defaultDid) {
        iss {
          did {
            did
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
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
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
          }
          sub {
            did
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
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
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
      receiver {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
    }
  }
`

export const allMessages = gql`
  query allMessages($activeDid: String!) {
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
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
        sdr(sub: $activeDid) {
          iss {
            did {
              did
              shortId: shortDid
              profileImage: latestClaimValue(type: "profileImage")
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
              shortId: shortDid
              profileImage: latestClaimValue(type: "profileImage")
            }
            sub {
              did
              shortId: shortDid
              profileImage: latestClaimValue(type: "profileImage")
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
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
        vc {
          rowId
          hash
          iss {
            did
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
          }
          sub {
            did
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
          }
          fields {
            type
            value
            isObj
          }
        }
        metaData {
          type
          value
          id
        }
      }
    }
  }
`
