export default {
  "components": {
    "schemas": {
      "ResolveDidArgs": {
        "type": "object",
        "properties": {
          "didUrl": {
            "type": "string",
            "description": "DID URL"
          }
        },
        "required": [
          "didUrl"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IResolver.resolveDid | resolveDid}"
      },
      "DIDDocument": {
        "type": "object",
        "properties": {
          "@context": {
            "type": "string",
            "const": "https://w3id.org/did/v1"
          },
          "id": {
            "type": "string"
          },
          "publicKey": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PublicKey"
            }
          },
          "authentication": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Authentication"
            }
          },
          "uportProfile": {},
          "service": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ServiceEndpoint"
            }
          },
          "created": {
            "type": "string"
          },
          "updated": {
            "type": "string"
          },
          "proof": {
            "$ref": "#/components/schemas/LinkedDataProof"
          },
          "keyAgreement": {
            "type": "array",
            "items": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "$ref": "#/components/schemas/PublicKey"
                }
              ]
            }
          }
        },
        "required": [
          "@context",
          "id",
          "publicKey"
        ],
        "additionalProperties": false
      },
      "PublicKey": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "controller": {
            "type": "string"
          },
          "ethereumAddress": {
            "type": "string"
          },
          "publicKeyBase64": {
            "type": "string"
          },
          "publicKeyBase58": {
            "type": "string"
          },
          "publicKeyHex": {
            "type": "string"
          },
          "publicKeyPem": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "type",
          "controller"
        ],
        "additionalProperties": false
      },
      "Authentication": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "publicKey": {
            "type": "string"
          }
        },
        "required": [
          "type",
          "publicKey"
        ],
        "additionalProperties": false
      },
      "ServiceEndpoint": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "serviceEndpoint": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "type",
          "serviceEndpoint"
        ],
        "additionalProperties": false
      },
      "LinkedDataProof": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "created": {
            "type": "string"
          },
          "creator": {
            "type": "string"
          },
          "nonce": {
            "type": "string"
          },
          "signatureValue": {
            "type": "string"
          }
        },
        "required": [
          "type",
          "created",
          "creator",
          "nonce",
          "signatureValue"
        ],
        "additionalProperties": false
      }
    },
    "methods": {
      "resolveDid": {
        "description": "Resolves DID and returns DID Document",
        "arguments": {
          "$ref": "#/components/schemas/ResolveDidArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/DIDDocument"
        }
      }
    }
  }
}