import { IAgentGraphQLMethod } from '../types'
import identityManager from './identity-manager'
import resolver from './resolver'
import messageHandler from './message-handler'

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  ...identityManager,
  ...resolver,
  ...messageHandler,
}
