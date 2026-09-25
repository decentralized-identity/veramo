// DIAGNOSTIC ONLY, not a hoop and not a consumer option we
// recommend: metro.config.cjs with package `exports` resolution switched off,
// a resolver trick. The `ld-dcc-no-exports` mode uses it to get past the DCC
// stack's first failure (its ESM wrapper) and record the NEXT one, so that the
// finding about the DCC processor path is reproducible. See README.md.
const base = require('./metro.config.cjs')

module.exports = {
  ...base,
  resolver: { ...base.resolver, unstable_enablePackageExports: false },
}
