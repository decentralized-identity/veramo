// The published `canonicalize` package ships a `module.exports = function`
// (CommonJS) but its bundled .d.ts declares `export default function`.
// Under `moduleResolution: nodenext` a default import of a CommonJS module
// resolves to the module namespace object (not callable), producing TS2349.
// This ambient declaration restores the callable typing. Runtime is unaffected:
// Node maps the CJS default export to the ESM default import correctly.
declare module 'canonicalize' {
  const canonicalize: (input: unknown) => string | undefined
  export default canonicalize
}
