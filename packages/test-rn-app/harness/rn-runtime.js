// RN's JS setup: the globals every RN 0.87 app gets from InitializeCore -> setUpDefaultReactNativeEnvironment,
// installed with RN's OWN modules:
//   setUpGlobals.js : window, self, process.env.NODE_ENV
//   setUpDOM.js     : (only) Event, EventTarget, CustomEvent; the rest of it needs native modules
//   setUpPerformance.js : performance (its Date.now() fallback, without the native module)
//   setUpXHR.js     : lazy getters for URL, URLSearchParams, fetch, XMLHttpRequest, Blob, AbortController, ...
// The getters load their module only on first access; the ones backed by native modules (fetch/XHR -> Networking,
// Blob -> BlobModule) throw when accessed, because the runner registers no native modules. That is a possible false
// red, never a false green. Must be imported first.
const { polyfillGlobal } = require('react-native/Libraries/Utilities/PolyfillFunctions')

require('react-native/Libraries/Core/setUpGlobals')
polyfillGlobal('Event', () => require('react-native/src/private/webapis/dom/events/Event').default)
polyfillGlobal(
  'EventTarget',
  () => require('react-native/src/private/webapis/dom/events/EventTarget').default,
)
polyfillGlobal(
  'CustomEvent',
  () => require('react-native/src/private/webapis/dom/events/CustomEvent').default,
)
require('react-native/Libraries/Core/setUpPerformance')
require('react-native/Libraries/Core/setUpXHR')
