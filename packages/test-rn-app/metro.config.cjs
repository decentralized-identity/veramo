// Metro config for the RN harness
const fs = require('fs')
const path = require('path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const repoRoot = path.resolve(__dirname, '../..')
const ownSources = [path.join(__dirname, 'harness'), path.join(__dirname, 'tests')]
const vitest = path.join(__dirname, 'harness/vitest.ts')

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  // @veramo/* are workspace symlinks into packages/*/build (outside this dir).
  watchFolders: [repoRoot],
  resolver: {
    // The RN babel preset injects `@babel/runtime/helpers/*` imports into files
    // under packages/*/build, which (pnpm, not hoisted) can't see this app's
    // @babel/runtime. Metro's documented fallback lookup path fixes that.
    nodeModulesPaths: [path.join(__dirname, 'node_modules')],
    resolveRequest: (context, moduleName, platform) => {
      if (!ownSources.some((dir) => context.originModulePath.startsWith(dir))) {
        return context.resolveRequest(context, moduleName, platform)
      }
      // tests/ import `vitest`, which in the bundle is the harness's stand-in
      if (moduleName === 'vitest') return { type: 'sourceFile', filePath: vitest }
      // `./x.js` imports of .ts siblings, like the rest of the repo; Metro, unlike tsc and Vite, does not map them
      const ts = path.resolve(path.dirname(context.originModulePath), moduleName.replace(/\.js$/, '.ts'))
      return moduleName.startsWith('.') && moduleName.endsWith('.js') && fs.existsSync(ts)
        ? { type: 'sourceFile', filePath: ts }
        : context.resolveRequest(context, moduleName, platform)
    },
  },
})
