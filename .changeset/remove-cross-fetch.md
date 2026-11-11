---
'@veramo/did-resolver': patch
'@veramo/did-comm': patch
'@veramo/cli': patch
---

The `cross-fetch` dependency has been removed. All target runtimes ship a global `fetch` (browsers, Node >= 18, React Native). `@veramo/did-resolver`'s universal resolver and `@veramo/did-comm`'s HTTP transport now use the global `fetch` (like the rest of Veramo).