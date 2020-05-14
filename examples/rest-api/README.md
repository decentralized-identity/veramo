# DAF REST API example

## Install

```
yarn
npx lerna run build
yarn start
```

## Sample queries

### List identity providers

```
curl --location --request GET 'http://localhost:8080/providers'
```

### Create identity

```
curl --location --request POST 'http://localhost:8080/create-identity' \
--header 'Content-Type: application/json' \
--data-raw '{
	"type": "rinkeby-ethr-did"
}'
```

### List identities

```
curl --location --request GET 'http://localhost:8080/identities'
```

### Sign VC

```
curl --location --request POST 'http://localhost:8080/handle-action' \
--header 'Content-Type: application/json' \
--data-raw '{
  "type": "sign.w3c.vc.jwt",
  "data": {
    "issuer": "<replace this with the created DID: did:ethr:rinkeby:0xabc...>",
    "vc": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "credentialSubject": {
        "id": "did:web:uport.me",
        "you": "Rock"
      }
    }
  }
}'
```

### Handle new message

```
curl --location --request POST 'http://localhost:8080/handle-message' \
--header 'Content-Type: application/javascript' \
--data-raw 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODE0MzM2NDEsInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHg3ZGQyODMyOGM4YjA1YTg1MjgzOTI4NGMzMDRiNGJkNGI2MjhlMzU3In0.xJ6LY91PPIhFojWAfmBaSAqBNIDPShJRvH2ZyZlenCEHATclUD_f2vHFSQrFXGSP88JfdNQWzK6PqXgGWoqECgE'
```
