# Message validator

The main responsibility of Message Validator chain is to take any raw message as an input and return a standard `Daf.Message` object, or `null` if message type is unsupported.

## Data flow explanation

In this example we will take a look how this chain of validators works:

![validator-chain](assets/msg-validator-chain.png)

```ts
import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as URL from 'daf-url'
import { DafUniversalResolver } from 'daf-resolver-universal'
import Debug from 'debug'

Debug.enable('*')

const messageValidator = new URL.MessageValidator()
messageValidator
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const core = new Daf.Core({
  messageValidator,
  identityControllers: [],
  serviceControllers: [],
  didResolver: new DafUniversalResolver({ url: 'https://uniresolver.io/1.0/identifiers/' }),
})

// After scanning QR Code:
const qrcodeData =
  'https://example.com/ssi?c_i=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU2MzIyNDQsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzLTEyMyIsImNsYWltcyI6W3siZXNzZW50aWFsIjp0cnVlLCJjbGFpbVR5cGUiOiJuYW1lIiwicmVhc29uIjoiV2UgbmVlZCB0aGlzIHRvIGNvbXBseSB3aXRoIGxvY2FsIGxhdyJ9XSwiaXNzIjoiZGlkOmV0aHI6MHg2YjFkMGRiMzY3NjUwZjIxYmFlNDg1MDM0N2M3YTA0N2YwNGRlNDM2In0.lhv_sGFQX0258CJF50J9cRdF7mmzo9Jx137oWTu0VF3A1CkEI88dDYA5Usj0HKH_2tHKA5b-S1_Akb-mDz9v9QE'

const msg = new Daf.Message({ raw: qrcodeData, meta: { type: 'QRCode' } })

core.validateMessage(msg).then(message => {
  console.log(message.id) // 4a2e23d287ad2eb6d24b0ac1618998426449201dbfc476eee01702e1d11ff8d0cdba29a3d4a9f815ef6658f6264e9db3b868be359acdb945ea70b369f8743dbb
  console.log(message.timestamp) // 1575632244
  console.log(message.threadId) // sess-123
  console.log(message.sender) // did:ethr:0x6b1d0db367650f21bae4850347c7a047f04de436
  console.log(message.receiver) // undefined
  console.log(message.type) // sdr
  console.log(message.data) // "{ iss: 'did:ethr:0x6b1d0db367650f21bae4850347c7a047f04de436', tag: 'sess-123, claims: [{claimType: 'name', ...}] ..."
  console.log(message.allMeta) // [ { type: 'QRCode' }, { type: 'URL', id: 'https://example.com/ssi' }, { type: 'JWT', id: 'ES256K-R' }]
})
```

### DBG.MessageValidator

Outputs debug info. And passes through the same message object to the next validator

### URL.MessageValidator

- Detects that message raw format is a URL
- Finds JWT
- Replaces raw contents with JWT, and adds meta

```ts
// jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU2MzIyNDQsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzLTEyMyIsImNsYWltcyI6W3siZXNzZW50aWFsIjp0cnVlLCJjbGFpbVR5cGUiOiJuYW1lIiwicmVhc29uIjoiV2UgbmVlZCB0aGlzIHRvIGNvbXBseSB3aXRoIGxvY2FsIGxhdyJ9XSwiaXNzIjoiZGlkOmV0aHI6MHg2YjFkMGRiMzY3NjUwZjIxYmFlNDg1MDM0N2M3YTA0N2YwNGRlNDM2In0.lhv_sGFQX0258CJF50J9cRdF7mmzo9Jx137oWTu0VF3A1CkEI88dDYA5Usj0HKH_2tHKA5b-S1_Akb-mDz9v9QE'

msg.transform({
  raw: jwt,
  meta: { type: 'URL', id: 'https://example.com/ssi' },
})
```

- Passes message object to the next validator

### DidJwt.MessageValidator

- Detects that message raw format is JWT
- Validates signature
- Replaces message raw contents with decoded JWT payload

```ts
/*
validated.payload = {
  "iat": 1575632244,
  "type": "sdr",
  "tag": "sess-123",
  "claims": [
    {
      "essential": true,
      "claimType": "name",
      "reason": "We need this to comply with local law"
    }
  ],
  "iss": "did:ethr:0x6b1d0db367650f21bae4850347c7a047f04de436"
}
*/

msg.transform({
  raw: jwt,
  data: validated.payload,
  meta: { type: validated.header.typ, id: validated.header.alg },
})
```

- Passes message object to the next validator

### W3c.MessageValidator

- Fails to detect VP or VC
- Passes through unchanged message object to the next validator

### Sd.MessageValidator

- Detects that message is a valid did-jwt with a type of 'sdr'
- Sets required fields and returns validate message

```ts
msg.type = 'sdr'
msg.sender = msg.data.iss
msg.receiver = msg.data.sub
msg.threadId = msg.data.tag
msg.timestamp = msg.data.nbf || msg.data.iat
return msg
```
