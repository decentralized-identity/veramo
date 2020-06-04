interface IAgentRESTMethod {
  type: 'GET' | 'POST'
  path: string
}

export const supportedMethods: Record<string, IAgentRESTMethod> = {
  resolve: { type: 'POST', path: '/resolve' },
  getIdentityProviders: { type: 'POST', path: '/identifiers/providers' },
  getIdentities: { type: 'POST', path: '/identifiers/list' },
  getIdentity: { type: 'POST', path: '/identifiers/get' },
  createIdentity: { type: 'POST', path: '/identifiers/create' },
  deleteIdentity: { type: 'POST', path: '/identifiers/delete' },
}
