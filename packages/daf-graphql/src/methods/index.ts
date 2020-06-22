import identityManager from './identity-manager'
import resolver from './resolver'

export const supportedMethods = {
  ...identityManager,
  ...resolver,
}
