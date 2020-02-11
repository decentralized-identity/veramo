# DAF REST API example

## Install

```
npm i
npm start
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
	"type": "rinkeby-ethr-did-fs"
}'
```

### List identities

```
curl --location --request GET 'http://localhost:8080/identities'
```

### Sing VC

```
curl --location --request POST 'http://localhost:8080/handle-action' \
--header 'Content-Type: application/json' \
--data-raw '{
  "type": "action.sign.w3c.vc",
  "did": "did:ethr:rinkeby:0x7dd28328c8b05a852839284c304b4bd4b628e357",
  "data": {
    "sub": "did:web:uport.me",
    "vc": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "credentialSubject": {
        "you": "Rock"
      }
    }
  }
}'
```
