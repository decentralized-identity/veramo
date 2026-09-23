---
"@veramo/did-comm": patch
---

fix(did-comm): emit DIDComm v2 `created_time`/`expires_time` as integer epoch seconds

DIDComm v2 requires `created_time`/`expires_time` as UTC epoch seconds (an integer).
Veramo emitted `new Date().toISOString()`, which `didcomm-rust` (which models the
header as `Option<u64>`) rejected, failing to deserialize otherwise-valid messages.

Producers now emit `Math.floor(Date.now() / 1000)`, and `IDIDCommMessage` accepts
`number | string` for a transition period. Values are normalized back to an ISO-8601
string at the internal message boundary so the internal pipeline and datastore are
unaffected, while legacy ISO-string messages continue to round-trip.

fixes #1499