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
        "description": "Message meta data"
      },
      "VerifiableCredential": {
        "type": "object",
        "properties": {
          "@context": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "id": {
            "type": "string"
          },
          "type": {
            "type": "array",
            "items": {
              "type": "string"
            }
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
          "proof": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              }
            }
          }
        },
        "required": [
          "@context",
          "type",
          "issuer",
          "issuanceDate",
          "credentialSubject",
          "proof"
        ],
        "description": "Verifiable Credential {@link https://github.com/decentralized-identity/did-jwt-vc}"
      },
      "VerifiablePresentation": {
        "type": "object",
        "properties": {
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
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "type": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "verifier": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "verifiableCredential": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiableCredential"
            }
          },
          "proof": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              }
            }
          }
        },
        "required": [
          "holder",
          "@context",
          "type",
          "verifier",
          "verifiableCredential",
          "proof"
        ],
        "description": "Verifiable Presentation {@link https://github.com/decentralized-identity/did-jwt-vc}"
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