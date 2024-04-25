export const schema = {
  "IResolver": {
    "components": {
      "schemas": {
        "GetDIDComponentArgs": {
          "type": "object",
          "properties": {
            "didDocument": {
              "$ref": "#/components/schemas/DIDDocument",
              "description": "the DID document from which to extract the fragment. This MUST be the document resolved by  {@link  IResolver.resolveDid }"
            },
            "didUrl": {
              "type": "string",
              "description": "The DID URI that needs to be dereferenced. This should refer to the subsection by #fragment.\n\nExample: did:example:identifier#controller"
            },
            "section": {
              "$ref": "#/components/schemas/DIDDocumentSection",
              "description": "Optional. The section of the DID document where to search for the fragment. Example 'keyAgreement', or 'assertionMethod', or 'authentication', etc"
            }
          },
          "required": [
            "didDocument",
            "didUrl"
          ],
          "description": "Input arguments for  {@link IResolver.getDIDComponentById | getDIDComponentById }"
        },
        "DIDDocument": {
          "type": "object",
          "properties": {
            "authentication": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "assertionMethod": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "keyAgreement": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "capabilityInvocation": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "capabilityDelegation": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "@context": {
              "anyOf": [
                {
                  "type": "string",
                  "const": "https://www.w3.org/ns/did/v1"
                },
                {
                  "type": "string"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "alsoKnownAs": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "controller": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            },
            "verificationMethod": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "service": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Service"
              }
            },
            "publicKey": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "deprecated": true
            }
          },
          "required": [
            "id"
          ],
          "description": "Represents a DID document."
        },
        "VerificationMethod": {
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
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "blockchainAccountId": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "conditionOr": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionAnd": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "threshold": {
              "type": "number"
            },
            "conditionThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionWeightedThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              }
            },
            "conditionDelegated": {
              "type": "string"
            },
            "relationshipParent": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipChild": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipSibling": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility."
        },
        "JsonWebKey": {
          "type": "object",
          "properties": {
            "alg": {
              "type": "string"
            },
            "crv": {
              "type": "string"
            },
            "e": {
              "type": "string"
            },
            "ext": {
              "type": "boolean"
            },
            "key_ops": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "kid": {
              "type": "string"
            },
            "kty": {
              "type": "string"
            },
            "n": {
              "type": "string"
            },
            "use": {
              "type": "string"
            },
            "x": {
              "type": "string"
            },
            "y": {
              "type": "string"
            }
          },
          "required": [
            "kty"
          ],
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents."
        },
        "ConditionWeightedThreshold": {
          "type": "object",
          "properties": {
            "condition": {
              "$ref": "#/components/schemas/VerificationMethod"
            },
            "weight": {
              "type": "number"
            }
          },
          "required": [
            "condition",
            "weight"
          ]
        },
        "Service": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  }
                }
              ]
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } ."
        },
        "ServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents an endpoint of a Service entry in a DID document."
        },
        "DIDDocumentSection": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/KeyCapabilitySection"
            },
            {
              "type": "string",
              "const": "verificationMethod"
            },
            {
              "type": "string",
              "const": "publicKey"
            },
            {
              "type": "string",
              "const": "service"
            }
          ],
          "description": "Refers to a section of a DID document. Either the list of verification methods or services or one of the verification relationships.\n\nSee  {@link https://www.w3.org/TR/did-core/#verification-relationships | verification relationships }"
        },
        "KeyCapabilitySection": {
          "type": "string",
          "enum": [
            "authentication",
            "assertionMethod",
            "keyAgreement",
            "capabilityInvocation",
            "capabilityDelegation"
          ],
          "description": "Represents the Verification Relationship between a DID subject and a Verification Method."
        },
        "DIDDocComponent": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerificationMethod"
            },
            {
              "$ref": "#/components/schemas/ServiceEndpoint"
            }
          ],
          "description": "Return type of  {@link IResolver.getDIDComponentById | getDIDComponentById }  represents a `VerificationMethod` or a `ServiceEndpoint` entry from a  {@link did-resolver#DIDDocument | DIDDocument }"
        },
        "ResolveDidArgs": {
          "type": "object",
          "properties": {
            "didUrl": {
              "type": "string",
              "description": "DID URL"
            },
            "options": {
              "$ref": "#/components/schemas/DIDResolutionOptions",
              "description": "DID resolution options that will be passed to the method specific resolver. See: https://w3c.github.io/did-spec-registries/#did-resolution-input-metadata See: https://www.w3.org/TR/did-core/#did-resolution-options"
            }
          },
          "required": [
            "didUrl"
          ],
          "description": "Input arguments for  {@link IResolver.resolveDid | resolveDid }"
        },
        "DIDResolutionOptions": {
          "type": "object",
          "properties": {
            "accept": {
              "type": "string"
            }
          },
          "description": "Describes the options forwarded to the resolver when executing a  {@link  Resolvable.resolve }  operation."
        },
        "DIDResolutionResult": {
          "type": "object",
          "properties": {
            "@context": {
              "anyOf": [
                {
                  "type": "string",
                  "const": "https://w3id.org/did-resolution/v1"
                },
                {
                  "type": "string"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            },
            "didResolutionMetadata": {
              "$ref": "#/components/schemas/DIDResolutionMetadata"
            },
            "didDocument": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/DIDDocument"
                },
                {
                  "type": "null"
                }
              ]
            },
            "didDocumentMetadata": {
              "$ref": "#/components/schemas/DIDDocumentMetadata"
            }
          },
          "required": [
            "didResolutionMetadata",
            "didDocument",
            "didDocumentMetadata"
          ],
          "description": "Defines the result of a DID resolution operation."
        },
        "DIDResolutionMetadata": {
          "type": "object",
          "properties": {
            "contentType": {
              "type": "string"
            },
            "error": {
              "type": "string"
            }
          },
          "description": "Encapsulates the resolution metadata resulting from a  {@link  Resolvable.resolve }  operation."
        },
        "DIDDocumentMetadata": {
          "type": "object",
          "properties": {
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "deactivated": {
              "type": "boolean"
            },
            "versionId": {
              "type": "string"
            },
            "nextUpdate": {
              "type": "string"
            },
            "nextVersionId": {
              "type": "string"
            },
            "equivalentId": {
              "type": "string"
            },
            "canonicalId": {
              "type": "string"
            }
          },
          "description": "Represents metadata about the DID document resulting from a  {@link  Resolvable.resolve }  operation."
        }
      },
      "methods": {
        "getDIDComponentById": {
          "description": "Dereferences a DID URL fragment and returns the corresponding DID document entry.",
          "arguments": {
            "$ref": "#/components/schemas/GetDIDComponentArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/DIDDocComponent"
          }
        },
        "resolveDid": {
          "description": "Resolves DID and returns DID Resolution Result",
          "arguments": {
            "$ref": "#/components/schemas/ResolveDidArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/DIDResolutionResult"
          }
        }
      }
    }
  },
  "IKeyManager": {
    "components": {
      "schemas": {
        "IKeyManagerCreateArgs": {
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
              "$ref": "#/components/schemas/KeyMetadata",
              "description": "Optional. Key meta data"
            }
          },
          "required": [
            "type",
            "kms"
          ],
          "description": "Input arguments for  {@link IKeyManager.keyManagerCreate | keyManagerCreate }"
        },
        "TKeyType": {
          "type": "string",
          "enum": [
            "Ed25519",
            "Secp256k1",
            "Secp256r1",
            "X25519",
            "Bls12381G1",
            "Bls12381G2"
          ],
          "description": "Cryptographic key type."
        },
        "KeyMetadata": {
          "type": "object",
          "properties": {
            "algorithms": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TAlg"
              }
            }
          },
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management."
        },
        "TAlg": {
          "type": "string",
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key."
        },
        "ManagedKeyInfo": {
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
            "meta": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "description": "Represents information about a managed key. Private or secret key material is NOT present."
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerDecryptJWE | keyManagerDecryptJWE }"
        },
        "IKeyManagerDeleteArgs": {
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerDelete | keyManagerDelete }"
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
                  "anyOf": [
                    {
                      "$ref": "#/components/schemas/KeyMetadata"
                    },
                    {
                      "type": "null"
                    }
                  ],
                  "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
                }
              },
              "required": [
                "kid",
                "type",
                "publicKeyHex"
              ],
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE }"
        },
        "IKeyManagerGetArgs": {
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerGet | keyManagerGet }"
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "description": "Cryptographic key, usually managed by the current Veramo instance."
        },
        "MinimalImportableKey": {
          "$ref": "#/components/schemas/RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>",
          "description": "Represents the properties required to import a key."
        },
        "RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>": {
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "description": "Represents an object type where a subset of keys are required and everything else is optional."
        },
        "IKeyManagerSharedSecretArgs": {
          "type": "object",
          "properties": {
            "secretKeyRef": {
              "type": "string",
              "description": "The secret key handle (`kid`) as returned by  {@link IKeyManager.keyManagerCreate | keyManagerCreate }"
            },
            "publicKey": {
              "type": "object",
              "properties": {
                "publicKeyHex": {
                  "type": "string",
                  "description": "Public key"
                },
                "type": {
                  "$ref": "#/components/schemas/TKeyType",
                  "description": "Key type"
                }
              },
              "required": [
                "publicKeyHex",
                "type"
              ],
              "description": "The public key of the other party. The `type` of key MUST be compatible with the type referenced by `secretKeyRef`"
            }
          },
          "required": [
            "secretKeyRef",
            "publicKey"
          ],
          "description": "Input arguments for  {@link IKeyManager.keyManagerSharedSecret | keyManagerSharedSecret }"
        },
        "IKeyManagerSignArgs": {
          "type": "object",
          "properties": {
            "keyRef": {
              "type": "string",
              "description": "The key handle, as returned during `keyManagerCreateKey`"
            },
            "algorithm": {
              "type": "string",
              "description": "The algorithm to use for signing. This must be one of the algorithms supported by the KMS for this key type.\n\nThe algorithm used here should match one of the names listed in `IKey.meta.algorithms`"
            },
            "data": {
              "type": "string",
              "description": "Data to sign"
            },
            "encoding": {
              "type": "string",
              "enum": [
                "utf-8",
                "base16",
                "base64",
                "hex"
              ],
              "description": "If the data is a \"string\" then you can specify which encoding is used. Default is \"utf-8\""
            }
          },
          "required": [
            "keyRef",
            "data"
          ],
          "description": "Input arguments for  {@link IKeyManager.keyManagerSign | keyManagerSign }"
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerSignEthTX | keyManagerSignEthTX }"
        },
        "IKeyManagerSignJWTArgs": {
          "type": "object",
          "properties": {
            "kid": {
              "type": "string",
              "description": "Key ID"
            },
            "data": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "object",
                  "properties": {
                    "BYTES_PER_ELEMENT": {
                      "type": "number"
                    },
                    "buffer": {
                      "anyOf": [
                        {
                          "type": "object",
                          "properties": {
                            "byteLength": {
                              "type": "number"
                            }
                          },
                          "required": [
                            "byteLength"
                          ]
                        },
                        {}
                      ]
                    },
                    "byteLength": {
                      "type": "number"
                    },
                    "byteOffset": {
                      "type": "number"
                    },
                    "length": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "BYTES_PER_ELEMENT",
                    "buffer",
                    "byteLength",
                    "byteOffset",
                    "length"
                  ],
                  "additionalProperties": {
                    "type": "number"
                  }
                }
              ],
              "description": "Data to sign"
            }
          },
          "required": [
            "kid",
            "data"
          ],
          "description": "Input arguments for  {@link IKeyManager.keyManagerSignJWT | keyManagerSignJWT }"
        }
      },
      "methods": {
        "keyManagerCreate": {
          "description": "Creates and returns a new key",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerCreateArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/ManagedKeyInfo"
          }
        },
        "keyManagerDecryptJWE": {
          "description": "Decrypts data This API may change without a BREAKING CHANGE notice.",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerDecryptJWEArgs"
          },
          "returnType": {
            "type": "string"
          }
        },
        "keyManagerDelete": {
          "description": "Deletes a key",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerDeleteArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
        "keyManagerEncryptJWE": {
          "description": "Encrypts data This API may change without a BREAKING CHANGE notice.",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerEncryptJWEArgs"
          },
          "returnType": {
            "type": "string"
          }
        },
        "keyManagerGet": {
          "description": "Returns an existing key",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerGetArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IKey"
          }
        },
        "keyManagerGetKeyManagementSystems": {
          "description": "Lists available key management systems",
          "arguments": {
            "type": "object"
          },
          "returnType": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "keyManagerImport": {
          "description": "Imports a created key",
          "arguments": {
            "$ref": "#/components/schemas/MinimalImportableKey"
          },
          "returnType": {
            "$ref": "#/components/schemas/ManagedKeyInfo"
          }
        },
        "keyManagerSharedSecret": {
          "description": "Compute a shared secret with the public key of another party.",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerSharedSecretArgs"
          },
          "returnType": {
            "type": "string"
          }
        },
        "keyManagerSign": {
          "description": "Generates a signature according to the algorithm specified.",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerSignArgs"
          },
          "returnType": {
            "type": "string"
          }
        },
        "keyManagerSignEthTX": {
          "description": "Signs Ethereum transaction",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerSignEthTXArgs"
          },
          "returnType": {
            "type": "string"
          }
        },
        "keyManagerSignJWT": {
          "description": "Signs JWT",
          "arguments": {
            "$ref": "#/components/schemas/IKeyManagerSignJWTArgs"
          },
          "returnType": {
            "type": "string"
          }
        }
      }
    }
  },
  "IDIDManager": {
    "components": {
      "schemas": {
        "IDIDManagerAddKeyArgs": {
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
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "required": [
            "did",
            "key"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerAddKey | didManagerAddKey }"
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "description": "Cryptographic key, usually managed by the current Veramo instance."
        },
        "TKeyType": {
          "type": "string",
          "enum": [
            "Ed25519",
            "Secp256k1",
            "Secp256r1",
            "X25519",
            "Bls12381G1",
            "Bls12381G2"
          ],
          "description": "Cryptographic key type."
        },
        "KeyMetadata": {
          "type": "object",
          "properties": {
            "algorithms": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TAlg"
              }
            }
          },
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management."
        },
        "TAlg": {
          "type": "string",
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key."
        },
        "IDIDManagerAddServiceArgs": {
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
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "required": [
            "did",
            "service"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerAddService | didManagerAddService }"
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  }
                }
              ],
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
          "description": "Identifier service"
        },
        "IServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents a service endpoint URL or a map of URLs"
        },
        "IDIDManagerCreateArgs": {
          "type": "object",
          "properties": {
            "alias": {
              "type": "string",
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Optional. Identifier provider"
            },
            "kms": {
              "type": "string",
              "description": "Optional. Key Management System"
            },
            "options": {
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "description": "Input arguments for  {@link IDIDManager.didManagerCreate | didManagerCreate }"
        },
        "IIdentifier": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Decentralized identifier"
            },
            "alias": {
              "type": "string",
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Identifier provider name"
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
            "keys",
            "services"
          ],
          "description": "Identifier interface"
        },
        "IDIDManagerDeleteArgs": {
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
          "description": "Input arguments for  {@link IDIDManager.didManagerDelete | didManagerDelete }"
        },
        "IDIDManagerFindArgs": {
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
          "description": "Input arguments for  {@link IDIDManager.didManagerFind | didManagerFind }"
        },
        "IDIDManagerGetArgs": {
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
          "description": "Input arguments for  {@link IDIDManager.didManagerGet | didManagerGet }"
        },
        "IDIDManagerGetByAliasArgs": {
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
          "description": "Input arguments for  {@link IDIDManager.didManagerGetByAlias | didManagerGetByAlias }"
        },
        "IDIDManagerGetOrCreateArgs": {
          "type": "object",
          "properties": {
            "alias": {
              "type": "string",
              "description": "Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Optional. Identifier provider"
            },
            "kms": {
              "type": "string",
              "description": "Optional. Key Management System"
            },
            "options": {
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "required": [
            "alias"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerGetOrCreate | didManagerGetOrCreate }"
        },
        "MinimalImportableIdentifier": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Decentralized identifier"
            },
            "alias": {
              "type": "string",
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Identifier provider name"
            },
            "controllerKeyId": {
              "type": "string",
              "description": "Controller key id"
            },
            "keys": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/MinimalImportableKey"
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
            "keys",
            "provider"
          ],
          "description": "Represents the minimum amount of information needed to import an  {@link  IIdentifier } ."
        },
        "MinimalImportableKey": {
          "$ref": "#/components/schemas/RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>",
          "description": "Represents the properties required to import a key."
        },
        "RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>": {
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "description": "Represents an object type where a subset of keys are required and everything else is optional."
        },
        "IDIDManagerRemoveKeyArgs": {
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
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "required": [
            "did",
            "kid"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerRemoveKey | didManagerRemoveKey }"
        },
        "IDIDManagerRemoveServiceArgs": {
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
              "type": "object",
              "description": "Optional. Identifier provider specific options"
            }
          },
          "required": [
            "did",
            "id"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerRemoveService | didManagerRemoveService }"
        },
        "IDIDManagerSetAliasArgs": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Required. DID"
            },
            "alias": {
              "type": "string",
              "description": "Required. Identifier alias"
            }
          },
          "required": [
            "did",
            "alias"
          ],
          "description": "Input arguments for  {@link IDIDManager.didManagerSetAlias | didManagerSetAlias }"
        },
        "IDIDManagerUpdateArgs": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Required. DID"
            },
            "document": {
              "type": "object",
              "properties": {
                "@context": {
                  "anyOf": [
                    {
                      "type": "object",
                      "properties": {}
                    },
                    {
                      "type": "string"
                    },
                    {
                      "allOf": [
                        {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        {
                          "type": "object",
                          "properties": {}
                        }
                      ]
                    }
                  ]
                },
                "id": {
                  "type": "string"
                },
                "alsoKnownAs": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "controller": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "allOf": [
                        {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        {
                          "type": "object",
                          "properties": {}
                        }
                      ]
                    }
                  ]
                },
                "verificationMethod": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/VerificationMethod"
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "service": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Service"
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "publicKey": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/VerificationMethod"
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ],
                  "deprecated": true
                },
                "authentication": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "assertionMethod": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "keyAgreement": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "capabilityInvocation": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                },
                "capabilityDelegation": {
                  "allOf": [
                    {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      }
                    },
                    {
                      "type": "object",
                      "properties": {}
                    }
                  ]
                }
              },
              "description": "Required"
            },
            "options": {
              "type": "object",
              "description": "Identifier provider specific options."
            }
          },
          "required": [
            "did",
            "document"
          ],
          "description": "The arguments necessary to perform a full DID document update for a DID."
        },
        "VerificationMethod": {
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
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "blockchainAccountId": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "conditionOr": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionAnd": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "threshold": {
              "type": "number"
            },
            "conditionThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionWeightedThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              }
            },
            "conditionDelegated": {
              "type": "string"
            },
            "relationshipParent": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipChild": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipSibling": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility."
        },
        "JsonWebKey": {
          "type": "object",
          "properties": {
            "alg": {
              "type": "string"
            },
            "crv": {
              "type": "string"
            },
            "e": {
              "type": "string"
            },
            "ext": {
              "type": "boolean"
            },
            "key_ops": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "kid": {
              "type": "string"
            },
            "kty": {
              "type": "string"
            },
            "n": {
              "type": "string"
            },
            "use": {
              "type": "string"
            },
            "x": {
              "type": "string"
            },
            "y": {
              "type": "string"
            }
          },
          "required": [
            "kty"
          ],
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents."
        },
        "ConditionWeightedThreshold": {
          "type": "object",
          "properties": {
            "condition": {
              "$ref": "#/components/schemas/VerificationMethod"
            },
            "weight": {
              "type": "number"
            }
          },
          "required": [
            "condition",
            "weight"
          ]
        },
        "Service": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  }
                }
              ]
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } ."
        },
        "ServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents an endpoint of a Service entry in a DID document."
        }
      },
      "methods": {
        "didManagerAddKey": {
          "description": "Adds a key to a DID Document",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerAddKeyArgs"
          },
          "returnType": {
            "type": "object"
          }
        },
        "didManagerAddService": {
          "description": "Adds a service to a DID Document",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerAddServiceArgs"
          },
          "returnType": {
            "type": "object"
          }
        },
        "didManagerCreate": {
          "description": "Creates and returns a new identifier",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerCreateArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        },
        "didManagerDelete": {
          "description": "Deletes identifier",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerDeleteArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
        "didManagerFind": {
          "description": "Returns a list of managed identifiers",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerFindArgs"
          },
          "returnType": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/IIdentifier"
            }
          }
        },
        "didManagerGet": {
          "description": "Returns a specific identifier",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerGetArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        },
        "didManagerGetByAlias": {
          "description": "Returns a specific identifier by alias",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerGetByAliasArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        },
        "didManagerGetOrCreate": {
          "description": "Returns an existing identifier or creates a new one for a specific alias",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerGetOrCreateArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        },
        "didManagerGetProviders": {
          "description": "Returns a list of available identifier providers",
          "arguments": {
            "type": "object"
          },
          "returnType": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "didManagerImport": {
          "description": "Imports identifier",
          "arguments": {
            "$ref": "#/components/schemas/MinimalImportableIdentifier"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        },
        "didManagerRemoveKey": {
          "description": "Removes a key from a DID Document",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerRemoveKeyArgs"
          },
          "returnType": {
            "type": "object"
          }
        },
        "didManagerRemoveService": {
          "description": "Removes a service from a DID Document",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerRemoveServiceArgs"
          },
          "returnType": {
            "type": "object"
          }
        },
        "didManagerSetAlias": {
          "description": "Sets identifier alias",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerSetAliasArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
        "didManagerUpdate": {
          "description": "Updates the DID document of a managed ",
          "arguments": {
            "$ref": "#/components/schemas/IDIDManagerUpdateArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IIdentifier"
          }
        }
      }
    }
  },
  "IDataStore": {
    "components": {
      "schemas": {
        "IDataStoreDeleteMessageArgs": {
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
          "description": "Input arguments for  {@link IDataStore.dataStoreDeleteMessage | dataStoreDeleteMessage }"
        },
        "IDataStoreDeleteVerifiableCredentialArgs": {
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
          "description": "Input arguments for  {@link IDataStoreDeleteVerifiableCredentialArgs | IDataStoreDeleteVerifiableCredentialArgs }"
        },
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
          "description": "Input arguments for  {@link IDataStore.dataStoreGetMessage | dataStoreGetMessage }"
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
                  "type": "object"
                },
                {
                  "type": "null"
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
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  }
                },
                {
                  "type": "null"
                }
              ],
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
            },
            "attachments": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "description": "Optional. Array of generic attachments"
            },
            "returnRoute": {
              "type": "string",
              "description": "Optional. Signal how to reuse transport for return messages"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations."
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
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "VerifiablePresentation": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }"
        },
        "W3CVerifiableCredential": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats }"
        },
        "CompactJWT": {
          "type": "string",
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\""
        },
        "IMessageAttachment": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            }
          },
          "required": [
            "data"
          ],
          "description": "Message attachment"
        },
        "IMessageAttachmentData": {
          "type": "object",
          "properties": {
            "jws": {},
            "hash": {
              "type": "string"
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "base64": {
              "type": "string"
            },
            "json": {}
          },
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreGetVerifiableCredential | dataStoreGetVerifiableCredential }"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreGetVerifiablePresentation | dataStoreGetVerifiablePresentation }"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage }"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential }"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation }"
        }
      },
      "methods": {
        "dataStoreDeleteMessage": {
          "description": "Deletes message from the data store",
          "arguments": {
            "$ref": "#/components/schemas/IDataStoreDeleteMessageArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
        "dataStoreDeleteVerifiableCredential": {
          "description": "Deletes verifiable credential from the data store",
          "arguments": {
            "$ref": "#/components/schemas/IDataStoreDeleteVerifiableCredentialArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
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
  },
  "IDataStoreORM": {
    "components": {
      "schemas": {
        "FindIdentifiersArgs": {
          "$ref": "#/components/schemas/FindArgs-TIdentifiersColumns",
          "description": "The filter that can be used to find  {@link  IIdentifier } s in the data store."
        },
        "FindArgs-TIdentifiersColumns": {
          "type": "object",
          "properties": {
            "where": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Where-TIdentifiersColumns"
              },
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND."
            },
            "order": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Order-TIdentifiersColumns"
              },
              "description": "Sorts the results according to the given array of column priorities."
            },
            "skip": {
              "type": "number",
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM }  query result."
            },
            "take": {
              "type": "number",
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM }  query."
            }
          },
          "description": "Represents an  {@link  IDataStoreORM }  Query."
        },
        "Where-TIdentifiersColumns": {
          "type": "object",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TIdentifiersColumns"
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
          "description": "Represents a WHERE predicate for a  {@link  FindArgs }  query. In situations where multiple WHERE predicates are present, they are combined with AND."
        },
        "TIdentifiersColumns": {
          "type": "string",
          "enum": [
            "did",
            "alias",
            "provider"
          ],
          "description": "The columns that can be queried for an  {@link  IIdentifier }",
          "deprecated": "This type will be removed in future versions of this plugin interface."
        },
        "Order-TIdentifiersColumns": {
          "type": "object",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TIdentifiersColumns"
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
          "description": "Represents the sort order of results from a  {@link  FindArgs }  query."
        },
        "PartialIdentifier": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Decentralized identifier"
            },
            "alias": {
              "type": "string",
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Identifier provider name"
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
          "description": "The result of a  {@link  IDataStoreORM.dataStoreORMGetIdentifiers }  query."
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "description": "Cryptographic key, usually managed by the current Veramo instance."
        },
        "TKeyType": {
          "type": "string",
          "enum": [
            "Ed25519",
            "Secp256k1",
            "Secp256r1",
            "X25519",
            "Bls12381G1",
            "Bls12381G2"
          ],
          "description": "Cryptographic key type."
        },
        "KeyMetadata": {
          "type": "object",
          "properties": {
            "algorithms": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TAlg"
              }
            }
          },
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management."
        },
        "TAlg": {
          "type": "string",
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key."
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  }
                }
              ],
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
          "description": "Identifier service"
        },
        "IServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents a service endpoint URL or a map of URLs"
        },
        "FindMessagesArgs": {
          "$ref": "#/components/schemas/FindArgs-TMessageColumns",
          "description": "The filter that can be used to find  {@link  IMessage } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetMessages }"
        },
        "FindArgs-TMessageColumns": {
          "type": "object",
          "properties": {
            "where": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Where-TMessageColumns"
              },
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND."
            },
            "order": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Order-TMessageColumns"
              },
              "description": "Sorts the results according to the given array of column priorities."
            },
            "skip": {
              "type": "number",
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM }  query result."
            },
            "take": {
              "type": "number",
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM }  query."
            }
          },
          "description": "Represents an  {@link  IDataStoreORM }  Query."
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
          "description": "Represents a WHERE predicate for a  {@link  FindArgs }  query. In situations where multiple WHERE predicates are present, they are combined with AND."
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
          ],
          "description": "The columns that can be queried for an  {@link  IMessage } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetMessagesCount }"
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
          "description": "Represents the sort order of results from a  {@link  FindArgs }  query."
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
                  "type": "object"
                },
                {
                  "type": "null"
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
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  }
                },
                {
                  "type": "null"
                }
              ],
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
            },
            "attachments": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "description": "Optional. Array of generic attachments"
            },
            "returnRoute": {
              "type": "string",
              "description": "Optional. Signal how to reuse transport for return messages"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations."
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
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "VerifiablePresentation": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }"
        },
        "W3CVerifiableCredential": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats }"
        },
        "CompactJWT": {
          "type": "string",
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\""
        },
        "IMessageAttachment": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            }
          },
          "required": [
            "data"
          ],
          "description": "Message attachment"
        },
        "IMessageAttachmentData": {
          "type": "object",
          "properties": {
            "jws": {},
            "hash": {
              "type": "string"
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "base64": {
              "type": "string"
            },
            "json": {}
          },
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments"
        },
        "FindCredentialsArgs": {
          "$ref": "#/components/schemas/FindArgs-TCredentialColumns",
          "description": "The filter that can be used to find  {@link  VerifiableCredential } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials }"
        },
        "FindArgs-TCredentialColumns": {
          "type": "object",
          "properties": {
            "where": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Where-TCredentialColumns"
              },
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND."
            },
            "order": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Order-TCredentialColumns"
              },
              "description": "Sorts the results according to the given array of column priorities."
            },
            "skip": {
              "type": "number",
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM }  query result."
            },
            "take": {
              "type": "number",
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM }  query."
            }
          },
          "description": "Represents an  {@link  IDataStoreORM }  Query."
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
          "description": "Represents a WHERE predicate for a  {@link  FindArgs }  query. In situations where multiple WHERE predicates are present, they are combined with AND."
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
            "issuanceDate",
            "hash"
          ],
          "description": "The columns that can be searched for a  {@link  VerifiableCredential } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsCount }"
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
          "description": "Represents the sort order of results from a  {@link  FindArgs }  query."
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
          "description": "Represents the result of a Query for  {@link  VerifiableCredential } s\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims }"
        },
        "FindClaimsArgs": {
          "$ref": "#/components/schemas/FindArgs-TClaimsColumns",
          "description": "The filter that can be used to find  {@link  VerifiableCredential } s in the data store, based on the types and values of their claims.\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims }"
        },
        "FindArgs-TClaimsColumns": {
          "type": "object",
          "properties": {
            "where": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Where-TClaimsColumns"
              },
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND."
            },
            "order": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Order-TClaimsColumns"
              },
              "description": "Sorts the results according to the given array of column priorities."
            },
            "skip": {
              "type": "number",
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM }  query result."
            },
            "take": {
              "type": "number",
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM }  query."
            }
          },
          "description": "Represents an  {@link  IDataStoreORM }  Query."
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
          "description": "Represents a WHERE predicate for a  {@link  FindArgs }  query. In situations where multiple WHERE predicates are present, they are combined with AND."
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
          ],
          "description": "The columns that can be searched for the claims of a  {@link  VerifiableCredential } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaimsCount }"
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
          "description": "Represents the sort order of results from a  {@link  FindArgs }  query."
        },
        "FindPresentationsArgs": {
          "$ref": "#/components/schemas/FindArgs-TPresentationColumns",
          "description": "The filter that can be used to find  {@link  VerifiablePresentation } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations }"
        },
        "FindArgs-TPresentationColumns": {
          "type": "object",
          "properties": {
            "where": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Where-TPresentationColumns"
              },
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND."
            },
            "order": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Order-TPresentationColumns"
              },
              "description": "Sorts the results according to the given array of column priorities."
            },
            "skip": {
              "type": "number",
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM }  query result."
            },
            "take": {
              "type": "number",
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM }  query."
            }
          },
          "description": "Represents an  {@link  IDataStoreORM }  Query."
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
          "description": "Represents a WHERE predicate for a  {@link  FindArgs }  query. In situations where multiple WHERE predicates are present, they are combined with AND."
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
          ],
          "description": "The columns that can be searched for a  {@link  VerifiablePresentation } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentationsCount }"
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
          "description": "Represents the sort order of results from a  {@link  FindArgs }  query."
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
          "description": "Represents the result of a Query for  {@link  VerifiablePresentation } s\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations }"
        }
      },
      "methods": {
        "dataStoreORMGetIdentifiers": {
          "description": "Tries to obtain a list of ",
          "arguments": {
            "$ref": "#/components/schemas/FindIdentifiersArgs"
          },
          "returnType": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PartialIdentifier"
            }
          }
        },
        "dataStoreORMGetIdentifiersCount": {
          "description": "Tries to obtain a count of ",
          "arguments": {
            "$ref": "#/components/schemas/FindIdentifiersArgs"
          },
          "returnType": {
            "type": "number"
          }
        },
        "dataStoreORMGetMessages": {
          "description": "Returns a list of ",
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
          "description": "Returns a count of ",
          "arguments": {
            "$ref": "#/components/schemas/FindMessagesArgs"
          },
          "returnType": {
            "type": "number"
          }
        },
        "dataStoreORMGetVerifiableCredentials": {
          "description": "Returns a list of ",
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
          "description": "Returns a list of ",
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
          "description": "Returns a count of ",
          "arguments": {
            "$ref": "#/components/schemas/FindClaimsArgs"
          },
          "returnType": {
            "type": "number"
          }
        },
        "dataStoreORMGetVerifiableCredentialsCount": {
          "description": "Returns a count of ",
          "arguments": {
            "$ref": "#/components/schemas/FindCredentialsArgs"
          },
          "returnType": {
            "type": "number"
          }
        },
        "dataStoreORMGetVerifiablePresentations": {
          "description": "Returns a list of ",
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
          "description": "Returns a count of ",
          "arguments": {
            "$ref": "#/components/schemas/FindPresentationsArgs"
          },
          "returnType": {
            "type": "number"
          }
        }
      }
    }
  },
  "IMessageHandler": {
    "components": {
      "schemas": {
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
              "description": "Optional. If set to `true`, the message will be saved using  {@link  @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage }  <p/><p/>",
              "deprecated": "Please call {@link @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} after\nhandling the message and determining that it must be saved."
            }
          },
          "required": [
            "raw"
          ],
          "description": "Input arguments for  {@link IMessageHandler.handleMessage | handleMessage }"
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
                  "type": "object"
                },
                {
                  "type": "null"
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
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  }
                },
                {
                  "type": "null"
                }
              ],
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
            },
            "attachments": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "description": "Optional. Array of generic attachments"
            },
            "returnRoute": {
              "type": "string",
              "description": "Optional. Signal how to reuse transport for return messages"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations."
        },
        "VerifiableCredential": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "VerifiablePresentation": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }"
        },
        "W3CVerifiableCredential": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats }"
        },
        "CompactJWT": {
          "type": "string",
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\""
        },
        "IMessageAttachment": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            }
          },
          "required": [
            "data"
          ],
          "description": "Message attachment"
        },
        "IMessageAttachmentData": {
          "type": "object",
          "properties": {
            "jws": {},
            "hash": {
              "type": "string"
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "base64": {
              "type": "string"
            },
            "json": {}
          },
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments"
        }
      },
      "methods": {
        "handleMessage": {
          "description": "Parses a raw message.",
          "arguments": {
            "$ref": "#/components/schemas/IHandleMessageArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IMessage"
          }
        }
      }
    }
  },
  "ICredentialIssuer": {
    "components": {
      "schemas": {
        "ICreateVerifiableCredentialArgs": {
          "type": "object",
          "properties": {
            "resolutionOptions": {
              "type": "object",
              "properties": {
                "publicKeyFormat": {
                  "type": "string"
                },
                "accept": {
                  "type": "string"
                }
              },
              "description": "Options to be passed to the DID resolver."
            },
            "credential": {
              "$ref": "#/components/schemas/CredentialPayload",
              "description": "The JSON payload of the Credential according to the  {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model } \n\nThe signer of the Credential is chosen based on the `issuer.id` property of the `credential`\n\n`@context`, `type` and `issuanceDate` will be added automatically if omitted"
            },
            "save": {
              "type": "boolean",
              "description": "If this parameter is true, the resulting VerifiableCredential is sent to the  {@link  @veramo/core-types#IDataStore | storage plugin }  to be saved.",
              "deprecated": "Please call\n{@link @veramo/core-types#IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential()} to\nsave the credential after creating it."
            },
            "proofFormat": {
              "$ref": "#/components/schemas/ProofFormat",
              "description": "The desired format for the VerifiableCredential to be created."
            },
            "removeOriginalFields": {
              "type": "boolean",
              "description": "Remove payload members during JWT-JSON transformation. Defaults to `true`. See https://www.w3.org/TR/vc-data-model/#jwt-encoding"
            },
            "keyRef": {
              "type": "string",
              "description": "[Optional] The ID of the key that should sign this credential. If this is not specified, the first matching key will be used."
            },
            "fetchRemoteContexts": {
              "type": "boolean",
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`"
            }
          },
          "required": [
            "credential",
            "proofFormat"
          ],
          "additionalProperties": {
            "description": "Any other options that can be forwarded to the lower level libraries"
          },
          "description": "Encapsulates the parameters required to create a  {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential }"
        },
        "CredentialPayload": {
          "type": "object",
          "properties": {
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "expirationDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "issuer"
          ],
          "description": "Used as input when creating Verifiable Credentials"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "DateType": {
          "type": "string",
          "description": "Represents an issuance or expiration date for Credentials / Presentations. This is used as input when creating them."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "ProofFormat": {
          "type": "string",
          "enum": [
            "jwt",
            "lds",
            "EthereumEip712Signature2021"
          ],
          "description": "The type of encoding to be used for the Verifiable Credential or Presentation to be generated.\n\nOnly `jwt` and `lds` is supported at the moment."
        },
        "VerifiableCredential": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "ICreateVerifiablePresentationArgs": {
          "type": "object",
          "properties": {
            "resolutionOptions": {
              "type": "object",
              "properties": {
                "publicKeyFormat": {
                  "type": "string"
                },
                "accept": {
                  "type": "string"
                }
              },
              "description": "Options to be passed to the DID resolver."
            },
            "presentation": {
              "$ref": "#/components/schemas/PresentationPayload",
              "description": "The JSON payload of the Presentation according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model } .\n\nThe signer of the Presentation is chosen based on the `holder` property of the `presentation`\n\n`@context`, `type` and `issuanceDate` will be added automatically if omitted"
            },
            "save": {
              "type": "boolean",
              "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the  {@link  @veramo/core-types#IDataStore | storage plugin }  to be saved. <p/><p/>",
              "deprecated": "Please call\n{@link @veramo/core-types#IDataStore.dataStoreSaveVerifiablePresentation |}   *   dataStoreSaveVerifiablePresentation()} to save the credential after creating it."
            },
            "challenge": {
              "type": "string",
              "description": "Optional (only JWT) string challenge parameter to add to the verifiable presentation."
            },
            "domain": {
              "type": "string",
              "description": "Optional string domain parameter to add to the verifiable presentation."
            },
            "proofFormat": {
              "$ref": "#/components/schemas/ProofFormat",
              "description": "The desired format for the VerifiablePresentation to be created. Currently, only JWT is supported"
            },
            "removeOriginalFields": {
              "type": "boolean",
              "description": "Remove payload members during JWT-JSON transformation. Defaults to `true`. See https://www.w3.org/TR/vc-data-model/#jwt-encoding"
            },
            "keyRef": {
              "type": "string",
              "description": "[Optional] The ID of the key that should sign this presentation. If this is not specified, the first matching key will be used."
            },
            "fetchRemoteContexts": {
              "type": "boolean",
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`"
            }
          },
          "required": [
            "presentation",
            "proofFormat"
          ],
          "additionalProperties": {
            "description": "Any other options that can be forwarded to the lower level libraries"
          },
          "description": "Encapsulates the parameters required to create a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }"
        },
        "PresentationPayload": {
          "type": "object",
          "properties": {
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "expirationDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "holder"
          ],
          "description": "Used as input when creating Verifiable Presentations"
        },
        "W3CVerifiableCredential": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats }"
        },
        "CompactJWT": {
          "type": "string",
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\""
        },
        "VerifiablePresentation": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }"
        },
        "IIdentifier": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "Decentralized identifier"
            },
            "alias": {
              "type": "string",
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system"
            },
            "provider": {
              "type": "string",
              "description": "Identifier provider name"
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
            "keys",
            "services"
          ],
          "description": "Identifier interface"
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/KeyMetadata"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Key metadata. This should be used to determine which algorithms are supported."
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "description": "Cryptographic key, usually managed by the current Veramo instance."
        },
        "TKeyType": {
          "type": "string",
          "enum": [
            "Ed25519",
            "Secp256k1",
            "Secp256r1",
            "X25519",
            "Bls12381G1",
            "Bls12381G2"
          ],
          "description": "Cryptographic key type."
        },
        "KeyMetadata": {
          "type": "object",
          "properties": {
            "algorithms": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TAlg"
              }
            }
          },
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management."
        },
        "TAlg": {
          "type": "string",
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key."
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
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  }
                }
              ],
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
          "description": "Identifier service"
        },
        "IServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents a service endpoint URL or a map of URLs"
        }
      },
      "methods": {
        "createVerifiableCredential": {
          "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
          "arguments": {
            "$ref": "#/components/schemas/ICreateVerifiableCredentialArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/VerifiableCredential"
          }
        },
        "createVerifiablePresentation": {
          "description": "Creates a Verifiable Presentation. The payload, signer and format are chosen based on the ",
          "arguments": {
            "$ref": "#/components/schemas/ICreateVerifiablePresentationArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/VerifiablePresentation"
          }
        },
        "listUsableProofFormats": {
          "description": "Returns a list of supported proof formats.",
          "arguments": {
            "$ref": "#/components/schemas/IIdentifier"
          },
          "returnType": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProofFormat"
            }
          }
        }
      }
    }
  },
  "ICredentialVerifier": {
    "components": {
      "schemas": {
        "IVerifyCredentialArgs": {
          "type": "object",
          "properties": {
            "resolutionOptions": {
              "type": "object",
              "properties": {
                "publicKeyFormat": {
                  "type": "string"
                },
                "accept": {
                  "type": "string"
                }
              },
              "description": "Options to be passed to the DID resolver."
            },
            "credential": {
              "$ref": "#/components/schemas/W3CVerifiableCredential",
              "description": "The Verifiable Credential object according to the  {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model }  or the JWT representation.\n\nThe signer of the Credential is verified based on the `issuer.id` property of the `credential` or the `iss` property of the JWT payload respectively"
            },
            "fetchRemoteContexts": {
              "type": "boolean",
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`"
            },
            "policies": {
              "$ref": "#/components/schemas/VerificationPolicies",
              "description": "Overrides specific aspects of credential verification, where possible."
            }
          },
          "required": [
            "credential"
          ],
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that perform the checks"
          },
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential }"
        },
        "W3CVerifiableCredential": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiableCredential"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats }"
        },
        "VerifiableCredential": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "CompactJWT": {
          "type": "string",
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\""
        },
        "VerificationPolicies": {
          "type": "object",
          "properties": {
            "now": {
              "type": "number",
              "description": "policy to over the now (current time) during the verification check (UNIX time in seconds)"
            },
            "issuanceDate": {
              "type": "boolean",
              "description": "policy to skip the issuanceDate (nbf) timestamp check when set to `false`"
            },
            "expirationDate": {
              "type": "boolean",
              "description": "policy to skip the expirationDate (exp) timestamp check when set to `false`"
            },
            "audience": {
              "type": "boolean",
              "description": "policy to skip the audience check when set to `false`"
            },
            "credentialStatus": {
              "type": "boolean",
              "description": "policy to skip the revocation check (credentialStatus) when set to `false`"
            }
          },
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules that perform the checks"
          },
          "description": "These optional settings can be used to override some default checks that are performed on Presentations during verification."
        },
        "IVerifyResult": {
          "type": "object",
          "properties": {
            "verified": {
              "type": "boolean",
              "description": "This value is used to transmit the result of verification."
            },
            "error": {
              "$ref": "#/components/schemas/IError",
              "description": "Optional Error object for the but currently the machine readable errors are not expored from DID-JWT package to be imported here"
            }
          },
          "required": [
            "verified"
          ],
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that performt the checks"
          },
          "description": "Encapsulates the response object to verifyPresentation method after verifying a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }"
        },
        "IError": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "description": "The details of the error being throw or forwarded"
            },
            "errorCode": {
              "type": "string",
              "description": "The code for the error being throw"
            }
          },
          "description": "An error object, which can contain a code."
        },
        "IVerifyPresentationArgs": {
          "type": "object",
          "properties": {
            "resolutionOptions": {
              "type": "object",
              "properties": {
                "publicKeyFormat": {
                  "type": "string"
                },
                "accept": {
                  "type": "string"
                }
              },
              "description": "Options to be passed to the DID resolver."
            },
            "presentation": {
              "$ref": "#/components/schemas/W3CVerifiablePresentation",
              "description": "The Verifiable Presentation object according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model }  or the JWT representation.\n\nThe signer of the Presentation is verified based on the `holder` property of the `presentation` or the `iss` property of the JWT payload respectively"
            },
            "challenge": {
              "type": "string",
              "description": "Optional (only for JWT) string challenge parameter to verify the verifiable presentation against"
            },
            "domain": {
              "type": "string",
              "description": "Optional (only for JWT) string domain parameter to verify the verifiable presentation against"
            },
            "fetchRemoteContexts": {
              "type": "boolean",
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`"
            },
            "policies": {
              "$ref": "#/components/schemas/VerificationPolicies",
              "description": "Overrides specific aspects of credential verification, where possible."
            }
          },
          "required": [
            "presentation"
          ],
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that perform the checks"
          },
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }"
        },
        "W3CVerifiablePresentation": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/VerifiablePresentation"
            },
            {
              "$ref": "#/components/schemas/CompactJWT"
            }
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof) in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "VerifiablePresentation": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "holder": {
              "type": "string"
            },
            "verifiableCredential": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              }
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "verifier": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }"
        }
      },
      "methods": {
        "verifyCredential": {
          "description": "Verifies a Verifiable Credential JWT, LDS Format or EIP712.",
          "arguments": {
            "$ref": "#/components/schemas/IVerifyCredentialArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IVerifyResult"
          }
        },
        "verifyPresentation": {
          "description": "Verifies a Verifiable Presentation JWT or LDS Format.",
          "arguments": {
            "$ref": "#/components/schemas/IVerifyPresentationArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IVerifyResult"
          }
        }
      }
    }
  },
  "ICredentialPlugin": {
    "components": {
      "schemas": {},
      "methods": {}
    }
  },
  "ICredentialStatus": {
    "components": {
      "schemas": {},
      "methods": {}
    }
  },
  "ICredentialStatusVerifier": {
    "components": {
      "schemas": {
        "ICheckCredentialStatusArgs": {
          "type": "object",
          "properties": {
            "resolutionOptions": {
              "type": "object",
              "properties": {
                "publicKeyFormat": {
                  "type": "string"
                },
                "accept": {
                  "type": "string"
                }
              },
              "description": "Options to be passed to the DID resolver."
            },
            "credential": {
              "$ref": "#/components/schemas/VerifiableCredential",
              "description": "The credential whose status needs to be checked"
            },
            "didDocumentOverride": {
              "$ref": "#/components/schemas/DIDDocument",
              "description": "The DID document of the issuer. This can be used in case the DID Document is already resolver, to avoid a potentially expensive DID resolution operation."
            }
          },
          "required": [
            "credential"
          ],
          "description": "Arguments for calling  {@link ICredentialStatusVerifier.checkCredentialStatus | checkCredentialStatus } .\n\nThe credential whose status should be checked and the DID document of the credential issuer.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "VerifiableCredential": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "DIDDocument": {
          "type": "object",
          "properties": {
            "authentication": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "assertionMethod": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "keyAgreement": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "capabilityInvocation": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "capabilityDelegation": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              }
            },
            "@context": {
              "anyOf": [
                {
                  "type": "string",
                  "const": "https://www.w3.org/ns/did/v1"
                },
                {
                  "type": "string"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "alsoKnownAs": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "controller": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            },
            "verificationMethod": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "service": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Service"
              }
            },
            "publicKey": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "deprecated": true
            }
          },
          "required": [
            "id"
          ],
          "description": "Represents a DID document."
        },
        "VerificationMethod": {
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
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "blockchainAccountId": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "conditionOr": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionAnd": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "threshold": {
              "type": "number"
            },
            "conditionThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              }
            },
            "conditionWeightedThreshold": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              }
            },
            "conditionDelegated": {
              "type": "string"
            },
            "relationshipParent": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipChild": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "relationshipSibling": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility."
        },
        "JsonWebKey": {
          "type": "object",
          "properties": {
            "alg": {
              "type": "string"
            },
            "crv": {
              "type": "string"
            },
            "e": {
              "type": "string"
            },
            "ext": {
              "type": "boolean"
            },
            "key_ops": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "kid": {
              "type": "string"
            },
            "kty": {
              "type": "string"
            },
            "n": {
              "type": "string"
            },
            "use": {
              "type": "string"
            },
            "x": {
              "type": "string"
            },
            "y": {
              "type": "string"
            }
          },
          "required": [
            "kty"
          ],
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents."
        },
        "ConditionWeightedThreshold": {
          "type": "object",
          "properties": {
            "condition": {
              "$ref": "#/components/schemas/VerificationMethod"
            },
            "weight": {
              "type": "number"
            }
          },
          "required": [
            "condition",
            "weight"
          ]
        },
        "Service": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  }
                }
              ]
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } ."
        },
        "ServiceEndpoint": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ],
          "description": "Represents an endpoint of a Service entry in a DID document."
        },
        "CredentialStatus": {
          "type": "object",
          "properties": {
            "revoked": {
              "type": "boolean"
            }
          },
          "required": [
            "revoked"
          ],
          "description": "Represents the result of a status check.\n\nImplementations MUST populate the `revoked` boolean property, but they can return additional metadata that is method specific."
        }
      },
      "methods": {
        "checkCredentialStatus": {
          "description": "Checks the status of a ",
          "arguments": {
            "$ref": "#/components/schemas/ICheckCredentialStatusArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/CredentialStatus"
          }
        }
      }
    }
  },
  "ICredentialStatusManager": {
    "components": {
      "schemas": {
        "CredentialStatusGenerateArgs": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "description": "The credential status type (aka credential status method) to be used in the `credentialStatus` generation."
            }
          },
          "required": [
            "type"
          ],
          "additionalProperties": {
            "description": "Any other options will be forwarded to the credentialStatus method driver"
          },
          "description": "Arguments for generating a `credentialStatus` property for a  {@link  VerifiableCredential } ."
        },
        "CredentialStatusReference": {
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
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }"
        },
        "CredentialStatusUpdateArgs": {
          "type": "object",
          "properties": {
            "vc": {
              "$ref": "#/components/schemas/VerifiableCredential",
              "description": "The verifiable credential whose status will be updated."
            },
            "options": {
              "type": "object",
              "description": "Options that will be forwarded to the credentialStatus method specific manager."
            }
          },
          "required": [
            "vc"
          ],
          "description": "Input arguments for  {@link ICredentialStatusManager.credentialStatusUpdate | credentialStatusUpdate }"
        },
        "VerifiableCredential": {
          "type": "object",
          "properties": {
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "type": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "string"
                }
              ]
            },
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "issuanceDate": {
              "type": "string"
            },
            "expirationDate": {
              "type": "string"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }"
        },
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
        },
        "IssuerType": {
          "anyOf": [
            {
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
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "CredentialSubject": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }"
        },
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              }
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        }
      },
      "methods": {
        "credentialStatusGenerate": {
          "description": "Generates a ",
          "arguments": {
            "$ref": "#/components/schemas/CredentialStatusGenerateArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/CredentialStatusReference"
          }
        },
        "credentialStatusTypes": {
          "description": "List all the credential status types (methods) available in the current agent instance.",
          "arguments": {
            "type": "object"
          },
          "returnType": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "credentialStatusUpdate": {
          "description": "Changes the status of an existing ",
          "arguments": {
            "$ref": "#/components/schemas/CredentialStatusUpdateArgs"
          },
          "returnType": {
            "type": "object"
          }
        }
      }
    }
  }
}