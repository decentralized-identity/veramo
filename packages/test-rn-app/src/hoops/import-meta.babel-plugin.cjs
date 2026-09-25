// HOOP import-meta (build half): Hermes cannot parse `import.meta` and Metro
// 0.87 has no transform for it (facebook/metro#1494 is an open RFC), so an RN
// app that bundles an ESM package using `import.meta` needs a Babel transform.
// Expo ships one, opt-in on native: babel-preset-expo's
// `unstable_transformImportMeta` (src/import-meta-transform-plugin.ts). This is
// that plugin's shape: `import.meta` -> `globalThis.__ExpoImportMetaRegistry`.
// The runtime half is ./import-meta.js.
module.exports = function importMetaPlugin({ types: t }) {
  return {
    name: 'rn-harness-import-meta',
    visitor: {
      MetaProperty(path) {
        const { node } = path
        if (node.meta.name === 'import' && node.property.name === 'meta') {
          path.replaceWith(
            t.memberExpression(t.identifier('globalThis'), t.identifier('__ExpoImportMetaRegistry')),
          )
        }
      },
    },
  }
}
