// HOOP import-meta: the RN template's Babel transformer plus the one plugin in
// ./import-meta.babel-plugin.cjs. Used only by metro.import-meta.config.cjs,
// whose own cacheVersion keeps its transforms apart in Metro's cache.
const path = require('path')
const { getDefaultConfig } = require('@react-native/metro-config')

const base = require(getDefaultConfig(path.resolve(__dirname, '../..')).transformer.babelTransformerPath)
const plugin = require('./import-meta.babel-plugin.cjs')

module.exports = {
  ...base,
  transform: (args) => base.transform({ ...args, plugins: [...(args.plugins ?? []), plugin] }),
}
