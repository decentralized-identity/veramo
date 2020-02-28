import { baseTypeDefs } from './graphql-base-type-defs'
import { resolvers as CoreResolvers, typeDefs as CoreTypeDefs } from './graphql-core'
import {
  resolvers as IdentityManagerResolvers,
  typeDefs as IdentityManagerTypeDefs,
} from './graphql-identity-manager'

const Gql = {
  baseTypeDefs,
  Core: {
    resolvers: CoreResolvers,
    typeDefs: CoreTypeDefs,
  },
  IdentityManager: {
    resolvers: IdentityManagerResolvers,
    typeDefs: IdentityManagerTypeDefs,
  },
}

export { Gql }
