---
'@veramo/did-resolver': patch
'@veramo/did-comm': patch
'@veramo/did-provider-ion': patch
'@veramo/cli': patch
---

The `cross-fetch` dependency has been removed. All target runtimes ship a global `fetch` (browsers, Node >= 18, React Native). `@veramo/did-resolver`'s universal resolver, `@veramo/did-comm`'s HTTP transport and `@veramo/did-provider-ion`'s resolver now use the global `fetch` (like the rest of Veramo).
