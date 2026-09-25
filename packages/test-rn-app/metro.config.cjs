// Metro config for the RN harness
const path = require('path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const repoRoot = path.resolve(__dirname, '../..')

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  // @veramo/* are workspace symlinks into packages/*/build (outside this dir).
  watchFolders: [repoRoot],
  resolver: {
    // The RN babel preset injects `@babel/runtime/helpers/*` imports into files
    // under packages/*/build, which (pnpm, not hoisted) can't see this app's
    // @babel/runtime. Metro's documented fallback lookup path fixes that.
    nodeModulesPaths: [path.join(__dirname, 'node_modules')],
  },
})
