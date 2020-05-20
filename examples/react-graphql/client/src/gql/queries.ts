import { gql } from 'apollo-boost'

export const credential = gql`
  query credential($id: ID!) {
    credential(hash: $id) {
      hash
      issuanceDate
      expirationDate
      claims {
        type
        value
        isObj
      }
      issuer {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
      subject {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
    }
  }
`

export const credentials = gql`
  query credentials($id: String!) {
    credentials(input: { where: [{ column: subject, value: [$id] }] }) {
      hash
      subject {
        did
        shortId: shortDid
      }
      issuer {
        did
        shortId: shortDid
      }
      issuanceDate
      type
      claims {
        hash
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
      provider
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
      createdAt
      sdr(did: $defaultDid) {
        reason
        claimType
        claimValue
        essential
        credentials {
          issuer {
            did
            shortId: shortDid
            profileImage: latestClaimValue(type: "profileImage")
          }
          claims {
            type
            value
          }
          raw
        }
      }
      from {
        did
        shortId: shortDid
        profileImage: latestClaimValue(type: "profileImage")
      }
      to {
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
      profileImage: latestClaimValue(type: "profileImage")
      name: latestClaimValue(type: "name")
    }
    receivedMessages: messages(input: { where: [{ column: to, value: [$activeDid] }] }) {
      id
      type
      createdAt
      credentials {
        hash
        claims {
          type
          value
          isObj
        }
        issuer {
          did
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
        subject {
          did
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
      }
      from {
        did
        profileImage: latestClaimValue(type: "profileImage")
        name: latestClaimValue(type: "name")
      }
      to {
        did
        profileImage: latestClaimValue(type: "profileImage")
        name: latestClaimValue(type: "name")
      }
    }
    sentMessages: messages(input: { where: [{ column: from, value: [$activeDid] }] }) {
      id
      type
      createdAt
      credentials {
        hash
        claims {
          type
          value
          isObj
        }
        issuer {
          did
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
        subject {
          did
          shortId: shortDid
          profileImage: latestClaimValue(type: "profileImage")
        }
      }
      from {
        did
        profileImage: latestClaimValue(type: "profileImage")
        name: latestClaimValue(type: "name")
      }
      to {
        did
        profileImage: latestClaimValue(type: "profileImage")
        name: latestClaimValue(type: "name")
      }
    }
  }
`
