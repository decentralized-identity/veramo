export default {
  "components": {
    "schemas": {
      "IDataStoreGetMessageArgs": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Required. Message ID"
          }
        },
        "required": [
          "id"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreGetMessage | dataStoreGetMessage}"
      },
      "IMessage": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique message ID"
          },
          "type": {
            "type": "string",
            "description": "Message type"
          },
          "createdAt": {
            "type": "string",
            "description": "Optional. Creation date (ISO 8601)"
          },
          "expiresAt": {
            "type": "string",
            "description": "Optional. Expiration date (ISO 8601)"
          },
          "threadId": {
            "type": "string",
            "description": "Optional. Thread ID"
          },
          "raw": {
            "type": "string",
            "description": "Optional. Original message raw data"
          },
          "data": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "object"
              }
            ],
            "description": "Optional. Parsed data"
          },
          "replyTo": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Optional. List of DIDs to reply to"
          },
          "replyUrl": {
            "type": "string",
            "description": "Optional. URL to post a reply message to"
          },
          "from": {
            "type": "string",
            "description": "Optional. Sender DID"
          },
          "to": {
            "type": "string",
            "description": "Optional. Recipient DID"
          },
          "metaData": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IMetaData"
            },
            "description": "Optional. Array of message metadata"
          },
          "credentials": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            "description": "Optional. Array of attached verifiable credentials"
          },
          "presentations": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiablePresentation"
            },
            "description": "Optional. Array of attached verifiable presentations"
          }
        },
        "required": [
          "id",
          "type"
        ],
        "additionalProperties": false,
        "description": "DIDComm message"
      },
      "IMetaData": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Type"
          },
          "value": {
            "type": "string",
            "description": "Optional. Value"
          }
        },
        "required": [
          "type"
        ],
        "additionalProperties": false,
        "description": "Message meta data"
      },
      "VerifiableCredential": {
        "$ref": "#/components/schemas/Verifiable-W3CCredential",
        "description": "Verifiable Credential {@link https://github.com/decentralized-identity/did-jwt-vc}"
      },
      "Verifiable-W3CCredential": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "proof": {
            "$ref": "#/components/schemas/Proof"
          },
          "id": {
            "type": "string"
          },
          "credentialSubject": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              }
            }
          },
          "credentialStatus": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "type": {
                "type": "string"
              }
            },
            "required": [
              "id",
              "type"
            ]
          },
          "@context": {
            "type": "object",
            "properties": {}
          },
          "type": {
            "type": "object",
            "properties": {}
          },
          "issuer": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              }
            },
            "required": [
              "id"
            ]
          },
          "issuanceDate": {
            "type": "string"
          },
          "expirationDate": {
            "type": "string"
          }
        },
        "required": [
          "@context",
          "credentialSubject",
          "issuanceDate",
          "issuer",
          "proof",
          "type"
        ],
        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof} property that can be used to verify it."
      },
      "Proof": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          }
        }
      },
      "VerifiablePresentation": {
        "$ref": "#/components/schemas/Verifiable-W3CPresentation",
        "description": "Verifiable Presentation {@link https://github.com/decentralized-identity/did-jwt-vc}"
      },
      "Verifiable-W3CPresentation": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "proof": {
            "$ref": "#/components/schemas/Proof"
          },
          "id": {
            "type": "string"
          },
          "holder": {
            "type": "string"
          },
          "issuanceDate": {
            "type": "string"
          },
          "expirationDate": {
            "type": "string"
          },
          "@context": {
            "type": "object",
            "properties": {}
          },
          "type": {
            "type": "object",
            "properties": {}
          },
          "verifier": {
            "type": "object",
            "properties": {}
          },
          "verifiableCredential": {
            "type": "object",
            "properties": {}
          }
        },
        "required": [
          "@context",
          "holder",
          "proof",
          "type",
          "verifiableCredential",
          "verifier"
        ],
        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof} property that can be used to verify it."
      },
      "IDataStoreGetVerifiableCredentialArgs": {
        "type": "object",
        "properties": {
          "hash": {
            "type": "string",
            "description": "Required. VerifiableCredential hash"
          }
        },
        "required": [
          "hash"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreGetVerifiableCredential | dataStoreGetVerifiableCredential}"
      },
      "IDataStoreGetVerifiablePresentationArgs": {
        "type": "object",
        "properties": {
          "hash": {
            "type": "string",
            "description": "Required. VerifiablePresentation hash"
          }
        },
        "required": [
          "hash"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreGetVerifiablePresentation | dataStoreGetVerifiablePresentation}"
      },
      "IDataStoreSaveMessageArgs": {
        "type": "object",
        "properties": {
          "message": {
            "$ref": "#/components/schemas/IMessage",
            "description": "Required. Message"
          }
        },
        "required": [
          "message"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}"
      },
      "IDataStoreSaveVerifiableCredentialArgs": {
        "type": "object",
        "properties": {
          "verifiableCredential": {
            "$ref": "#/components/schemas/VerifiableCredential",
            "description": "Required. VerifiableCredential"
          }
        },
        "required": [
          "verifiableCredential"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}"
      },
      "IDataStoreSaveVerifiablePresentationArgs": {
        "type": "object",
        "properties": {
          "verifiablePresentation": {
            "$ref": "#/components/schemas/VerifiablePresentation",
            "description": "Required. VerifiablePresentation"
          }
        },
        "required": [
          "verifiablePresentation"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}"
      }
    },
    "methods": {
      "dataStoreGetMessage": {
        "description": "Gets message from the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreGetMessageArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IMessage"
        }
      },
      "dataStoreGetVerifiableCredential": {
        "description": "Gets verifiable credential from the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreGetVerifiableCredentialArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/VerifiableCredential"
        }
      },
      "dataStoreGetVerifiablePresentation": {
        "description": "Gets verifiable presentation from the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreGetVerifiablePresentationArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/VerifiablePresentation"
        }
      },
      "dataStoreSaveMessage": {
        "description": "Saves message to the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreSaveMessageArgs"
        },
        "returnType": {
          "type": "string"
        }
      },
      "dataStoreSaveVerifiableCredential": {
        "description": "Saves verifiable credential to the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreSaveVerifiableCredentialArgs"
        },
        "returnType": {
          "type": "string"
        }
      },
      "dataStoreSaveVerifiablePresentation": {
        "description": "Saves verifiable presentation to the data store",
        "arguments": {
          "$ref": "#/components/schemas/IDataStoreSaveVerifiablePresentationArgs"
        },
        "returnType": {
          "type": "string"
        }
      }
    }
  }
}