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
  query findEdges($toDID: [String], $fromDID: [String], $since: Int) {
    findEdges(toDID: $toDID, fromDID: $fromDID, since: $since) {
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
export default {
  addEdge,
  edgeAdded,
  findEdges,
  edgeByHash,
}
