// HOOP get-random-values: emulation of react-native-get-random-values@2.0.0
// (index.js), which every RN app installs for crypto.getRandomValues. That
// package is a native module (TurboModule 'RNGetRandomValues' returning base64
// from the OS CSPRNG), so the JSI host plays the native side: ONLY when run with
// --hoop=get-random-values it exposes `RNGetRandomValues.getRandomBase64(n)`
// (arc4random_buf). The JS below is the package's logic minus the Expo and
// Chrome-debugger branches, which do not apply. Nothing else is put on `crypto`.
// Why emulated, and the drift risk: see ../../README.md.
const base64Decode = require('fast-base64-decode')

class TypeMismatchError extends Error {}
class QuotaExceededError extends Error {}

let nativeModule = null
function getRandomBase64(byteLength) {
  if (nativeModule == null) {
    // stands in for TurboModuleRegistry.getEnforcing('RNGetRandomValues')
    nativeModule = global.RNGetRandomValues
    if (nativeModule == null) {
      throw new Error("TurboModuleRegistry.getEnforcing(...): 'RNGetRandomValues' could not be found")
    }
  }
  return nativeModule.getRandomBase64(byteLength)
}

function getRandomValues(array) {
  if (!(
    array instanceof Int8Array ||
    array instanceof Uint8Array ||
    array instanceof Int16Array ||
    array instanceof Uint16Array ||
    array instanceof Int32Array ||
    array instanceof Uint32Array ||
    array instanceof Uint8ClampedArray
  )) {
    throw new TypeMismatchError('Expected an integer array')
  }
  if (array.byteLength > 65536) {
    throw new QuotaExceededError('Can only request a maximum of 65536 bytes')
  }
  base64Decode(
    getRandomBase64(array.byteLength),
    new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
  )
  return array
}

if (typeof global.crypto !== 'object') {
  global.crypto = {}
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = getRandomValues
}
