// metro.config.cjs plus the import-meta hoop's Babel transformer.
// Used only by the `ld-upstream` mode; see README.md "Hoops".
const path = require('path')
const base = require('./metro.config.cjs')

module.exports = {
  ...base,
  // cacheVersion is part of every transform cache key: without it, files
  // transformed with and without the hoop would share Metro's cache entries.
  cacheVersion: 'rn-harness-import-meta',
  transformer: {
    ...base.transformer,
    babelTransformerPath: path.join(__dirname, 'src/hoops/import-meta.transformer.cjs'),
  },
}
