export default {
  "components": {
    "schemas": {
      "FindIdentitiesArgs": {
        "$ref": "#/components/schemas/FindArgs-TIdentitiesColumns"
      },
      "FindArgs-TIdentitiesColumns": {
        "type": "object",
        "properties": {
          "where": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Where-TIdentitiesColumns"
            }
          },
          "order": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Order-TIdentitiesColumns"
            }
          },
          "take": {
            "type": "number"
          },
          "skip": {
            "type": "number"
          }
        },
        "additionalProperties": false
      },
      "Where-TIdentitiesColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TIdentitiesColumns"
          },
          "value": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "not": {
            "type": "boolean"
          },
          "op": {
            "type": "string",
            "enum": [
              "LessThan",
              "LessThanOrEqual",
              "MoreThan",
              "MoreThanOrEqual",
              "Equal",
              "Like",
              "Between",
              "In",
              "Any",
              "IsNull"
            ]
          }
        },
        "required": [
          "column"
        ],
        "additionalProperties": false
      },
      "TIdentitiesColumns": {
        "type": "string",
        "enum": [
          "did",
          "alias",
          "provider"
        ]
      },
      "Order-TIdentitiesColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TIdentitiesColumns"
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "column",
          "direction"
        ],
        "additionalProperties": false
      },
      "IIdentity": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "Decentralized identifier"
          },
          "alias": {
            "type": "string",
            "description": "Optional. Identity alias. Can be used to reference an object in an external system"
          },
          "provider": {
            "type": "string",
            "description": "Identity provider name"
          },
          "controllerKeyId": {
            "type": "string",
            "description": "Controller key id"
          },
          "keys": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IKey"
            },
            "description": "Array of managed keys"
          },
          "services": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IService"
            },
            "description": "Array of services"
          }
        },
        "required": [
          "did",
          "provider",
          "controllerKeyId",
          "keys",
          "services"
        ],
        "additionalProperties": false,
        "description": "Identity interface"
      },
      "IKey": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          },
          "kms": {
            "type": "string",
            "description": "Key Management System"
          },
          "type": {
            "$ref": "#/components/schemas/TKeyType",
            "description": "Key type"
          },
          "publicKeyHex": {
            "type": "string",
            "description": "Public key"
          },
          "privateKeyHex": {
            "type": "string",
            "description": "Optional. Private key"
          },
          "meta": {
            "type": "object",
            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
          }
        },
        "required": [
          "kid",
          "kms",
          "type",
          "publicKeyHex"
        ],
        "additionalProperties": false,
        "description": "Cryptographic key"
      },
      "TKeyType": {
        "type": "string",
        "enum": [
          "Ed25519",
          "Secp256k1"
        ],
        "description": "Cryptographic key type"
      },
      "IService": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID"
          },
          "type": {
            "type": "string",
            "description": "Service type"
          },
          "serviceEndpoint": {
            "type": "string",
            "description": "Endpoint URL"
          },
          "description": {
            "type": "string",
            "description": "Optional. Description"
          }
        },
        "required": [
          "id",
          "type",
          "serviceEndpoint"
        ],
        "additionalProperties": false,
        "description": "Identity service"
      },
      "FindMessagesArgs": {
        "$ref": "#/components/schemas/FindArgs-TMessageColumns"
      },
      "FindArgs-TMessageColumns": {
        "type": "object",
        "properties": {
          "where": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Where-TMessageColumns"
            }
          },
          "order": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Order-TMessageColumns"
            }
          },
          "take": {
            "type": "number"
          },
          "skip": {
            "type": "number"
          }
        },
        "additionalProperties": false
      },
      "Where-TMessageColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TMessageColumns"
          },
          "value": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "not": {
            "type": "boolean"
          },
          "op": {
            "type": "string",
            "enum": [
              "LessThan",
              "LessThanOrEqual",
              "MoreThan",
              "MoreThanOrEqual",
              "Equal",
              "Like",
              "Between",
              "In",
              "Any",
              "IsNull"
            ]
          }
        },
        "required": [
          "column"
        ],
        "additionalProperties": false
      },
      "TMessageColumns": {
        "type": "string",
        "enum": [
          "from",
          "to",
          "id",
          "createdAt",
          "expiresAt",
          "threadId",
          "type",
          "raw",
          "replyTo",
          "replyUrl"
        ]
      },
      "Order-TMessageColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TMessageColumns"
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "column",
          "direction"
        ],
        "additionalProperties": false
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
      "FindCredentialsArgs": {
        "$ref": "#/components/schemas/FindArgs-TCredentialColumns"
      },
      "FindArgs-TCredentialColumns": {
        "type": "object",
        "properties": {
          "where": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Where-TCredentialColumns"
            }
          },
          "order": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Order-TCredentialColumns"
            }
          },
          "take": {
            "type": "number"
          },
          "skip": {
            "type": "number"
          }
        },
        "additionalProperties": false
      },
      "Where-TCredentialColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TCredentialColumns"
          },
          "value": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "not": {
            "type": "boolean"
          },
          "op": {
            "type": "string",
            "enum": [
              "LessThan",
              "LessThanOrEqual",
              "MoreThan",
              "MoreThanOrEqual",
              "Equal",
              "Like",
              "Between",
              "In",
              "Any",
              "IsNull"
            ]
          }
        },
        "required": [
          "column"
        ],
        "additionalProperties": false
      },
      "TCredentialColumns": {
        "type": "string",
        "enum": [
          "context",
          "type",
          "id",
          "issuer",
          "subject",
          "expirationDate",
          "issuanceDate"
        ]
      },
      "Order-TCredentialColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TCredentialColumns"
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "column",
          "direction"
        ],
        "additionalProperties": false
      },
      "UniqueVerifiableCredential": {
        "type": "object",
        "properties": {
          "hash": {
            "type": "string"
          },
          "verifiableCredential": {
            "$ref": "#/components/schemas/VerifiableCredential"
          }
        },
        "required": [
          "hash",
          "verifiableCredential"
        ],
        "additionalProperties": false
      },
      "FindClaimsArgs": {
        "$ref": "#/components/schemas/FindArgs-TClaimsColumns"
      },
      "FindArgs-TClaimsColumns": {
        "type": "object",
        "properties": {
          "where": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Where-TClaimsColumns"
            }
          },
          "order": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Order-TClaimsColumns"
            }
          },
          "take": {
            "type": "number"
          },
          "skip": {
            "type": "number"
          }
        },
        "additionalProperties": false
      },
      "Where-TClaimsColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TClaimsColumns"
          },
          "value": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "not": {
            "type": "boolean"
          },
          "op": {
            "type": "string",
            "enum": [
              "LessThan",
              "LessThanOrEqual",
              "MoreThan",
              "MoreThanOrEqual",
              "Equal",
              "Like",
              "Between",
              "In",
              "Any",
              "IsNull"
            ]
          }
        },
        "required": [
          "column"
        ],
        "additionalProperties": false
      },
      "TClaimsColumns": {
        "type": "string",
        "enum": [
          "context",
          "credentialType",
          "type",
          "value",
          "isObj",
          "id",
          "issuer",
          "subject",
          "expirationDate",
          "issuanceDate"
        ]
      },
      "Order-TClaimsColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TClaimsColumns"
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "column",
          "direction"
        ],
        "additionalProperties": false
      },
      "FindPresentationsArgs": {
        "$ref": "#/components/schemas/FindArgs-TPresentationColumns"
      },
      "FindArgs-TPresentationColumns": {
        "type": "object",
        "properties": {
          "where": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Where-TPresentationColumns"
            }
          },
          "order": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Order-TPresentationColumns"
            }
          },
          "take": {
            "type": "number"
          },
          "skip": {
            "type": "number"
          }
        },
        "additionalProperties": false
      },
      "Where-TPresentationColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TPresentationColumns"
          },
          "value": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "not": {
            "type": "boolean"
          },
          "op": {
            "type": "string",
            "enum": [
              "LessThan",
              "LessThanOrEqual",
              "MoreThan",
              "MoreThanOrEqual",
              "Equal",
              "Like",
              "Between",
              "In",
              "Any",
              "IsNull"
            ]
          }
        },
        "required": [
          "column"
        ],
        "additionalProperties": false
      },
      "TPresentationColumns": {
        "type": "string",
        "enum": [
          "context",
          "type",
          "id",
          "holder",
          "verifier",
          "expirationDate",
          "issuanceDate"
        ]
      },
      "Order-TPresentationColumns": {
        "type": "object",
        "properties": {
          "column": {
            "$ref": "#/components/schemas/TPresentationColumns"
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "column",
          "direction"
        ],
        "additionalProperties": false
      },
      "UniqueVerifiablePresentation": {
        "type": "object",
        "properties": {
          "hash": {
            "type": "string"
          },
          "verifiablePresentation": {
            "$ref": "#/components/schemas/VerifiablePresentation"
          }
        },
        "required": [
          "hash",
          "verifiablePresentation"
        ],
        "additionalProperties": false
      }
    },
    "methods": {
      "dataStoreORMGetIdentities": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindIdentitiesArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/IIdentity"
          }
        }
      },
      "dataStoreORMGetIdentitiesCount": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindIdentitiesArgs"
        },
        "returnType": {
          "type": "number"
        }
      },
      "dataStoreORMGetMessages": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindMessagesArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/IMessage"
          }
        }
      },
      "dataStoreORMGetMessagesCount": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindMessagesArgs"
        },
        "returnType": {
          "type": "number"
        }
      },
      "dataStoreORMGetVerifiableCredentials": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindCredentialsArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/UniqueVerifiableCredential"
          }
        }
      },
      "dataStoreORMGetVerifiableCredentialsByClaims": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindClaimsArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/UniqueVerifiableCredential"
          }
        }
      },
      "dataStoreORMGetVerifiableCredentialsByClaimsCount": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindClaimsArgs"
        },
        "returnType": {
          "type": "number"
        }
      },
      "dataStoreORMGetVerifiableCredentialsCount": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindCredentialsArgs"
        },
        "returnType": {
          "type": "number"
        }
      },
      "dataStoreORMGetVerifiablePresentations": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindPresentationsArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/UniqueVerifiablePresentation"
          }
        }
      },
      "dataStoreORMGetVerifiablePresentationsCount": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/FindPresentationsArgs"
        },
        "returnType": {
          "type": "number"
        }
      }
    }
  }
}