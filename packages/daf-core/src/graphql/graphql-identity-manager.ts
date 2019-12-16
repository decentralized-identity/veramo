import { Core } from '../core'
import { Issuer } from '../identity/identity-manager'

export interface Context {
  core: Core
}

const managedIdentityTypes = async (_: any, args: any, ctx: Context) => {
  return await ctx.core.identityManager.listTypes()
}

const managedIdentities = async (_: any, args: any, ctx: Context) => {
  const list = await ctx.core.identityManager.listIssuers()
  return list.map((issuer: Issuer) => ({
    did: issuer.did,
    type: issuer.type,
    __typename: 'Identity',
  }))
}

const isManaged = async (identity: any, args: any, ctx: Context) => {
  const list = await ctx.core.identityManager.listDids()
  return list.indexOf(identity.did) > -1
}

const createIdentity = async (
  _: any,
  args: {
    type: string
  },
  ctx: Context,
) => {
  const did = await ctx.core.identityManager.create(args.type)
  return {
    did,
    __typename: 'Identity',
  }
}

const deleteIdentity = async (
  _: any,
  args: {
    type: string
    did: string
  },
  ctx: Context,
) => {
  return await ctx.core.identityManager.delete(args.type, args.did)
}

const importIdentity = async (
  _: any,
  args: {
    type: string
    secret: string
  },
  ctx: Context,
) => {
  const issuer = await ctx.core.identityManager.import(args.type, args.secret)
  return {
    did: issuer.did,
    type: issuer.type,
    __typename: 'Identity',
  }
}

// Seed or private key
const managedIdentitySecret = async (
  _: any,
  args: {
    type: string
    did: string
  },
  ctx: Context,
) => {
  return await ctx.core.identityManager.export(args.type, args.did)
}

// Actions

export const resolvers = {
  Identity: {
    isManaged,
  },
  Query: {
    managedIdentityTypes,
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
  extend type Query {
    managedIdentities: [Identity]
    managedIdentityTypes: [String]
    managedIdentitySecret(type: String, did: String): String
  }

  extend type Mutation {
    createIdentity(type: String): Identity!
    deleteIdentity(type: String, did: String): Boolean!
    importIdentity(type: String, secret: String): Identity!
  }

  extend type Identity {
    type: String
    isManaged: Boolean!
  }
  
`
