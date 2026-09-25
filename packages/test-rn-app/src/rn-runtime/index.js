// RN RUNTIME (not a consumer hoop): the JS-side globals every RN 0.87 app gets
// from InitializeCore -> setUpDefaultReactNativeEnvironment, installed here with
// RN's OWN modules because the JSI host does not run InitializeCore:
//   setUpGlobals.js : window, self, process.env.NODE_ENV
//   setUpXHR.js     : lazy getters (polyfillGlobal) for URL, URLSearchParams,
//                     fetch, XMLHttpRequest, Blob, AbortController, ...
// The setUpXHR getters load their module only on first access; the ones backed
// by native modules (fetch/XHR -> Networking, Blob -> BlobModule) throw when
// accessed, because the host registers no native modules. That is a possible
// false red, never a false green. Must be imported first, before any hoop.
require('react-native/Libraries/Core/setUpGlobals')
require('react-native/Libraries/Core/setUpXHR')
