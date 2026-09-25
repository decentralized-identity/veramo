// HOOP import-meta (runtime half): the registry the build half rewrites
// `import.meta` to. Expo installs it from expo/src/winter/runtime.native.ts with
// `url` = the bundle's script URL (NativeSourceCode.scriptURL). The host has no
// SourceCode native module, so `url` is the dev-server URL an RN app would load
// from. The only consumer measured is @digitalbazaar/credentials-context@3,
// which calls `new URL('../contexts/*.jsonld', import.meta.url)` for metadata.
if (globalThis.__ExpoImportMetaRegistry === undefined) {
  globalThis.__ExpoImportMetaRegistry = { url: 'http://localhost:8081/index.bundle?platform=ios' }
}
