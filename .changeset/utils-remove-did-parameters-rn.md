---
'@veramo/utils': patch
---

`removeDIDParameters` no longer relies on the global `URL`. React Native's built-in `URL` does not implement WHATWG parsing, so every DID collapsed to `/` there and issuing credentials or presentations failed with `not_found: IIdentifier`.
