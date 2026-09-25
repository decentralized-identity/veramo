// HOOP subtle-digest: emulation of `crypto.subtle.digest` as installed by
// react-native-quick-crypto (the native WebCrypto for RN; its `install()` puts
// `crypto` on the global). Every JSON-LD stack measured needs it: the processor
// (rdf-canonize MessageDigest-browser / -webcrypto), jsonld-signatures'
// sha256digest-browser and @noble/ed25519@1's async sha512 all call
// `crypto.subtle.digest`. The package is a native module, so the JSI host plays
// the native side: ONLY with --hoop=subtle-digest it exposes
// `RNSubtleDigest.digest(name, ArrayBuffer)` (CommonCrypto). Nothing but
// `subtle.digest` is emulated; the rest of SubtleCrypto stays absent.
function normalize(algorithm) {
  const name = typeof algorithm === 'string' ? algorithm : algorithm && algorithm.name
  const upper = String(name).toUpperCase()
  if (!['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(upper)) {
    throw new Error('Unrecognized algorithm name: ' + name)
  }
  return upper
}

function toArrayBuffer(data) {
  if (data instanceof ArrayBuffer) return data
  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  }
  throw new TypeError('data must be an ArrayBuffer or ArrayBufferView')
}

async function digest(algorithm, data) {
  const native = global.RNSubtleDigest
  if (native == null) throw new Error("'QuickCrypto' native module could not be found")
  return native.digest(normalize(algorithm), toArrayBuffer(data))
}

if (typeof global.crypto !== 'object') global.crypto = {}
if (typeof global.crypto.subtle !== 'object') global.crypto.subtle = {}
if (typeof global.crypto.subtle.digest !== 'function') global.crypto.subtle.digest = digest
