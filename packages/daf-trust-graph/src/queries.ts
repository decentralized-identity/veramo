import gql from 'graphql-tag'

export const addEdge = gql`
  mutation addEdge($edgeJWT: String!) {
    addEdge(edgeJWT: $edgeJWT) {
      hash
      type
      tag
      data
    }
  }
`

export const findEdges = gql`
  query findEdges($toDID: [String], $since: Int) {
    findEdges(toDID: $toDID, since: $since) {
      hash
      time
      type
      from {
        did
      }
      to {
        did
      }
      visibility
      tag
      retention
      data
      jwt
    }
  }
`

export const edgeByHash = gql`
  query edgeByHash($hash: ID!) {
    edgeByHash(hash: $hash) {
      hash
      time
      type
      from {
        did
      }
      to {
        did
      }
      visibility
      tag
      retention
      data
      jwt
    }
  }
`

export const edgeAdded = gql`
  subscription edgeAdded($toDID: [String]) {
    edgeAdded(toDID: $toDID) {
      hash
      time
      type
      from {
        did
      }
      to {
        did
      }
      visibility
      tag
      retention
      data
      jwt
    }
  }
`
