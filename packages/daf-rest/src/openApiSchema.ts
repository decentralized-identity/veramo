import { OpenAPIV3 } from 'openapi-types'
export const openApiSchema: OpenAPIV3.Document = {
  "openapi": "3.0.0",
  "info": {
    "title": "DAF OpenAPI",
    "version": ""
  },
  "components": {
    "schemas": {
      "IIdentityManagerAddKeyArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "key": {
            "$ref": "#/components/schemas/IKey"
          },
          "options": {}
        },
        "required": [
          "did",
          "key"
        ],
        "additionalProperties": false
      },
      "IKey": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          },
          "kms": {
            "type": "string"
          },
          "type": {
            "$ref": "#/components/schemas/TKeyType"
          },
          "publicKeyHex": {
            "type": "string"
          },
          "privateKeyHex": {
            "type": "string"
          },
          "meta": {
            "type": "object"
          }
        },
        "required": [
          "kid",
          "kms",
          "type",
          "publicKeyHex"
        ],
        "additionalProperties": false
      },
      "TKeyType": {
        "type": "string",
        "enum": [
          "Ed25519",
          "Secp256k1"
        ]
      },
      "IIdentityManagerAddServiceArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "service": {
            "$ref": "#/components/schemas/IService"
          },
          "options": {}
        },
        "required": [
          "did",
          "service"
        ],
        "additionalProperties": false
      },
      "IService": {
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
      "IIdentityManagerCreateIdentityArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string"
          },
          "provider": {
            "type": "string"
          },
          "kms": {
            "type": "string"
          },
          "options": {}
        },
        "additionalProperties": false
      },
      "IIdentity": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "alias": {
            "type": "string"
          },
          "provider": {
            "type": "string"
          },
          "controllerKeyId": {
            "type": "string"
          },
          "keys": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IKey"
            }
          },
          "services": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IService"
            }
          }
        },
        "required": [
          "did",
          "provider",
          "controllerKeyId",
          "keys",
          "services"
        ],
        "additionalProperties": false
      },
      "IIdentityManagerDeleteIdentityArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          }
        },
        "required": [
          "did"
        ],
        "additionalProperties": false
      },
      "IIdentityManagerGetIdentityArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          }
        },
        "required": [
          "did"
        ],
        "additionalProperties": false
      },
      "IIdentityManagerGetOrCreateIdentityArgs": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string"
          },
          "provider": {
            "type": "string"
          },
          "kms": {
            "type": "string"
          },
          "options": {}
        },
        "required": [
          "alias"
        ],
        "additionalProperties": false
      },
      "IIdentityManagerRemoveKeyArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "kid": {
            "type": "string"
          },
          "options": {}
        },
        "required": [
          "did",
          "kid"
        ],
        "additionalProperties": false
      },
      "IIdentityManagerRemoveServiceArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "id": {
            "type": "string"
          },
          "options": {}
        },
        "required": [
          "did",
          "id"
        ],
        "additionalProperties": false
      },
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
        "description": "Input arguments for {@link IResolveDid.resolveDid}"
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
          "owner": {
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
          "owner"
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
      "IHandleMessageArgs": {
        "type": "object",
        "properties": {
          "raw": {
            "type": "string"
          },
          "metaData": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IMetaData"
            }
          },
          "save": {
            "type": "boolean"
          }
        },
        "required": [
          "raw"
        ],
        "additionalProperties": false
      },
      "IMetaData": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "value": {
            "type": "string"
          }
        },
        "required": [
          "type"
        ],
        "additionalProperties": false
      },
      "Message": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "expiresAt": {
            "type": "string"
          },
          "threadId": {
            "type": "string"
          },
          "raw": {
            "type": "string"
          },
          "data": {},
          "replyTo": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "replyUrl": {
            "type": "string"
          },
          "from": {
            "type": "string"
          },
          "to": {
            "type": "string"
          },
          "metaData": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IMetaData"
            }
          },
          "credentials": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiableCredential"
            }
          },
          "presentations": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiablePresentation"
            }
          }
        },
        "required": [
          "id",
          "type"
        ],
        "additionalProperties": false
      },
      "VerifiableCredential": {
        "$ref": "#/components/schemas/Verifiable-W3CCredential"
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
            },
            "required": [
              "id"
            ]
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
        ]
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
        "$ref": "#/components/schemas/Verifiable-W3CPresentation"
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
        ]
      },
      "IMessage": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "expiresAt": {
            "type": "string"
          },
          "threadId": {
            "type": "string"
          },
          "raw": {
            "type": "string"
          },
          "data": {},
          "replyTo": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "replyUrl": {
            "type": "string"
          },
          "from": {
            "type": "string"
          },
          "to": {
            "type": "string"
          },
          "metaData": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IMetaData"
            }
          },
          "credentials": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiableCredential"
            }
          },
          "presentations": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VerifiablePresentation"
            }
          }
        },
        "required": [
          "id",
          "type"
        ],
        "additionalProperties": false
      },
      "IKeyManagerCreateKeyArgs": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/components/schemas/TKeyType"
          },
          "kms": {
            "type": "string"
          },
          "meta": {
            "type": "object"
          }
        },
        "required": [
          "type",
          "kms"
        ],
        "additionalProperties": false
      },
      "IKeyManagerDecryptJWEArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          },
          "data": {
            "type": "string"
          }
        },
        "required": [
          "kid",
          "data"
        ],
        "additionalProperties": false
      },
      "IKeyManagerDeleteKeyArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          }
        },
        "required": [
          "kid"
        ],
        "additionalProperties": false
      },
      "IKeyManagerEncryptJWEArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          },
          "to": {
            "type": "object",
            "properties": {
              "kid": {
                "type": "string"
              },
              "type": {
                "$ref": "#/components/schemas/TKeyType"
              },
              "publicKeyHex": {
                "type": "string"
              },
              "privateKeyHex": {
                "type": "string"
              },
              "meta": {
                "type": "object"
              }
            },
            "required": [
              "kid",
              "type",
              "publicKeyHex"
            ],
            "additionalProperties": false
          },
          "data": {
            "type": "string"
          }
        },
        "required": [
          "kid",
          "to",
          "data"
        ],
        "additionalProperties": false
      },
      "IKeyManagerGetKeyArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          }
        },
        "required": [
          "kid"
        ],
        "additionalProperties": false
      },
      "IKeyManagerSignEthTXArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          },
          "transaction": {
            "type": "object"
          }
        },
        "required": [
          "kid",
          "transaction"
        ],
        "additionalProperties": false
      },
      "IKeyManagerSignJWTArgs": {
        "type": "object",
        "properties": {
          "kid": {
            "type": "string"
          },
          "data": {
            "type": "string"
          }
        },
        "required": [
          "kid",
          "data"
        ],
        "additionalProperties": false
      },
      "ICreateVerifiableCredentialArgs": {
        "type": "object",
        "properties": {
          "credential": {
            "$ref": "#/components/schemas/W3CCredential"
          },
          "save": {
            "type": "boolean"
          },
          "proofFormat": {
            "type": "string",
            "enum": [
              "jwt"
            ]
          }
        },
        "required": [
          "credential",
          "proofFormat"
        ],
        "additionalProperties": false
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
            },
            "required": [
              "id"
            ]
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
      "ICreateVerifiablePresentationArgs": {
        "type": "object",
        "properties": {
          "presentation": {
            "$ref": "#/components/schemas/W3CPresentation"
          },
          "save": {
            "type": "boolean"
          },
          "proofFormat": {
            "type": "string",
            "enum": [
              "jwt"
            ]
          }
        },
        "required": [
          "presentation",
          "proofFormat"
        ],
        "additionalProperties": false
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
        "additionalProperties": false
      },
      "ISelectiveDisclosureRequest": {
        "type": "object",
        "properties": {
          "issuer": {
            "type": "string"
          },
          "subject": {
            "type": "string"
          },
          "replyUrl": {
            "type": "string"
          },
          "tag": {
            "type": "string"
          },
          "claims": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ICredentialRequestInput"
            }
          },
          "credentials": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "issuer",
          "claims"
        ],
        "additionalProperties": false
      },
      "ICredentialRequestInput": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string"
          },
          "essential": {
            "type": "boolean"
          },
          "credentialType": {
            "type": "string"
          },
          "credentialContext": {
            "type": "string"
          },
          "claimType": {
            "type": "string"
          },
          "claimValue": {
            "type": "string"
          },
          "issuers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Issuer"
            }
          }
        },
        "required": [
          "claimType"
        ],
        "additionalProperties": false
      },
      "Issuer": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string"
          },
          "url": {
            "type": "string"
          }
        },
        "required": [
          "did",
          "url"
        ],
        "additionalProperties": false
      },
      "IGetVerifiableCredentialsForSdrArgs": {
        "type": "object",
        "properties": {
          "sdr": {
            "type": "object",
            "properties": {
              "subject": {
                "type": "string"
              },
              "replyUrl": {
                "type": "string"
              },
              "tag": {
                "type": "string"
              },
              "claims": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ICredentialRequestInput"
                }
              },
              "credentials": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": [
              "claims"
            ],
            "additionalProperties": false
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "sdr"
        ],
        "additionalProperties": false
      },
      "ICredentialsForSdr": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string"
          },
          "essential": {
            "type": "boolean"
          },
          "credentialType": {
            "type": "string"
          },
          "credentialContext": {
            "type": "string"
          },
          "claimType": {
            "type": "string"
          },
          "claimValue": {
            "type": "string"
          },
          "issuers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Issuer"
            }
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
        "additionalProperties": false
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
        "additionalProperties": false
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
        "additionalProperties": false
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
        "additionalProperties": false
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
    "/identityManagerAddKey": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
        "operationId": "identityManagerGetIdentities",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {}
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
    "/identityManagerGetIdentity": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
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
    "/handleMessage": {
      "post": {
        "description": "",
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
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Message"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveMessage": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
    "/keyManagerDeleteKey": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
    "/keyManagerGetKey": {
      "post": {
        "description": "",
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
            "description": "",
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
    "/keyManagerImportKey": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
    "/keyManagerSignJWT": {
      "post": {
        "description": "",
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
    "/createVerifiableCredential": {
      "post": {
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
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
        "description": "",
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
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Message"
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