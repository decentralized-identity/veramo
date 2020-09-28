import { OpenAPIV3 } from 'openapi-types'
export const openApiSchema: OpenAPIV3.Document = {
  "openapi": "3.0.0",
  "info": {
    "title": "DAF OpenAPI",
    "version": ""
  },
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
            "enum": [
              "https://w3id.org/did/v1"
            ]
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
      },
      "IIdentityManagerAddKeyArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          },
          "key": {
            "$ref": "#/components/schemas/IKey",
            "description": "Key object"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "required": [
          "did",
          "key"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerAddKey | identityManagerAddKey}"
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
      "IIdentityManagerAddServiceArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          },
          "service": {
            "$ref": "#/components/schemas/IService",
            "description": "Service object"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "required": [
          "did",
          "service"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerAddService | identityManagerAddService}"
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
      "IIdentityManagerCreateIdentityArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string",
            "description": "Optional. Identity alias. Can be used to reference an object in an external system"
          },
          "provider": {
            "type": "string",
            "description": "Optional. Identity provider"
          },
          "kms": {
            "type": "string",
            "description": "Optional. Key Management System"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerCreateIdentity | identityManagerCreateIdentity}"
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
      "IIdentityManagerDeleteIdentityArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          }
        },
        "required": [
          "did"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerDeleteIdentity | identityManagerDeleteIdentity}"
      },
      "IIdentityManagerGetIdentitiesArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string",
            "description": "Optional. Alias"
          },
          "provider": {
            "type": "string",
            "description": "Optional. Provider"
          }
        },
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentities | identityManagerGetIdentities}"
      },
      "IIdentityManagerGetIdentityArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          }
        },
        "required": [
          "did"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentity | identityManagerGetIdentity}"
      },
      "IIdentityManagerGetIdentityByAliasArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string",
            "description": "Alias"
          },
          "provider": {
            "type": "string",
            "description": "Optional provider"
          }
        },
        "required": [
          "alias"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentityByAlias | identityManagerGetIdentityByAlias}"
      },
      "IIdentityManagerGetOrCreateIdentityArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string",
            "description": "Identity alias. Can be used to reference an object in an external system"
          },
          "provider": {
            "type": "string",
            "description": "Optional. Identity provider"
          },
          "kms": {
            "type": "string",
            "description": "Optional. Key Management System"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "required": [
          "alias"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerGetOrCreateIdentity | identityManagerGetOrCreateIdentity}"
      },
      "IIdentityManagerRemoveKeyArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          },
          "kid": {
            "type": "string",
            "description": "Key ID"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "required": [
          "did",
          "kid"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerRemoveKey | identityManagerRemoveKey}"
      },
      "IIdentityManagerRemoveServiceArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "DID"
          },
          "id": {
            "type": "string",
            "description": "Service ID"
          },
          "options": {
            "description": "Optional. Identity provider specific options"
          }
        },
        "required": [
          "did",
          "id"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerRemoveService | identityManagerRemoveService}"
      },
      "IHandleMessageArgs": {
        "type": "object",
        "properties": {
          "raw": {
            "type": "string",
            "description": "Raw message data"
          },
          "metaData": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IMetaData"
            },
            "description": "Optional. Message meta data"
          },
          "save": {
            "type": "boolean",
            "description": "Optional. If set to `true`, the message will be saved using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}"
          }
        },
        "required": [
          "raw"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IMessageHandler.handleMessage | handleMessage}"
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
        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
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
        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
      },
      "IKeyManagerCreateKeyArgs": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/components/schemas/TKeyType",
            "description": "Key type"
          },
          "kms": {
            "type": "string",
            "description": "Key Management System"
          },
          "meta": {
            "type": "object",
            "description": "Optional. Key meta data"
          }
        },
        "required": [
          "type",
          "kms"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerCreateKey | keyManagerCreateKey}"
      },
      "IKeyManagerDecryptJWEArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          },
          "data": {
            "type": "string",
            "description": "Encrypted data"
          }
        },
        "required": [
          "kid",
          "data"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerDecryptJWE | keyManagerDecryptJWE}"
      },
      "IKeyManagerDeleteKeyArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          }
        },
        "required": [
          "kid"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerDeleteKey | keyManagerDeleteKey}"
      },
      "IKeyManagerEncryptJWEArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID to use for encryption"
          },
          "to": {
            "type": "object",
            "properties": {
              "kid": {
                "type": "string",
                "description": "Key ID"
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
              "type",
              "publicKeyHex"
            ],
            "additionalProperties": false,
            "description": "Recipient key object"
          },
          "data": {
            "type": "string",
            "description": "Data to encrypt"
          }
        },
        "required": [
          "kid",
          "to",
          "data"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE}"
      },
      "IKeyManagerGetKeyArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          }
        },
        "required": [
          "kid"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerGetKey | keyManagerGetKey}"
      },
      "IKeyManagerSignEthTXArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          },
          "transaction": {
            "type": "object",
            "description": "Ethereum transaction object"
          }
        },
        "required": [
          "kid",
          "transaction"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerSignEthTX | keyManagerSignEthTX}"
      },
      "IKeyManagerSignJWTArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string",
            "description": "Key ID"
          },
          "data": {
            "type": "string",
            "description": "Data to sign"
          }
        },
        "required": [
          "kid",
          "data"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IKeyManager.keyManagerSignJWT | keyManagerSignJWT}"
      },
      "ICreateVerifiableCredentialArgs": {
        "type": "object",
        "properties": {
          "credential": {
            "$ref": "#/components/schemas/W3CCredential",
            "description": "The json payload of the Credential according to the\n{@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}\n\nThe signer of the Credential is chosen based on the `issuer.id` property\nof the `credential`"
          },
          "save": {
            "type": "boolean",
            "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the\n{@link daf-core#IDataStore | storage plugin} to be saved"
          },
          "proofFormat": {
            "$ref": "#/components/schemas/EncodingFormat",
            "description": "The desired format for the VerifiablePresentation to be created.\nCurrently, only JWT is supported"
          }
        },
        "required": [
          "credential",
          "proofFormat"
        ],
        "additionalProperties": false,
        "description": "Encapsulates the parameters required to create a\n{@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}"
      },
      "W3CCredential": {
        "type": "object",
        "properties": {
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
            "$ref": "#/components/schemas/CredentialStatus"
          }
        },
        "required": [
          "@context",
          "credentialSubject",
          "issuanceDate",
          "issuer",
          "type"
        ],
        "description": "This data type represents a parsed VerifiableCredential.\nIt is meant to be an unambiguous representation of the properties of a Credential and is usually the result of a transformation method.\n\n`issuer` is always an object with an `id` property and potentially other app specific issuer claims\n`issuanceDate` is an ISO DateTime string\n`expirationDate`, is a nullable ISO DateTime string\n\nAny JWT specific properties are transformed to the broader W3C variant and any app specific properties are left intact"
      },
      "CredentialStatus": {
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
        ],
        "additionalProperties": false
      },
      "EncodingFormat": {
        "type": "string",
        "enum": [
          "jwt"
        ],
        "description": "The type of encoding to be used for the Verifiable Credential or Presentation to be generated.\n\nOnly `jwt` is supported at the moment."
      },
      "ICreateVerifiablePresentationArgs": {
        "type": "object",
        "properties": {
          "presentation": {
            "$ref": "#/components/schemas/W3CPresentation",
            "description": "The json payload of the Presentation according to the\n{@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.\n\nThe signer of the Presentation is chosen based on the `holder` property\nof the `presentation`"
          },
          "save": {
            "type": "boolean",
            "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the\n{@link daf-core#IDataStore | storage plugin} to be saved"
          },
          "proofFormat": {
            "$ref": "#/components/schemas/EncodingFormat",
            "description": "The desired format for the VerifiablePresentation to be created.\nCurrently, only JWT is supported"
          }
        },
        "required": [
          "presentation",
          "proofFormat"
        ],
        "additionalProperties": false,
        "description": "Encapsulates the parameters required to create a\n{@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}"
      },
      "W3CPresentation": {
        "type": "object",
        "properties": {
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
              "$ref": "#/components/schemas/Verifiable-W3CCredential"
            }
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
          }
        },
        "required": [
          "@context",
          "holder",
          "type",
          "verifiableCredential",
          "verifier"
        ],
        "description": "This data type represents a parsed Presentation payload.\nIt is meant to be an unambiguous representation of the properties of a Presentation and is usually the result of a transformation method.\n\nThe `verifiableCredential` array should contain parsed `Verifiable-Credential` elements.\nAny JWT specific properties are transformed to the broader W3C variant and any other app specific properties are left intact."
      },
      "ICreateSelectiveDisclosureRequestArgs": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/ISelectiveDisclosureRequest"
          }
        },
        "required": [
          "data"
        ],
        "additionalProperties": false,
        "description": "Contains the parameters of a Selective Disclosure Request."
      },
      "ISelectiveDisclosureRequest": {
        "type": "object",
        "properties": {
          "issuer": {
            "type": "string",
            "description": "The issuer of the request"
          },
          "subject": {
            "type": "string",
            "description": "The target of the request"
          },
          "replyUrl": {
            "type": "string",
            "description": "The URL where the response should be sent back"
          },
          "tag": {
            "type": "string"
          },
          "claims": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ICredentialRequestInput"
            },
            "description": "A list of claims that are being requested"
          },
          "credentials": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "A list of issuer credentials that the target will use to establish trust"
          }
        },
        "required": [
          "issuer",
          "claims"
        ],
        "additionalProperties": false,
        "description": "Represents the Selective Disclosure request parameters."
      },
      "ICredentialRequestInput": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string",
            "description": "Motive for requiring this credential."
          },
          "essential": {
            "type": "boolean",
            "description": "If it is essential. A response that does not include this credential is not sufficient."
          },
          "credentialType": {
            "type": "string",
            "description": "The credential type. See {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types}"
          },
          "credentialContext": {
            "type": "string",
            "description": "The credential context. See {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context}"
          },
          "claimType": {
            "type": "string",
            "description": "The name of the claim property that the credential should express."
          },
          "claimValue": {
            "type": "string",
            "description": "The value of the claim that the credential should express."
          },
          "issuers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Issuer"
            },
            "description": "A list of accepted Issuers for this credential."
          }
        },
        "required": [
          "claimType"
        ],
        "additionalProperties": false,
        "description": "Describes a particular credential that is being requested"
      },
      "Issuer": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "The DID of the issuer of a requested credential."
          },
          "url": {
            "type": "string",
            "description": "A URL where a credential of that type can be obtained."
          }
        },
        "required": [
          "did",
          "url"
        ],
        "additionalProperties": false,
        "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
      },
      "IGetVerifiableCredentialsForSdrArgs": {
        "type": "object",
        "properties": {
          "sdr": {
            "type": "object",
            "properties": {
              "subject": {
                "type": "string",
                "description": "The target of the request"
              },
              "replyUrl": {
                "type": "string",
                "description": "The URL where the response should be sent back"
              },
              "tag": {
                "type": "string"
              },
              "claims": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ICredentialRequestInput"
                },
                "description": "A list of claims that are being requested"
              },
              "credentials": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "A list of issuer credentials that the target will use to establish trust"
              }
            },
            "required": [
              "claims"
            ],
            "additionalProperties": false,
            "description": "The Selective Disclosure Request (issuer is omitted)"
          },
          "did": {
            "type": "string",
            "description": "The DID of the subject"
          }
        },
        "required": [
          "sdr"
        ],
        "additionalProperties": false,
        "description": "Encapsulates the params needed to gather credentials to fulfill a Selective disclosure request."
      },
      "ICredentialsForSdr": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string",
            "description": "Motive for requiring this credential."
          },
          "essential": {
            "type": "boolean",
            "description": "If it is essential. A response that does not include this credential is not sufficient."
          },
          "credentialType": {
            "type": "string",
            "description": "The credential type. See {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types}"
          },
          "credentialContext": {
            "type": "string",
            "description": "The credential context. See {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context}"
          },
          "claimType": {
            "type": "string",
            "description": "The name of the claim property that the credential should express."
          },
          "claimValue": {
            "type": "string",
            "description": "The value of the claim that the credential should express."
          },
          "issuers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Issuer"
            },
            "description": "A list of accepted Issuers for this credential."
          },
          "credentials": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiableCredential"
            }
          }
        },
        "required": [
          "claimType",
          "credentials"
        ],
        "additionalProperties": false,
        "description": "The credentials that make up a response of a Selective Disclosure"
      },
      "IValidatePresentationAgainstSdrArgs": {
        "type": "object",
        "properties": {
          "presentation": {
            "$ref": "#/components/schemas/VerifiablePresentation"
          },
          "sdr": {
            "$ref": "#/components/schemas/ISelectiveDisclosureRequest"
          }
        },
        "required": [
          "presentation",
          "sdr"
        ],
        "additionalProperties": false,
        "description": "A tuple used to verify a Selective Disclosure Response.\nEncapsulates the response(`presentation`) and the corresponding request (`sdr`) that made it."
      },
      "IPresentationValidationResult": {
        "type": "object",
        "properties": {
          "valid": {
            "type": "boolean"
          },
          "claims": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ICredentialsForSdr"
            }
          }
        },
        "required": [
          "valid",
          "claims"
        ],
        "additionalProperties": false,
        "description": "The result of a selective disclosure response validation."
      },
      "ISendMessageDIDCommAlpha1Args": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "save": {
            "type": "boolean"
          },
          "data": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "from": {
                "type": "string"
              },
              "to": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "body": {}
            },
            "required": [
              "from",
              "to",
              "type",
              "body"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "data"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IDIDComm.sendMessageDIDCommAlpha1}"
      },
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
      }
    }
  },
  "paths": {
    "/resolveDid": {
      "post": {
        "description": "Resolves DID and returns DID Document",
        "operationId": "resolveDid",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResolveDidArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Resolves DID and returns DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DIDDocument"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerAddKey": {
      "post": {
        "description": "Adds a key to a DID Document",
        "operationId": "identityManagerAddKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerAddKeyArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Adds a key to a DID Document",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
    "/identityManagerAddService": {
      "post": {
        "description": "Adds a service to a DID Document",
        "operationId": "identityManagerAddService",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerAddServiceArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Adds a service to a DID Document",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
    "/identityManagerCreateIdentity": {
      "post": {
        "description": "Creates and returns a new identity",
        "operationId": "identityManagerCreateIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerCreateIdentityArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates and returns a new identity",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IIdentity"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerDeleteIdentity": {
      "post": {
        "description": "Deletes identity",
        "operationId": "identityManagerDeleteIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerDeleteIdentityArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Deletes identity",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentities": {
      "post": {
        "description": "Returns a list of managed identities",
        "operationId": "identityManagerGetIdentities",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerGetIdentitiesArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a list of managed identities",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IIdentity"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentity": {
      "post": {
        "description": "Returns a specific identity",
        "operationId": "identityManagerGetIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerGetIdentityArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a specific identity",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IIdentity"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentityByAlias": {
      "post": {
        "description": "Returns a specific identity by alias",
        "operationId": "identityManagerGetIdentityByAlias",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerGetIdentityByAliasArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a specific identity by alias",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IIdentity"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetOrCreateIdentity": {
      "post": {
        "description": "Returns an existing identity or creates a new one for a specific alias",
        "operationId": "identityManagerGetOrCreateIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerGetOrCreateIdentityArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns an existing identity or creates a new one for a specific alias",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IIdentity"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetProviders": {
      "post": {
        "description": "Returns a list of available identity providers",
        "operationId": "identityManagerGetProviders",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a list of available identity providers",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerImportIdentity": {
      "post": {
        "description": "Imports identity",
        "operationId": "identityManagerImportIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentity"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Imports identity",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IIdentity"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerRemoveKey": {
      "post": {
        "description": "Removes a key from a DID Document",
        "operationId": "identityManagerRemoveKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerRemoveKeyArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Removes a key from a DID Document",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
    "/identityManagerRemoveService": {
      "post": {
        "description": "Removes a service from a DID Document",
        "operationId": "identityManagerRemoveService",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IIdentityManagerRemoveServiceArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Removes a service from a DID Document",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
    "/handleMessage": {
      "post": {
        "description": "Parses and optionally saves a message",
        "operationId": "handleMessage",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IHandleMessageArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Parses and optionally saves a message",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IMessage"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveMessage": {
      "post": {
        "description": "Saves message to the data store",
        "operationId": "dataStoreSaveMessage",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IMessage"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves message to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveVerifiableCredential": {
      "post": {
        "description": "Saves verifiable credential to the data store",
        "operationId": "dataStoreSaveVerifiableCredential",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifiableCredential"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves verifiable credential to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveVerifiablePresentation": {
      "post": {
        "description": "Saves verifiable presentation to the data store",
        "operationId": "dataStoreSaveVerifiablePresentation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves verifiable presentation to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerCreateKey": {
      "post": {
        "description": "Creates and returns a new key",
        "operationId": "keyManagerCreateKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerCreateKeyArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates and returns a new key",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IKey"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerDecryptJWE": {
      "post": {
        "description": "Decrypts data",
        "operationId": "keyManagerDecryptJWE",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerDecryptJWEArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Decrypts data",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerDeleteKey": {
      "post": {
        "description": "Deletes a key",
        "operationId": "keyManagerDeleteKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerDeleteKeyArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Deletes a key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerEncryptJWE": {
      "post": {
        "description": "Encrypts data",
        "operationId": "keyManagerEncryptJWE",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerEncryptJWEArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Encrypts data",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerGetKey": {
      "post": {
        "description": "Returns an existing key",
        "operationId": "keyManagerGetKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerGetKeyArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns an existing key",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IKey"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerGetKeyManagementSystems": {
      "post": {
        "description": "Lists available key management systems",
        "operationId": "keyManagerGetKeyManagementSystems",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {}
            }
          }
        },
        "responses": {
          "200": {
            "description": "Lists available key management systems",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerImportKey": {
      "post": {
        "description": "Imports a created key",
        "operationId": "keyManagerImportKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKey"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Imports a created key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerSignEthTX": {
      "post": {
        "description": "Signs Ethereum transaction",
        "operationId": "keyManagerSignEthTX",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerSignEthTXArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signs Ethereum transaction",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerSignJWT": {
      "post": {
        "description": "Signs JWT",
        "operationId": "keyManagerSignJWT",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IKeyManagerSignJWTArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signs JWT",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/createVerifiableCredential": {
      "post": {
        "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
        "operationId": "createVerifiableCredential",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ICreateVerifiableCredentialArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifiableCredential"
                }
              }
            }
          }
        }
      }
    },
    "/createVerifiablePresentation": {
      "post": {
        "description": "Creates a Verifiable Presentation. The payload, signer and format are chosen based on the ",
        "operationId": "createVerifiablePresentation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ICreateVerifiablePresentationArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates a Verifiable Presentation. The payload, signer and format are chosen based on the ",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifiablePresentation"
                }
              }
            }
          }
        }
      }
    },
    "/createSelectiveDisclosureRequest": {
      "post": {
        "description": "",
        "operationId": "createSelectiveDisclosureRequest",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ICreateSelectiveDisclosureRequestArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/getVerifiableCredentialsForSdr": {
      "post": {
        "description": "",
        "operationId": "getVerifiableCredentialsForSdr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IGetVerifiableCredentialsForSdrArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ICredentialsForSdr"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/validatePresentationAgainstSdr": {
      "post": {
        "description": "",
        "operationId": "validatePresentationAgainstSdr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IValidatePresentationAgainstSdrArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IPresentationValidationResult"
                }
              }
            }
          }
        }
      }
    },
    "/sendMessageDIDCommAlpha1": {
      "post": {
        "description": "This is used to create a message according to the initial ",
        "operationId": "sendMessageDIDCommAlpha1",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ISendMessageDIDCommAlpha1Args"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "This is used to create a message according to the initial ",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/IMessage"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetIdentities": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetIdentities",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindIdentitiesArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IIdentity"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetIdentitiesCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetIdentitiesCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindIdentitiesArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetMessages": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetMessages",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindMessagesArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IMessage"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetMessagesCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetMessagesCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindMessagesArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentials": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentials",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindCredentialsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/VerifiableCredential"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsByClaims": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsByClaims",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindClaimsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/VerifiableCredential"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsByClaimsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsByClaimsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindClaimsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindCredentialsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiablePresentations": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiablePresentations",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindPresentationsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/VerifiablePresentation"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiablePresentationsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiablePresentationsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FindPresentationsArgs"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    }
  }
}