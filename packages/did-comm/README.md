# Veramo DIDComm

Veramo messaging plugin implementing DIDComm v2, as specified by the [DIDComm v2 Spec](https://identity.foundation/didcomm-messaging/spec/) as well as certain "DIDComm Protocols"

## Spec Compliance

### [Message Formats](https://identity.foundation/didcomm-messaging/spec/#message-formats)

Message Envelopes:

| Envelope | Veramo 'packing' | IANA type (`typ`) | packDIDCommMessage | unpackDIDCommMessage | notes |
| -------- | ---------------- | ----------------- | ------------------ | -------------------- | -------------------- |
| plaintext | 'none' | `application/didcomm-plain+json` | [X] | [X] | |
| signed(plaintext) | 'jws' | `application/didcomm-signed+json` | [X] | [X] | |
| anoncrypt(plaintext) | 'anoncrypt' | `application/didcomm-encrypted+json` | [X] | [X] | |
| authcrypt(plaintext) | 'authcrypt' | `application/didcomm-encrypted+json` | [X] | [X] | |
| anoncrypt(sign(plaintext)) | 'anoncrypt+jws' | `application/didcomm-encrypted+json` | [ ] | [ ] | |
| authcrypt(sign(plaintext)) | 'authcrypt+jws' | `application/didcomm-encrypted+json` | [ ] | [ ] | SHOULD NOT be emitted, but MAY be accepted |
| anoncryptauthcrypt((sign(plaintext))) | '' | `application/didcomm-encrypted+json` | [ ] | [ ] | |

