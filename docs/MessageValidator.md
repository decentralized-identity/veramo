# Message validator

The main responsibility of Message Validator is to take any raw message as an input and output a standard `ValidatedMessage` object, or `null` if message type is unsupported.

## Data flow explanation

In this example we will take a look how this chain of validators works:

```ts
const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new Sd.MessageValidator())

const core = new Daf.core({
  // ...,
  messageValidator,
  // ...
})

// After scanning QR Code:
// qrcodeData = 'https://example.com/ssi?c_i=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU2MzIyNDQsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzLTEyMyIsImNsYWltcyI6W3siZXNzZW50aWFsIjp0cnVlLCJjbGFpbVR5cGUiOiJuYW1lIiwicmVhc29uIjoiV2UgbmVlZCB0aGlzIHRvIGNvbXBseSB3aXRoIGxvY2FsIGxhdyJ9XSwiaXNzIjoiZGlkOmV0aHI6MHg2YjFkMGRiMzY3NjUwZjIxYmFlNDg1MDM0N2M3YTA0N2YwNGRlNDM2In0.lhv_sGFQX0258CJF50J9cRdF7mmzo9Jx137oWTu0VF3A1CkEI88dDYA5Usj0HKH_2tHKA5b-S1_Akb-mDz9v9QE'

const msg = new Daf.Message({ raw: qrcodeData, meta: { type: 'QRCode' })

const message = await core.validateMessage(msg)

if (message.isValid()) {
  message.id() // hash...
  message.sender() // did:ethr:0x6b1d0db367650f21bae4850347c7a047f04de436
  message.receiver() // null
  message.type() // sdr
  message.data() // "{ iss: 'did:ethr:0x6b1d0db367650f21bae4850347c7a047f04de436', tag: 'sess-123, claims: [{claimType: 'name', ...}] ..."
  message.meta()
  /*
  [
    { type: 'QRCode' },
    { type: 'URL', id: 'https://example.com/ssi' },
    { type: 'JWT', id: 'ES256K-R' },
  ]
  */
}

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
