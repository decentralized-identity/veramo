import { Core } from '../core'
import { AbstractIdentity } from '../identity/abstract-identity'

export interface Context {
  core: Core
}

const identityProviders = async (_: any, args: any, ctx: Context) => {
  return await ctx.core.identityManager.getIdentityProviderTypes()
}

const managedIdentities = async (_: any, args: any, ctx: Context) => {
  const list = await ctx.core.identityManager.getIdentities()
  return list.map((identity: AbstractIdentity) => ({
    did: identity.did,
    type: identity.identityProviderType,
    __typename: 'Identity',
  }))
}

const isManaged = async (identity: any, args: any, ctx: Context) => {
  const list = await ctx.core.identityManager.getIdentities()
  return list.map(item => item.did).indexOf(identity.did) > -1
}

const createIdentity = async (
  _: any,
  args: {
    type: string
  },
  ctx: Context,
) => {
  const identity = await ctx.core.identityManager.createIdentity(args.type)
  return {
    did: identity.did,
    type: identity.identityProviderType,
    __typename: 'Identity',
  }
}

const deleteIdentity = async (
  _: any,
  args: {
    did: string
  },
  ctx: Context,
) => {
  return await ctx.core.identityManager.deleteIdentity(args.did)
}

const importIdentity = async (
  _: any,
  args: {
    type: string
    secret: string
  },
  ctx: Context,
) => {
  const identity = await ctx.core.identityManager.importIdentity(args.type, args.secret)
  return {
    did: identity.did,
    type: identity.identityProviderType,
    __typename: 'Identity',
  }
}

// Seed or private key
const managedIdentitySecret = async (
  _: any,
  args: {
    did: string
  },
  ctx: Context,
) => {
  return await ctx.core.identityManager.exportIdentity(args.did)
}

// Actions

export const resolvers = {
  Identity: {
    isManaged,
  },
  Query: {
    identityProviders,
    managedIdentities,
    managedIdentitySecret,
  },
  Mutation: {
    createIdentity,
    deleteIdentity,
    importIdentity,
  },
}

export const typeDefs = `
  type IdentityProvider {
    type: String!
    description: String
  }
  extend type Query {
    identityProviders: [IdentityProvider]
    managedIdentities: [Identity]
    managedIdentitySecret(did: String): String
  }

  extend type Mutation {
    createIdentity(type: String): Identity!
    deleteIdentity(did: String): Boolean!
    importIdentity(type: String, secret: String): Identity!
  }

  extend type Identity {
    type: String
    isManaged: Boolean!
  }
  
`
