/**
 * @public
 */
 import { createRequire } from "module";
 const require = createRequire(import.meta.url);
 const schema = require("../plugin.schema.json");
export { schema }
export { CredentialIssuerEIP712 } from './agent/CredentialEIP712.js'
export * from './types/ICredentialEIP712.js'
