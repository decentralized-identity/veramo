# Data Flow Diagrams

## New message from QR Code

![QRCode](assets/new-message-from-qr-code.png)

1. Raw Message
2. Raw Message
3. Message
4. Message
5. Message
6. Message

## New message from external service

![ExternalService](assets/new-message-from-external-service.png)

1. Encrypted raw message
2. Raw Message
3. Raw Message
4. Getting encryption key. Decrypting
5. Message
6. Message
7. Message
8. Message

## Signing Verifiable Presentation

![SigningVP](assets/signing-verifiable-presentation.png)

1. Getting VerifiableCredentials in JWT format
2. Action `action.sign.w3c.vp` + data
3. Action `action.sign.w3c.vp` + data
4. Getting signing key. Signing
5. Verifiable Presentation in JWT format
6. Verifiable Presentation in JWT format

## Sending Verifiable Presentation

![SendingVP](assets/sending-verifiable-presentation.png)

1. Action `action.sendJwt` + Verifiable Presentation in JWT format
2. Action `action.sendJwt` + Verifiable Presentation in JWT format
3. Resolving recipient DID Document
4. Encrypting message if encryption key is published in DID Document. POSTing message to `Messaging` service endpoint
5. Raw message
6. Raw message
7. Message
8. Message
9. Message
10. Message
