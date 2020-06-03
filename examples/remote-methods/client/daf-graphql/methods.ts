export const resolve = `
  query resolve($did: String!) {
    result: resolve(did: $did) 
  }
`

export const getIdentityProviders = `
  {
    result: getIdentityProviders {
      type
      description
    } 
  }
`

export const getIdentities = `
  {
    result: getIdentities {
      did
      provider
    } 
  }
`
export const getIdentity = `
  query getIdentity($did: String!) {
    result: getIdentity(did: $did) {
      did
      provider
    }
  }
`

export const createIdentity = `
  mutation createIdentity($type: String) {
    result: createIdentity(type: $type) {
      did
    }
  }
`

export const deleteIdentity = `
  mutation deleteIdentity($did: String!) {
    result: deleteIdentity(did: $did) 
  }
`
