import { IAgentGraphQLMethod } from '../types'
import identityManager from './identity-manager'
import resolver from './resolver'

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  ...identityManager,
  ...resolver,
}
