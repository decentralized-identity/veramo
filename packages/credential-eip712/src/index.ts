/**
 * @public
 */
const schema = require('../plugin.schema.json')
export { schema }
export { CredentialIssuerEIP712 } from './agent/CredentialEIP712'
export { getEthTypesFromInputDoc } from './utils/getEthTypesFromInputDoc'
export * from './types/ICredentialEIP712'
