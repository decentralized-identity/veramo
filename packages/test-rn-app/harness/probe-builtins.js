// Lists the engine's globals and the properties of the common built-ins, one per line, through RN's native
// `nativeLoggingHook`. Run it on real Hermes and in node:vm, and diff the two to update HERMES_ONLY / V8_ONLY in
// run.mjs. See README.md "Upgrading react-native".
var hostGlobals = [
  'nativeLoggingHook',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'queueMicrotask',
  'setImmediate',
  'clearImmediate',
  'RN$Bridgeless',
  'nativeModuleProxy',
  'RNGetRandomValues',
  'HermesInternal',
  'print',
  'hostGlobals',
  'owners',
  'out',
]
var owners = {
  Array: Array,
  'Array.prototype': Array.prototype,
  Object: Object,
  String: String,
  'String.prototype': String.prototype,
  Promise: Promise,
  Set: Set,
  'Set.prototype': Set.prototype,
  Map: Map,
  'Map.prototype': Map.prototype,
  RegExp: RegExp,
  'RegExp.prototype': RegExp.prototype,
  Error: Error,
  'Error.prototype': Error.prototype,
  Math: Math,
  JSON: JSON,
  Intl: Intl,
  Reflect: Reflect,
  Symbol: Symbol,
  Number: Number,
  Date: Date,
  'Date.prototype': Date.prototype,
  ArrayBuffer: ArrayBuffer,
  'ArrayBuffer.prototype': ArrayBuffer.prototype,
  Uint8Array: Uint8Array,
  'Uint8Array.prototype': Object.getPrototypeOf(Uint8Array.prototype),
  BigInt: BigInt,
  'Function.prototype': Function.prototype,
}
var out = Object.getOwnPropertyNames(globalThis).filter(function (name) {
  return hostGlobals.indexOf(name) < 0
})
Object.keys(owners).forEach(function (owner) {
  Object.getOwnPropertyNames(owners[owner]).forEach(function (name) {
    if (name !== 'caller' && name !== 'arguments') out.push(owner + '.' + name)
  })
})
nativeLoggingHook(out.sort().join('\n'), 1)
