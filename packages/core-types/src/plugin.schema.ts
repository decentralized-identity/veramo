export const schema = {
  "IResolver": {
    "components": {
      "schemas": {
        "ConditionWeightedThreshold": {
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
          ],
          "type": "object"
        },
        "DIDDocument": {
          "description": "Represents a DID document.",
          "properties": {
            "@context": {
              "anyOf": [
                {
                  "const": "https://www.w3.org/ns/did/v1",
                  "type": "string"
                },
                {
                  "type": "string"
                },
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              ]
            },
            "alsoKnownAs": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "assertionMethod": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "authentication": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "capabilityDelegation": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "capabilityInvocation": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "controller": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "keyAgreement": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "publicKey": {
              "deprecated": true,
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "service": {
              "items": {
                "$ref": "#/components/schemas/Service"
              },
              "type": "array"
            },
            "verificationMethod": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        "DIDDocumentSection": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/KeyCapabilitySection"
            },
            {
              "const": "verificationMethod",
              "type": "string"
            },
            {
              "const": "publicKey",
              "type": "string"
            },
            {
              "const": "service",
              "type": "string"
            }
          ],
          "description": "Refers to a section of a DID document. Either the list of verification methods or services or one of the verification relationships.\n\nSee  {@link https://www.w3.org/TR/did-core/#verification-relationships | verification relationships }"
        },
        "GetDIDComponentArgs": {
          "description": "Input arguments for  {@link IResolver.getDIDComponentById | getDIDComponentById }",
          "properties": {
            "didDocument": {
              "$ref": "#/components/schemas/DIDDocument",
              "description": "the DID document from which to extract the fragment. This MUST be the document resolved by  {@link  IResolver.resolveDid  }"
            },
            "didUrl": {
              "description": "The DID URI that needs to be dereferenced. This should refer to the subsection by #fragment.\n\nExample: did:example:identifier#controller",
              "type": "string"
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
          "type": "object"
        },
        "JsonWebKey": {
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents.",
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
              "items": {
                "type": "string"
              },
              "type": "array"
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
          "type": "object"
        },
        "KeyCapabilitySection": {
          "description": "Represents the Verification Relationship between a DID subject and a Verification Method.",
          "enum": [
            "authentication",
            "assertionMethod",
            "keyAgreement",
            "capabilityInvocation",
            "capabilityDelegation"
          ],
          "type": "string"
        },
        "Service": {
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } .",
          "properties": {
            "id": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  },
                  "type": "array"
                }
              ]
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
        "VerificationMethod": {
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility.",
          "properties": {
            "blockchainAccountId": {
              "type": "string"
            },
            "conditionAnd": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionDelegated": {
              "type": "string"
            },
            "conditionOr": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionThreshold": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionWeightedThreshold": {
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              },
              "type": "array"
            },
            "controller": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "relationshipChild": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipParent": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipSibling": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "threshold": {
              "type": "number"
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "type": "object"
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
        "DIDResolutionOptions": {
          "description": "Describes the options forwarded to the resolver when executing a  {@link  Resolvable.resolve  }  operation.",
          "properties": {
            "accept": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "ResolveDidArgs": {
          "description": "Input arguments for  {@link IResolver.resolveDid | resolveDid }",
          "properties": {
            "didUrl": {
              "description": "DID URL",
              "type": "string"
            },
            "options": {
              "$ref": "#/components/schemas/DIDResolutionOptions",
              "description": "DID resolution options that will be passed to the method specific resolver. See: https://w3c.github.io/did-spec-registries/#did-resolution-input-metadata See: https://www.w3.org/TR/did-core/#did-resolution-options"
            }
          },
          "required": [
            "didUrl"
          ],
          "type": "object"
        },
        "DIDDocumentMetadata": {
          "description": "Represents metadata about the DID document resulting from a  {@link  Resolvable.resolve  }  operation.",
          "properties": {
            "canonicalId": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "deactivated": {
              "type": "boolean"
            },
            "equivalentId": {
              "type": "string"
            },
            "nextUpdate": {
              "type": "string"
            },
            "nextVersionId": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "versionId": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "DIDResolutionMetadata": {
          "description": "Encapsulates the resolution metadata resulting from a  {@link  Resolvable.resolve  }  operation.",
          "properties": {
            "contentType": {
              "type": "string"
            },
            "error": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "DIDResolutionResult": {
          "description": "Defines the result of a DID resolution operation.",
          "properties": {
            "@context": {
              "anyOf": [
                {
                  "const": "https://w3id.org/did-resolution/v1",
                  "type": "string"
                },
                {
                  "type": "string"
                },
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              ]
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
            },
            "didResolutionMetadata": {
              "$ref": "#/components/schemas/DIDResolutionMetadata"
            }
          },
          "required": [
            "didResolutionMetadata",
            "didDocument",
            "didDocumentMetadata"
          ],
          "type": "object"
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
          "description": "Input arguments for  {@link IKeyManager.keyManagerCreate | keyManagerCreate }",
          "properties": {
            "kid": {
              "description": "Optional. Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
            },
            "meta": {
              "$ref": "#/components/schemas/KeyMetadata",
              "description": "Optional. Key meta data"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "type",
            "kms"
          ],
          "type": "object"
        },
        "KeyMetadata": {
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management.",
          "properties": {
            "algorithms": {
              "items": {
                "$ref": "#/components/schemas/TAlg"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "TAlg": {
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType  } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key.",
          "type": "string"
        },
        "TKeyType": {
          "description": "Cryptographic key type.",
          "type": "string"
        },
        "ManagedKeyInfo": {
          "description": "Represents information about a managed key. Private or secret key material is NOT present.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "type": "object"
        },
        "IKeyManagerDecryptJWEArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerDecryptJWE | keyManagerDecryptJWE }",
          "properties": {
            "data": {
              "description": "Encrypted data",
              "type": "string"
            },
            "kid": {
              "description": "Key ID",
              "type": "string"
            }
          },
          "required": [
            "kid",
            "data"
          ],
          "type": "object"
        },
        "IKeyManagerDeleteArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerDelete | keyManagerDelete }",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            }
          },
          "required": [
            "kid"
          ],
          "type": "object"
        },
        "IKeyManagerEncryptJWEArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE }",
          "properties": {
            "data": {
              "description": "Data to encrypt",
              "type": "string"
            },
            "kid": {
              "description": "Key ID to use for encryption",
              "type": "string"
            },
            "to": {
              "description": "Recipient key object",
              "properties": {
                "kid": {
                  "description": "Key ID",
                  "type": "string"
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
                },
                "privateKeyHex": {
                  "description": "Optional. Private key",
                  "type": "string"
                },
                "publicKeyHex": {
                  "description": "Public key",
                  "type": "string"
                },
                "type": {
                  "$ref": "#/components/schemas/TKeyType",
                  "description": "Key type"
                }
              },
              "required": [
                "kid",
                "type",
                "publicKeyHex"
              ],
              "type": "object"
            }
          },
          "required": [
            "kid",
            "to",
            "data"
          ],
          "type": "object"
        },
        "IKeyManagerGetArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerGet | keyManagerGet }",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            }
          },
          "required": [
            "kid"
          ],
          "type": "object"
        },
        "IKey": {
          "description": "Cryptographic key, usually managed by the current Veramo instance.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "type": "object"
        },
        "MinimalImportableKey": {
          "$ref": "#/components/schemas/RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>",
          "description": "Represents the properties required to import a key."
        },
        "RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>": {
          "description": "Represents an object type where a subset of keys is required and everything else is optional.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kms",
            "privateKeyHex",
            "type"
          ],
          "type": "object"
        },
        "IKeyManagerSharedSecretArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerSharedSecret | keyManagerSharedSecret }",
          "properties": {
            "publicKey": {
              "description": "The public key of the other party. The `type` of key MUST be compatible with the type referenced by `secretKeyRef`",
              "properties": {
                "publicKeyHex": {
                  "description": "Public key",
                  "type": "string"
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
              "type": "object"
            },
            "secretKeyRef": {
              "description": "The secret key handle (`kid`) as returned by  {@link IKeyManager.keyManagerCreate | keyManagerCreate }",
              "type": "string"
            }
          },
          "required": [
            "secretKeyRef",
            "publicKey"
          ],
          "type": "object"
        },
        "IKeyManagerSignArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerSign | keyManagerSign }",
          "properties": {
            "algorithm": {
              "description": "The algorithm to use for signing. This must be one of the algorithms supported by the KMS for this key type.\n\nThe algorithm used here should match one of the names listed in `IKey.meta.algorithms`",
              "type": "string"
            },
            "data": {
              "description": "Data to sign",
              "type": "string"
            },
            "encoding": {
              "description": "If the data is a \"string\" then you can specify which encoding is used. Default is \"utf-8\"",
              "enum": [
                "utf-8",
                "base16",
                "base64",
                "hex"
              ],
              "type": "string"
            },
            "keyRef": {
              "description": "The key handle, as returned during `keyManagerCreateKey`",
              "type": "string"
            }
          },
          "required": [
            "keyRef",
            "data"
          ],
          "type": "object"
        },
        "IKeyManagerSignEthTXArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerSignEthTX | keyManagerSignEthTX }",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "transaction": {
              "description": "Ethereum transaction object",
              "type": "object"
            }
          },
          "required": [
            "kid",
            "transaction"
          ],
          "type": "object"
        },
        "IKeyManagerSignJWTArgs": {
          "description": "Input arguments for  {@link IKeyManager.keyManagerSignJWT | keyManagerSignJWT }",
          "properties": {
            "data": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "additionalProperties": {
                    "type": "number"
                  },
                  "properties": {
                    "BYTES_PER_ELEMENT": {
                      "type": "number"
                    },
                    "buffer": {
                      "properties": {
                        "byteLength": {
                          "type": "number"
                        }
                      },
                      "required": [
                        "byteLength"
                      ],
                      "type": "object"
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
                  "type": "object"
                }
              ],
              "description": "Data to sign"
            },
            "kid": {
              "description": "Key ID",
              "type": "string"
            }
          },
          "required": [
            "kid",
            "data"
          ],
          "type": "object"
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
          "description": "Input arguments for  {@link IDIDManager.didManagerAddKey | didManagerAddKey }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            },
            "key": {
              "$ref": "#/components/schemas/IKey",
              "description": "Key object"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "properties": {
                "localOnly": {
                  "default": false,
                  "description": "Optional flag to indicate that the key should only be added to the local DIDStore tracking and this update will not be published to any underlying registries",
                  "type": "boolean"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "did",
            "key"
          ],
          "type": "object"
        },
        "IKey": {
          "description": "Cryptographic key, usually managed by the current Veramo instance.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "type": "object"
        },
        "KeyMetadata": {
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management.",
          "properties": {
            "algorithms": {
              "items": {
                "$ref": "#/components/schemas/TAlg"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "TAlg": {
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType  } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key.",
          "type": "string"
        },
        "TKeyType": {
          "description": "Cryptographic key type.",
          "type": "string"
        },
        "IDIDManagerAddServiceArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerAddService | didManagerAddService }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "properties": {
                "localOnly": {
                  "default": false,
                  "description": "Optional flag to indicate that the service should only be added to the local DIDStore tracking and this update will not be published to any underlying registries",
                  "type": "boolean"
                }
              },
              "type": "object"
            },
            "service": {
              "$ref": "#/components/schemas/IService",
              "description": "Service object"
            }
          },
          "required": [
            "did",
            "service"
          ],
          "type": "object"
        },
        "IService": {
          "description": "Identifier service",
          "properties": {
            "description": {
              "description": "Optional. Description",
              "type": "string"
            },
            "id": {
              "description": "ID",
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  },
                  "type": "array"
                }
              ],
              "description": "Endpoint URL"
            },
            "type": {
              "description": "Service type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
          "description": "Input arguments for  {@link IDIDManager.didManagerCreate | didManagerCreate }",
          "properties": {
            "alias": {
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "kms": {
              "description": "Optional. Key Management System",
              "type": "string"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "type": "object"
            },
            "provider": {
              "description": "Optional. Identifier provider",
              "type": "string"
            }
          },
          "type": "object"
        },
        "IIdentifier": {
          "description": "Identifier interface",
          "properties": {
            "alias": {
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "controllerKeyId": {
              "description": "Controller key id",
              "type": "string"
            },
            "did": {
              "description": "Decentralized identifier",
              "type": "string"
            },
            "keys": {
              "description": "Array of managed keys",
              "items": {
                "$ref": "#/components/schemas/IKey"
              },
              "type": "array"
            },
            "provider": {
              "description": "Identifier provider name",
              "type": "string"
            },
            "services": {
              "description": "Array of services",
              "items": {
                "$ref": "#/components/schemas/IService"
              },
              "type": "array"
            }
          },
          "required": [
            "did",
            "provider",
            "keys",
            "services"
          ],
          "type": "object"
        },
        "IDIDManagerDeleteArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerDelete | didManagerDelete }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            }
          },
          "required": [
            "did"
          ],
          "type": "object"
        },
        "IDIDManagerFindArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerFind | didManagerFind }",
          "properties": {
            "alias": {
              "description": "Optional. Alias",
              "type": "string"
            },
            "provider": {
              "description": "Optional. Provider",
              "type": "string"
            }
          },
          "type": "object"
        },
        "IDIDManagerGetArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerGet | didManagerGet }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            }
          },
          "required": [
            "did"
          ],
          "type": "object"
        },
        "IDIDManagerGetByAliasArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerGetByAlias | didManagerGetByAlias }",
          "properties": {
            "alias": {
              "description": "Alias",
              "type": "string"
            },
            "provider": {
              "description": "Optional provider",
              "type": "string"
            }
          },
          "required": [
            "alias"
          ],
          "type": "object"
        },
        "IDIDManagerGetOrCreateArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerGetOrCreate | didManagerGetOrCreate }",
          "properties": {
            "alias": {
              "description": "Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "kms": {
              "description": "Optional. Key Management System",
              "type": "string"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "type": "object"
            },
            "provider": {
              "description": "Optional. Identifier provider",
              "type": "string"
            }
          },
          "required": [
            "alias"
          ],
          "type": "object"
        },
        "MinimalImportableIdentifier": {
          "description": "Represents the minimum amount of information needed to import an  {@link  IIdentifier  } .",
          "properties": {
            "alias": {
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "controllerKeyId": {
              "description": "Controller key id",
              "type": "string"
            },
            "did": {
              "description": "Decentralized identifier",
              "type": "string"
            },
            "keys": {
              "items": {
                "$ref": "#/components/schemas/MinimalImportableKey"
              },
              "type": "array"
            },
            "provider": {
              "description": "Identifier provider name",
              "type": "string"
            },
            "services": {
              "items": {
                "$ref": "#/components/schemas/IService"
              },
              "type": "array"
            }
          },
          "required": [
            "did",
            "keys",
            "provider"
          ],
          "type": "object"
        },
        "MinimalImportableKey": {
          "$ref": "#/components/schemas/RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>",
          "description": "Represents the properties required to import a key."
        },
        "RequireOnly<IKey,(\"privateKeyHex\"|\"type\"|\"kms\")>": {
          "description": "Represents an object type where a subset of keys is required and everything else is optional.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kms",
            "privateKeyHex",
            "type"
          ],
          "type": "object"
        },
        "IDIDManagerRemoveKeyArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerRemoveKey | didManagerRemoveKey }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            },
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "properties": {
                "localOnly": {
                  "default": false,
                  "description": "Optional flag to indicate that the key should only be removed from the local DIDStore tracking and this update will not be published to any underlying registries",
                  "type": "boolean"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "did",
            "kid"
          ],
          "type": "object"
        },
        "IDIDManagerRemoveServiceArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerRemoveService | didManagerRemoveService }",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            },
            "id": {
              "description": "Service ID",
              "type": "string"
            },
            "options": {
              "description": "Optional. Identifier-provider specific options",
              "properties": {
                "localOnly": {
                  "default": false,
                  "description": "Optional flag to indicate that the service should only be removed from the local DIDStore tracking and this update will not be published to any underlying registries",
                  "type": "boolean"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "did",
            "id"
          ],
          "type": "object"
        },
        "IDIDManagerSetAliasArgs": {
          "description": "Input arguments for  {@link IDIDManager.didManagerSetAlias | didManagerSetAlias }",
          "properties": {
            "alias": {
              "description": "Required. Identifier alias",
              "type": "string"
            },
            "did": {
              "description": "Required. DID",
              "type": "string"
            }
          },
          "required": [
            "did",
            "alias"
          ],
          "type": "object"
        },
        "ConditionWeightedThreshold": {
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
          ],
          "type": "object"
        },
        "IDIDManagerUpdateArgs": {
          "description": "The arguments necessary to perform a full DID document update for a DID.",
          "properties": {
            "did": {
              "description": "Required. DID",
              "type": "string"
            },
            "document": {
              "description": "Required",
              "properties": {
                "@context": {
                  "anyOf": [
                    {
                      "properties": {},
                      "type": "object"
                    },
                    {
                      "type": "string"
                    },
                    {
                      "allOf": [
                        {
                          "items": {
                            "type": "string"
                          },
                          "type": "array"
                        },
                        {
                          "properties": {},
                          "type": "object"
                        }
                      ]
                    }
                  ]
                },
                "alsoKnownAs": {
                  "allOf": [
                    {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "assertionMethod": {
                  "allOf": [
                    {
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "authentication": {
                  "allOf": [
                    {
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "capabilityDelegation": {
                  "allOf": [
                    {
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "capabilityInvocation": {
                  "allOf": [
                    {
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
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
                          "items": {
                            "type": "string"
                          },
                          "type": "array"
                        },
                        {
                          "properties": {},
                          "type": "object"
                        }
                      ]
                    }
                  ]
                },
                "id": {
                  "type": "string"
                },
                "keyAgreement": {
                  "allOf": [
                    {
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "$ref": "#/components/schemas/VerificationMethod"
                          }
                        ]
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "publicKey": {
                  "allOf": [
                    {
                      "items": {
                        "$ref": "#/components/schemas/VerificationMethod"
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ],
                  "deprecated": true
                },
                "service": {
                  "allOf": [
                    {
                      "items": {
                        "$ref": "#/components/schemas/Service"
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                },
                "verificationMethod": {
                  "allOf": [
                    {
                      "items": {
                        "$ref": "#/components/schemas/VerificationMethod"
                      },
                      "type": "array"
                    },
                    {
                      "properties": {},
                      "type": "object"
                    }
                  ]
                }
              },
              "type": "object"
            },
            "options": {
              "description": "Identifier provider specific options.",
              "properties": {
                "localOnly": {
                  "default": false,
                  "description": "Optional flag to indicate that the changes will only be applied to the local DIDStore tracking and this update will not be published to any underlying registries AbstractIdentifierProvider implementations must respect this flag where applicable. Defaults to false.",
                  "type": "boolean"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "did",
            "document"
          ],
          "type": "object"
        },
        "JsonWebKey": {
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents.",
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
              "items": {
                "type": "string"
              },
              "type": "array"
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
          "type": "object"
        },
        "Service": {
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } .",
          "properties": {
            "id": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  },
                  "type": "array"
                }
              ]
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
        "VerificationMethod": {
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility.",
          "properties": {
            "blockchainAccountId": {
              "type": "string"
            },
            "conditionAnd": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionDelegated": {
              "type": "string"
            },
            "conditionOr": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionThreshold": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionWeightedThreshold": {
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              },
              "type": "array"
            },
            "controller": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "relationshipChild": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipParent": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipSibling": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "threshold": {
              "type": "number"
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "type": "object"
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
          "description": "Input arguments for  {@link IDataStore.dataStoreDeleteMessage | dataStoreDeleteMessage }",
          "properties": {
            "id": {
              "description": "Required. Message ID",
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        "IDataStoreDeleteVerifiableCredentialArgs": {
          "description": "Input arguments for  {@link IDataStoreDeleteVerifiableCredentialArgs | IDataStoreDeleteVerifiableCredentialArgs }",
          "properties": {
            "hash": {
              "description": "Required. VerifiableCredential hash",
              "type": "string"
            }
          },
          "required": [
            "hash"
          ],
          "type": "object"
        },
        "IDataStoreGetMessageArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreGetMessage | dataStoreGetMessage }",
          "properties": {
            "id": {
              "description": "Required. Message ID",
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        "CompactJWT": {
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\"",
          "type": "string"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "IMessage": {
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations.",
          "properties": {
            "attachments": {
              "description": "Optional. Array of generic attachments",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "type": "array"
            },
            "createdAt": {
              "description": "Optional. Creation date (ISO 8601)",
              "type": "string"
            },
            "credentials": {
              "description": "Optional. Array of attached verifiable credentials",
              "items": {
                "$ref": "#/components/schemas/VerifiableCredential"
              },
              "type": "array"
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
            "expiresAt": {
              "description": "Optional. Expiration date (ISO 8601)",
              "type": "string"
            },
            "from": {
              "description": "Optional. Sender DID",
              "type": "string"
            },
            "id": {
              "description": "Unique message ID",
              "type": "string"
            },
            "metaData": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Array of message metadata"
            },
            "presentations": {
              "description": "Optional. Array of attached verifiable presentations",
              "items": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              },
              "type": "array"
            },
            "raw": {
              "description": "Optional. Original message raw data",
              "type": "string"
            },
            "replyTo": {
              "description": "Optional. List of DIDs to reply to",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "replyUrl": {
              "description": "Optional. URL to post a reply message to",
              "type": "string"
            },
            "returnRoute": {
              "description": "Optional. Signal how to reuse transport for return messages",
              "type": "string"
            },
            "threadId": {
              "description": "Optional. Thread ID",
              "type": "string"
            },
            "to": {
              "description": "Optional. Recipient DID",
              "type": "string"
            },
            "type": {
              "description": "Message type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "type": "object"
        },
        "IMessageAttachment": {
          "description": "Message attachment",
          "properties": {
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IMessageAttachmentData": {
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "base64": {
              "type": "string"
            },
            "hash": {
              "type": "string"
            },
            "json": {},
            "jws": {},
            "links": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IMetaData": {
          "description": "Message meta data",
          "properties": {
            "type": {
              "description": "Type",
              "type": "string"
            },
            "value": {
              "description": "Optional. Value",
              "type": "string"
            }
          },
          "required": [
            "type"
          ],
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "VerifiablePresentation": {
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "type": "string"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "type": "object"
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
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model-1.1/#proof-formats | proof formats }"
        },
        "IDataStoreGetVerifiableCredentialArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreGetVerifiableCredential | dataStoreGetVerifiableCredential }",
          "properties": {
            "hash": {
              "description": "Required. VerifiableCredential hash",
              "type": "string"
            }
          },
          "required": [
            "hash"
          ],
          "type": "object"
        },
        "IDataStoreGetVerifiablePresentationArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreGetVerifiablePresentation | dataStoreGetVerifiablePresentation }",
          "properties": {
            "hash": {
              "description": "Required. VerifiablePresentation hash",
              "type": "string"
            }
          },
          "required": [
            "hash"
          ],
          "type": "object"
        },
        "IDataStoreSaveMessageArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage }",
          "properties": {
            "message": {
              "$ref": "#/components/schemas/IMessage",
              "description": "Required. Message"
            }
          },
          "required": [
            "message"
          ],
          "type": "object"
        },
        "IDataStoreSaveVerifiableCredentialArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential }",
          "properties": {
            "verifiableCredential": {
              "$ref": "#/components/schemas/VerifiableCredential",
              "description": "Required. VerifiableCredential"
            }
          },
          "required": [
            "verifiableCredential"
          ],
          "type": "object"
        },
        "IDataStoreSaveVerifiablePresentationArgs": {
          "description": "Input arguments for  {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation }",
          "properties": {
            "verifiablePresentation": {
              "$ref": "#/components/schemas/VerifiablePresentation",
              "description": "Required. VerifiablePresentation"
            }
          },
          "required": [
            "verifiablePresentation"
          ],
          "type": "object"
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
        "FindArgs-TIdentifiersColumns": {
          "description": "Represents an  {@link  IDataStoreORM  }  Query.",
          "properties": {
            "order": {
              "description": "Sorts the results according to the given array of column priorities.",
              "items": {
                "$ref": "#/components/schemas/Order-TIdentifiersColumns"
              },
              "type": "array"
            },
            "skip": {
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM  }  query result.",
              "type": "number"
            },
            "take": {
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM  }  query.",
              "type": "number"
            },
            "where": {
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND.",
              "items": {
                "$ref": "#/components/schemas/Where-TIdentifiersColumns"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "FindIdentifiersArgs": {
          "$ref": "#/components/schemas/FindArgs-TIdentifiersColumns",
          "description": "The filter that can be used to find  {@link  IIdentifier  } s in the data store."
        },
        "Order-TIdentifiersColumns": {
          "description": "Represents the sort order of results from a  {@link  FindArgs  }  query.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TIdentifiersColumns"
            },
            "direction": {
              "enum": [
                "ASC",
                "DESC"
              ],
              "type": "string"
            }
          },
          "required": [
            "column",
            "direction"
          ],
          "type": "object"
        },
        "TIdentifiersColumns": {
          "deprecated": "This type will be removed in future versions of this plugin interface.",
          "description": "The columns that can be queried for an  {@link  IIdentifier  }",
          "enum": [
            "did",
            "alias",
            "provider"
          ],
          "type": "string"
        },
        "Where-TIdentifiersColumns": {
          "description": "Represents a WHERE predicate for a  {@link  FindArgs  }  query. In situations where multiple WHERE predicates are present, they are combined with AND.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TIdentifiersColumns"
            },
            "not": {
              "type": "boolean"
            },
            "op": {
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
              ],
              "type": "string"
            },
            "value": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "column"
          ],
          "type": "object"
        },
        "IKey": {
          "description": "Cryptographic key, usually managed by the current Veramo instance.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "type": "object"
        },
        "IService": {
          "description": "Identifier service",
          "properties": {
            "description": {
              "description": "Optional. Description",
              "type": "string"
            },
            "id": {
              "description": "ID",
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  },
                  "type": "array"
                }
              ],
              "description": "Endpoint URL"
            },
            "type": {
              "description": "Service type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
        "KeyMetadata": {
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management.",
          "properties": {
            "algorithms": {
              "items": {
                "$ref": "#/components/schemas/TAlg"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "PartialIdentifier": {
          "description": "The result of a  {@link  IDataStoreORM.dataStoreORMGetIdentifiers  }  query.",
          "properties": {
            "alias": {
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "controllerKeyId": {
              "description": "Controller key id",
              "type": "string"
            },
            "did": {
              "description": "Decentralized identifier",
              "type": "string"
            },
            "keys": {
              "description": "Array of managed keys",
              "items": {
                "$ref": "#/components/schemas/IKey"
              },
              "type": "array"
            },
            "provider": {
              "description": "Identifier provider name",
              "type": "string"
            },
            "services": {
              "description": "Array of services",
              "items": {
                "$ref": "#/components/schemas/IService"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "TAlg": {
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType  } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key.",
          "type": "string"
        },
        "TKeyType": {
          "description": "Cryptographic key type.",
          "type": "string"
        },
        "FindArgs-TMessageColumns": {
          "description": "Represents an  {@link  IDataStoreORM  }  Query.",
          "properties": {
            "order": {
              "description": "Sorts the results according to the given array of column priorities.",
              "items": {
                "$ref": "#/components/schemas/Order-TMessageColumns"
              },
              "type": "array"
            },
            "skip": {
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM  }  query result.",
              "type": "number"
            },
            "take": {
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM  }  query.",
              "type": "number"
            },
            "where": {
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND.",
              "items": {
                "$ref": "#/components/schemas/Where-TMessageColumns"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "FindMessagesArgs": {
          "$ref": "#/components/schemas/FindArgs-TMessageColumns",
          "description": "The filter that can be used to find  {@link  IMessage  } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetMessages  }"
        },
        "Order-TMessageColumns": {
          "description": "Represents the sort order of results from a  {@link  FindArgs  }  query.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TMessageColumns"
            },
            "direction": {
              "enum": [
                "ASC",
                "DESC"
              ],
              "type": "string"
            }
          },
          "required": [
            "column",
            "direction"
          ],
          "type": "object"
        },
        "TMessageColumns": {
          "description": "The columns that can be queried for an  {@link  IMessage  } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetMessagesCount  }",
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
          "type": "string"
        },
        "Where-TMessageColumns": {
          "description": "Represents a WHERE predicate for a  {@link  FindArgs  }  query. In situations where multiple WHERE predicates are present, they are combined with AND.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TMessageColumns"
            },
            "not": {
              "type": "boolean"
            },
            "op": {
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
              ],
              "type": "string"
            },
            "value": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "column"
          ],
          "type": "object"
        },
        "CompactJWT": {
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\"",
          "type": "string"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "IMessage": {
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations.",
          "properties": {
            "attachments": {
              "description": "Optional. Array of generic attachments",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "type": "array"
            },
            "createdAt": {
              "description": "Optional. Creation date (ISO 8601)",
              "type": "string"
            },
            "credentials": {
              "description": "Optional. Array of attached verifiable credentials",
              "items": {
                "$ref": "#/components/schemas/VerifiableCredential"
              },
              "type": "array"
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
            "expiresAt": {
              "description": "Optional. Expiration date (ISO 8601)",
              "type": "string"
            },
            "from": {
              "description": "Optional. Sender DID",
              "type": "string"
            },
            "id": {
              "description": "Unique message ID",
              "type": "string"
            },
            "metaData": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Array of message metadata"
            },
            "presentations": {
              "description": "Optional. Array of attached verifiable presentations",
              "items": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              },
              "type": "array"
            },
            "raw": {
              "description": "Optional. Original message raw data",
              "type": "string"
            },
            "replyTo": {
              "description": "Optional. List of DIDs to reply to",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "replyUrl": {
              "description": "Optional. URL to post a reply message to",
              "type": "string"
            },
            "returnRoute": {
              "description": "Optional. Signal how to reuse transport for return messages",
              "type": "string"
            },
            "threadId": {
              "description": "Optional. Thread ID",
              "type": "string"
            },
            "to": {
              "description": "Optional. Recipient DID",
              "type": "string"
            },
            "type": {
              "description": "Message type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "type": "object"
        },
        "IMessageAttachment": {
          "description": "Message attachment",
          "properties": {
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IMessageAttachmentData": {
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "base64": {
              "type": "string"
            },
            "hash": {
              "type": "string"
            },
            "json": {},
            "jws": {},
            "links": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IMetaData": {
          "description": "Message meta data",
          "properties": {
            "type": {
              "description": "Type",
              "type": "string"
            },
            "value": {
              "description": "Optional. Value",
              "type": "string"
            }
          },
          "required": [
            "type"
          ],
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "VerifiablePresentation": {
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "type": "string"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "type": "object"
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
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model-1.1/#proof-formats | proof formats }"
        },
        "FindArgs-TCredentialColumns": {
          "description": "Represents an  {@link  IDataStoreORM  }  Query.",
          "properties": {
            "order": {
              "description": "Sorts the results according to the given array of column priorities.",
              "items": {
                "$ref": "#/components/schemas/Order-TCredentialColumns"
              },
              "type": "array"
            },
            "skip": {
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM  }  query result.",
              "type": "number"
            },
            "take": {
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM  }  query.",
              "type": "number"
            },
            "where": {
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND.",
              "items": {
                "$ref": "#/components/schemas/Where-TCredentialColumns"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "FindCredentialsArgs": {
          "$ref": "#/components/schemas/FindArgs-TCredentialColumns",
          "description": "The filter that can be used to find  {@link  VerifiableCredential  } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials  }"
        },
        "Order-TCredentialColumns": {
          "description": "Represents the sort order of results from a  {@link  FindArgs  }  query.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TCredentialColumns"
            },
            "direction": {
              "enum": [
                "ASC",
                "DESC"
              ],
              "type": "string"
            }
          },
          "required": [
            "column",
            "direction"
          ],
          "type": "object"
        },
        "TCredentialColumns": {
          "description": "The columns that can be searched for a  {@link  VerifiableCredential  } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials  }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsCount  }",
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
          "type": "string"
        },
        "Where-TCredentialColumns": {
          "description": "Represents a WHERE predicate for a  {@link  FindArgs  }  query. In situations where multiple WHERE predicates are present, they are combined with AND.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TCredentialColumns"
            },
            "not": {
              "type": "boolean"
            },
            "op": {
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
              ],
              "type": "string"
            },
            "value": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "column"
          ],
          "type": "object"
        },
        "UniqueVerifiableCredential": {
          "description": "Represents the result of a Query for  {@link  VerifiableCredential  } s\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentials  }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims  }",
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
          "type": "object"
        },
        "FindArgs-TClaimsColumns": {
          "description": "Represents an  {@link  IDataStoreORM  }  Query.",
          "properties": {
            "order": {
              "description": "Sorts the results according to the given array of column priorities.",
              "items": {
                "$ref": "#/components/schemas/Order-TClaimsColumns"
              },
              "type": "array"
            },
            "skip": {
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM  }  query result.",
              "type": "number"
            },
            "take": {
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM  }  query.",
              "type": "number"
            },
            "where": {
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND.",
              "items": {
                "$ref": "#/components/schemas/Where-TClaimsColumns"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "FindClaimsArgs": {
          "$ref": "#/components/schemas/FindArgs-TClaimsColumns",
          "description": "The filter that can be used to find  {@link  VerifiableCredential  } s in the data store, based on the types and values of their claims.\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims  }"
        },
        "Order-TClaimsColumns": {
          "description": "Represents the sort order of results from a  {@link  FindArgs  }  query.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TClaimsColumns"
            },
            "direction": {
              "enum": [
                "ASC",
                "DESC"
              ],
              "type": "string"
            }
          },
          "required": [
            "column",
            "direction"
          ],
          "type": "object"
        },
        "TClaimsColumns": {
          "description": "The columns that can be searched for the claims of a  {@link  VerifiableCredential  } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims  }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaimsCount  }",
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
          "type": "string"
        },
        "Where-TClaimsColumns": {
          "description": "Represents a WHERE predicate for a  {@link  FindArgs  }  query. In situations where multiple WHERE predicates are present, they are combined with AND.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TClaimsColumns"
            },
            "not": {
              "type": "boolean"
            },
            "op": {
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
              ],
              "type": "string"
            },
            "value": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "column"
          ],
          "type": "object"
        },
        "FindArgs-TPresentationColumns": {
          "description": "Represents an  {@link  IDataStoreORM  }  Query.",
          "properties": {
            "order": {
              "description": "Sorts the results according to the given array of column priorities.",
              "items": {
                "$ref": "#/components/schemas/Order-TPresentationColumns"
              },
              "type": "array"
            },
            "skip": {
              "description": "Ignores the first number of entries in a  {@link  IDataStoreORM  }  query result.",
              "type": "number"
            },
            "take": {
              "description": "Returns at most this number of results from a  {@link  IDataStoreORM  }  query.",
              "type": "number"
            },
            "where": {
              "description": "Imposes constraints on the values of the given columns. WHERE clauses are combined using AND.",
              "items": {
                "$ref": "#/components/schemas/Where-TPresentationColumns"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "FindPresentationsArgs": {
          "$ref": "#/components/schemas/FindArgs-TPresentationColumns",
          "description": "The filter that can be used to find  {@link  VerifiablePresentation  } s in the data store. See  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations  }"
        },
        "Order-TPresentationColumns": {
          "description": "Represents the sort order of results from a  {@link  FindArgs  }  query.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TPresentationColumns"
            },
            "direction": {
              "enum": [
                "ASC",
                "DESC"
              ],
              "type": "string"
            }
          },
          "required": [
            "column",
            "direction"
          ],
          "type": "object"
        },
        "TPresentationColumns": {
          "description": "The columns that can be searched for a  {@link  VerifiablePresentation  } \n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations  }  See  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentationsCount  }",
          "enum": [
            "context",
            "type",
            "id",
            "holder",
            "verifier",
            "expirationDate",
            "issuanceDate"
          ],
          "type": "string"
        },
        "Where-TPresentationColumns": {
          "description": "Represents a WHERE predicate for a  {@link  FindArgs  }  query. In situations where multiple WHERE predicates are present, they are combined with AND.",
          "properties": {
            "column": {
              "$ref": "#/components/schemas/TPresentationColumns"
            },
            "not": {
              "type": "boolean"
            },
            "op": {
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
              ],
              "type": "string"
            },
            "value": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "column"
          ],
          "type": "object"
        },
        "UniqueVerifiablePresentation": {
          "description": "Represents the result of a Query for  {@link  VerifiablePresentation  } s\n\nSee  {@link  IDataStoreORM.dataStoreORMGetVerifiablePresentations  }",
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
          "type": "object"
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
          "description": "Input arguments for  {@link IMessageHandler.handleMessage | handleMessage }",
          "properties": {
            "metaData": {
              "description": "Optional. Message meta data",
              "items": {
                "$ref": "#/components/schemas/IMetaData"
              },
              "type": "array"
            },
            "raw": {
              "description": "Raw message data",
              "type": "string"
            },
            "save": {
              "deprecated": "Please call {@link @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} after\nhandling the message and determining that it must be saved.",
              "description": "Optional. If set to `true`, the message will be saved using  {@link  @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage }  <p/><p/>",
              "type": "boolean"
            }
          },
          "required": [
            "raw"
          ],
          "type": "object"
        },
        "IMetaData": {
          "description": "Message meta data",
          "properties": {
            "type": {
              "description": "Type",
              "type": "string"
            },
            "value": {
              "description": "Optional. Value",
              "type": "string"
            }
          },
          "required": [
            "type"
          ],
          "type": "object"
        },
        "CompactJWT": {
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\"",
          "type": "string"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "IMessage": {
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations.",
          "properties": {
            "attachments": {
              "description": "Optional. Array of generic attachments",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "type": "array"
            },
            "createdAt": {
              "description": "Optional. Creation date (ISO 8601)",
              "type": "string"
            },
            "credentials": {
              "description": "Optional. Array of attached verifiable credentials",
              "items": {
                "$ref": "#/components/schemas/VerifiableCredential"
              },
              "type": "array"
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
            "expiresAt": {
              "description": "Optional. Expiration date (ISO 8601)",
              "type": "string"
            },
            "from": {
              "description": "Optional. Sender DID",
              "type": "string"
            },
            "id": {
              "description": "Unique message ID",
              "type": "string"
            },
            "metaData": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Array of message metadata"
            },
            "presentations": {
              "description": "Optional. Array of attached verifiable presentations",
              "items": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              },
              "type": "array"
            },
            "raw": {
              "description": "Optional. Original message raw data",
              "type": "string"
            },
            "replyTo": {
              "description": "Optional. List of DIDs to reply to",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "replyUrl": {
              "description": "Optional. URL to post a reply message to",
              "type": "string"
            },
            "returnRoute": {
              "description": "Optional. Signal how to reuse transport for return messages",
              "type": "string"
            },
            "threadId": {
              "description": "Optional. Thread ID",
              "type": "string"
            },
            "to": {
              "description": "Optional. Recipient DID",
              "type": "string"
            },
            "type": {
              "description": "Message type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "type": "object"
        },
        "IMessageAttachment": {
          "description": "Message attachment",
          "properties": {
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IMessageAttachmentData": {
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "base64": {
              "type": "string"
            },
            "hash": {
              "type": "string"
            },
            "json": {},
            "jws": {},
            "links": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "VerifiablePresentation": {
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "type": "string"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "type": "object"
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
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model-1.1/#proof-formats | proof formats }"
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
        "ContextType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            },
            {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialPayload": {
          "description": "Used as input when creating Verifiable Credentials",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "type": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "issuer"
          ],
          "type": "object"
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "DateType": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "format": "date-time",
              "type": "string"
            }
          ],
          "description": "Represents an issuance or expiration date for Credentials / Presentations. This is used as input when creating them."
        },
        "ICreateVerifiableCredentialArgs": {
          "additionalProperties": {
            "description": "Any other options that can be forwarded to the lower level libraries"
          },
          "description": "Encapsulates the parameters required to create a  {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential }",
          "properties": {
            "credential": {
              "$ref": "#/components/schemas/CredentialPayload",
              "description": "The JSON payload of the Credential according to the  {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model } \n\nThe signer of the Credential is chosen based on the `issuer.id` property of the `credential`\n\n`@context`, `type` and `issuanceDate` will be added automatically if omitted"
            },
            "fetchRemoteContexts": {
              "description": "When dealing with JSON-LD, you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`",
              "type": "boolean"
            },
            "keyRef": {
              "description": "[Optional] The ID of the key that should sign this credential. If this is not specified, the first matching key will be used.",
              "type": "string"
            },
            "proofFormat": {
              "$ref": "#/components/schemas/ProofFormat",
              "description": "The desired format for the VerifiableCredential to be created."
            },
            "removeOriginalFields": {
              "description": "Remove payload members during JWT-JSON transformation. Defaults to `true`. See https://www.w3.org/TR/vc-data-model/#jwt-encoding",
              "type": "boolean"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "save": {
              "deprecated": "Please call\n{@link @veramo/core-types#IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential()} to\nsave the credential after creating it.",
              "description": "If this parameter is true, the resulting VerifiableCredential is sent to the  {@link  @veramo/core-types#IDataStore | storage plugin }  to be saved.",
              "type": "boolean"
            }
          },
          "required": [
            "credential",
            "proofFormat"
          ],
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofFormat": {
          "description": "Represents a format for a particular type of verifiable data. This is an extensible union of several known formats implemented by Veramo",
          "type": "string"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "CompactJWT": {
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\"",
          "type": "string"
        },
        "ICreateVerifiablePresentationArgs": {
          "additionalProperties": {
            "description": "Any other options that can be forwarded to the lower level libraries"
          },
          "description": "Encapsulates the parameters required to create a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }",
          "properties": {
            "challenge": {
              "description": "Optional (only JWT) string challenge parameter to add to the verifiable presentation.",
              "type": "string"
            },
            "domain": {
              "description": "Optional string domain parameter to add to the verifiable presentation.",
              "type": "string"
            },
            "fetchRemoteContexts": {
              "description": "When dealing with JSON-LD, you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`",
              "type": "boolean"
            },
            "keyRef": {
              "description": "[Optional] The ID of the key that should sign this presentation. If this is not specified, the first matching key will be used.",
              "type": "string"
            },
            "presentation": {
              "$ref": "#/components/schemas/PresentationPayload",
              "description": "The JSON payload of the Presentation according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model } .\n\nThe signer of the Presentation is chosen based on the `holder` property of the `presentation`\n\n`@context`, `type` and `issuanceDate` will be added automatically if omitted"
            },
            "proofFormat": {
              "$ref": "#/components/schemas/ProofFormat",
              "description": "The desired format for the VerifiablePresentation to be created."
            },
            "removeOriginalFields": {
              "description": "Remove payload members during JWT-JSON transformation. Defaults to `true`. See https://www.w3.org/TR/vc-data-model/#jwt-encoding",
              "type": "boolean"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "save": {
              "deprecated": "Please call\n{@link @veramo/core-types#IDataStore.dataStoreSaveVerifiablePresentation |\n   *   dataStoreSaveVerifiablePresentation()} to save the credential after creating it.",
              "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the  {@link  @veramo/core-types#IDataStore | storage plugin }  to be saved. <p/><p/>",
              "type": "boolean"
            }
          },
          "required": [
            "presentation",
            "proofFormat"
          ],
          "type": "object"
        },
        "PresentationPayload": {
          "description": "Used as input when creating Verifiable Presentations",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "$ref": "#/components/schemas/DateType"
            },
            "type": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "holder"
          ],
          "type": "object"
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
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model-1.1/#proof-formats | proof formats }"
        },
        "VerifiablePresentation": {
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "type": "string"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "type": "object"
        },
        "IIdentifier": {
          "description": "Identifier interface",
          "properties": {
            "alias": {
              "description": "Optional. Identifier alias. Can be used to reference an object in an external system",
              "type": "string"
            },
            "controllerKeyId": {
              "description": "Controller key id",
              "type": "string"
            },
            "did": {
              "description": "Decentralized identifier",
              "type": "string"
            },
            "keys": {
              "description": "Array of managed keys",
              "items": {
                "$ref": "#/components/schemas/IKey"
              },
              "type": "array"
            },
            "provider": {
              "description": "Identifier provider name",
              "type": "string"
            },
            "services": {
              "description": "Array of services",
              "items": {
                "$ref": "#/components/schemas/IService"
              },
              "type": "array"
            }
          },
          "required": [
            "did",
            "provider",
            "keys",
            "services"
          ],
          "type": "object"
        },
        "IKey": {
          "description": "Cryptographic key, usually managed by the current Veramo instance.",
          "properties": {
            "kid": {
              "description": "Key ID",
              "type": "string"
            },
            "kms": {
              "description": "Key Management System",
              "type": "string"
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
            },
            "privateKeyHex": {
              "description": "Optional. Private key",
              "type": "string"
            },
            "publicKeyHex": {
              "description": "Public key",
              "type": "string"
            },
            "type": {
              "$ref": "#/components/schemas/TKeyType",
              "description": "Key type"
            }
          },
          "required": [
            "kid",
            "kms",
            "type",
            "publicKeyHex"
          ],
          "type": "object"
        },
        "IService": {
          "description": "Identifier service",
          "properties": {
            "description": {
              "description": "Optional. Description",
              "type": "string"
            },
            "id": {
              "description": "ID",
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/IServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/IServiceEndpoint"
                  },
                  "type": "array"
                }
              ],
              "description": "Endpoint URL"
            },
            "type": {
              "description": "Service type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
        "KeyMetadata": {
          "description": "This encapsulates data about a key.\n\nImplementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem }  should populate this object, for each key, with the algorithms that can be performed using it.\n\nThis can also be used to add various tags to the keys under management.",
          "properties": {
            "algorithms": {
              "items": {
                "$ref": "#/components/schemas/TAlg"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "TAlg": {
          "description": "Known algorithms supported by some of the above key types defined by  {@link  TKeyType  } .\n\nActual implementations of  {@link  @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems }  can support more. One should check the  {@link IKey.meta | IKey.meta.algorithms }  property to see what is possible for a particular managed key.",
          "type": "string"
        },
        "TKeyType": {
          "description": "Cryptographic key type.",
          "type": "string"
        }
      },
      "methods": {
        "createVerifiableCredential": {
          "description": "Creates a Verifiable Credential. The payload, signer, and format are chosen based on the ",
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
          "description": "Returns a list of supported proof formats for verifiable data that this plugin can generate based on the specified issuer.",
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
        "CompactJWT": {
          "description": "Represents a Json Web Token in compact form. \"header.payload.signature\"",
          "type": "string"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "IVerifyCredentialArgs": {
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that perform the checks"
          },
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential }",
          "properties": {
            "credential": {
              "$ref": "#/components/schemas/W3CVerifiableCredential",
              "description": "The Verifiable Credential object according to the  {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model }  or the  {@link https://www.w3.org/TR/vc-data-model-1.1/#json-web-token | JWT representation } .\n\nThe signer of the Credential is verified based on the `issuer.id` property of the `credential` or the `iss` property of the JWT payload respectively"
            },
            "fetchRemoteContexts": {
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at application startup instead of being fetched.\n\nDefaults to `false`",
              "type": "boolean"
            },
            "policies": {
              "$ref": "#/components/schemas/VerificationPolicies",
              "description": "Overrides specific aspects of credential verification, where possible."
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "credential"
          ],
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "VerificationPolicies": {
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules that perform the checks"
          },
          "description": "These optional settings can be used to override some default checks that are performed on Presentations during verification.",
          "properties": {
            "audience": {
              "description": "policy to skip the audience check when set to `false`",
              "type": "boolean"
            },
            "credentialStatus": {
              "description": "policy to skip the revocation check (credentialStatus) when set to `false`",
              "type": "boolean"
            },
            "expirationDate": {
              "description": "policy to skip the expirationDate (exp) timestamp check when set to `false`",
              "type": "boolean"
            },
            "issuanceDate": {
              "description": "policy to skip the issuanceDate (nbf) timestamp check when set to `false`",
              "type": "boolean"
            },
            "now": {
              "description": "policy to over the now (current time) during the verification check (UNIX time in seconds)",
              "type": "number"
            }
          },
          "type": "object"
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
          "description": "Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }  See  {@link https://www.w3.org/TR/vc-data-model-1.1/#proof-formats | proof formats }"
        },
        "IError": {
          "description": "An error object, which can contain a code.",
          "properties": {
            "errorCode": {
              "description": "The code for the error being throw",
              "type": "string"
            },
            "message": {
              "description": "The details of the error being throw or forwarded",
              "type": "string"
            }
          },
          "type": "object"
        },
        "IVerifyResult": {
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that performt the checks"
          },
          "description": "Encapsulates the response object to verifyPresentation method after verifying a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }",
          "properties": {
            "error": {
              "$ref": "#/components/schemas/IError",
              "description": "Optional Error object for the but currently the machine readable errors are not expored from DID-JWT package to be imported here"
            },
            "verified": {
              "description": "This value is used to transmit the result of verification.",
              "type": "boolean"
            }
          },
          "required": [
            "verified"
          ],
          "type": "object"
        },
        "IVerifyPresentationArgs": {
          "additionalProperties": {
            "description": "Other options can be specified for verification. They will be forwarded to the lower level modules. that perform the checks"
          },
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }",
          "properties": {
            "challenge": {
              "description": "Optional (only for JWT) string challenge parameter to verify the verifiable presentation against",
              "type": "string"
            },
            "domain": {
              "description": "Optional (only for JWT) string domain parameter to verify the verifiable presentation against",
              "type": "string"
            },
            "fetchRemoteContexts": {
              "description": "When dealing with JSON-LD you also MUST provide the proper contexts. Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded. The context definitions SHOULD rather be provided at startup instead of being fetched.\n\nDefaults to `false`",
              "type": "boolean"
            },
            "policies": {
              "$ref": "#/components/schemas/VerificationPolicies",
              "description": "Overrides specific aspects of credential verification, where possible."
            },
            "presentation": {
              "$ref": "#/components/schemas/W3CVerifiablePresentation",
              "description": "The Verifiable Presentation object according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model }  or the JWT representation.\n\nThe signer of the Presentation is verified based on the `holder` property of the `presentation` or the `iss` property of the JWT payload respectively"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "presentation"
          ],
          "type": "object"
        },
        "VerifiablePresentation": {
          "description": "Represents a signed Verifiable Presentation (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "expirationDate": {
              "type": "string"
            },
            "holder": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            },
            "verifiableCredential": {
              "items": {
                "$ref": "#/components/schemas/W3CVerifiableCredential"
              },
              "type": "array"
            },
            "verifier": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "@context",
            "holder",
            "proof"
          ],
          "type": "object"
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
        }
      },
      "methods": {
        "verifyCredential": {
          "description": "Verifies a Verifiable Credential",
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
        "ConditionWeightedThreshold": {
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
          ],
          "type": "object"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "DIDDocument": {
          "description": "Represents a DID document.",
          "properties": {
            "@context": {
              "anyOf": [
                {
                  "const": "https://www.w3.org/ns/did/v1",
                  "type": "string"
                },
                {
                  "type": "string"
                },
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              ]
            },
            "alsoKnownAs": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "assertionMethod": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "authentication": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "capabilityDelegation": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "capabilityInvocation": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "controller": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "keyAgreement": {
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/components/schemas/VerificationMethod"
                  }
                ]
              },
              "type": "array"
            },
            "publicKey": {
              "deprecated": true,
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "service": {
              "items": {
                "$ref": "#/components/schemas/Service"
              },
              "type": "array"
            },
            "verificationMethod": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        "ICheckCredentialStatusArgs": {
          "description": "Arguments for calling  {@link ICredentialStatusVerifier.checkCredentialStatus | checkCredentialStatus } .\n\nThe credential whose status should be checked and the DID document of the credential issuer.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
          "properties": {
            "credential": {
              "$ref": "#/components/schemas/VerifiableCredential",
              "description": "The credential whose status needs to be checked"
            },
            "didDocumentOverride": {
              "$ref": "#/components/schemas/DIDDocument",
              "description": "The DID document of the issuer. This can be used in case the DID Document is already resolver, to avoid a potentially expensive DID resolution operation."
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "credential"
          ],
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "JsonWebKey": {
          "description": "Encapsulates a JSON web key type that includes only the public properties that can be used in DID documents.\n\nThe private properties are intentionally omitted to discourage the use (and accidental disclosure) of private keys in DID documents.",
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
              "items": {
                "type": "string"
              },
              "type": "array"
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
          "type": "object"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "Service": {
          "description": "Represents a Service entry in a  {@link https://www.w3.org/TR/did-core/#did-document-properties | DID document } .",
          "properties": {
            "id": {
              "type": "string"
            },
            "serviceEndpoint": {
              "anyOf": [
                {
                  "$ref": "#/components/schemas/ServiceEndpoint"
                },
                {
                  "items": {
                    "$ref": "#/components/schemas/ServiceEndpoint"
                  },
                  "type": "array"
                }
              ]
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "serviceEndpoint"
          ],
          "type": "object"
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
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
        },
        "VerificationMethod": {
          "description": "Represents the properties of a Verification Method listed in a DID document.\n\nThis data type includes public key representations that are no longer present in the spec but are still used by several DID methods / resolvers and kept for backward compatibility.",
          "properties": {
            "blockchainAccountId": {
              "type": "string"
            },
            "conditionAnd": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionDelegated": {
              "type": "string"
            },
            "conditionOr": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionThreshold": {
              "items": {
                "$ref": "#/components/schemas/VerificationMethod"
              },
              "type": "array"
            },
            "conditionWeightedThreshold": {
              "items": {
                "$ref": "#/components/schemas/ConditionWeightedThreshold"
              },
              "type": "array"
            },
            "controller": {
              "type": "string"
            },
            "ethereumAddress": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "publicKeyBase58": {
              "type": "string"
            },
            "publicKeyBase64": {
              "type": "string"
            },
            "publicKeyHex": {
              "type": "string"
            },
            "publicKeyJwk": {
              "$ref": "#/components/schemas/JsonWebKey"
            },
            "publicKeyMultibase": {
              "type": "string"
            },
            "relationshipChild": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipParent": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "relationshipSibling": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "threshold": {
              "type": "number"
            },
            "type": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type",
            "controller"
          ],
          "type": "object"
        },
        "CredentialStatus": {
          "description": "Represents the result of a status check.\n\nImplementations MUST populate the `revoked` boolean property, but they can return additional metadata that is method-specific.",
          "properties": {
            "revoked": {
              "type": "boolean"
            }
          },
          "required": [
            "revoked"
          ],
          "type": "object"
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
          "additionalProperties": {
            "description": "Any other options will be forwarded to the credentialStatus method driver"
          },
          "description": "Arguments for generating a `credentialStatus` property for a  {@link  VerifiableCredential  } .",
          "properties": {
            "type": {
              "description": "The credential status type (aka credential status method) to be used in the `credentialStatus` generation.",
              "type": "string"
            }
          },
          "required": [
            "type"
          ],
          "type": "object"
        },
        "CredentialStatusReference": {
          "description": "Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information are determined by the specific `credentialStatus` type  definition and vary depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }",
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
          "type": "object"
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
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "type": "array"
            }
          ],
          "description": "The data type for `@context` properties of credentials, presentations, etc."
        },
        "CredentialStatusUpdateArgs": {
          "description": "Input arguments for  {@link ICredentialStatusManager.credentialStatusUpdate | credentialStatusUpdate }",
          "properties": {
            "options": {
              "description": "Options that will be forwarded to the credentialStatus method specific manager.",
              "type": "object"
            },
            "vc": {
              "$ref": "#/components/schemas/VerifiableCredential",
              "description": "The verifiable credential whose status will be updated."
            }
          },
          "required": [
            "vc"
          ],
          "type": "object"
        },
        "CredentialSubject": {
          "description": "The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "IssuerType": {
          "anyOf": [
            {
              "properties": {
                "id": {
                  "type": "string"
                }
              },
              "required": [
                "id"
              ],
              "type": "object"
            },
            {
              "type": "string"
            }
          ],
          "description": "The issuer of a  {@link  VerifiableCredential  }  or the holder of a  {@link  VerifiablePresentation  } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }"
        },
        "ProofType": {
          "description": "A proof property of a  {@link  VerifiableCredential  }  or  {@link  VerifiablePresentation  }",
          "properties": {
            "proofValue": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          },
          "type": "object"
        },
        "VerifiableCredential": {
          "description": "Represents a signed Verifiable Credential payload (includes proof), using a JSON representation. See  {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model }",
          "properties": {
            "@context": {
              "$ref": "#/components/schemas/ContextType"
            },
            "credentialStatus": {
              "$ref": "#/components/schemas/CredentialStatusReference"
            },
            "credentialSubject": {
              "$ref": "#/components/schemas/CredentialSubject"
            },
            "expirationDate": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "issuanceDate": {
              "type": "string"
            },
            "issuer": {
              "$ref": "#/components/schemas/IssuerType"
            },
            "proof": {
              "$ref": "#/components/schemas/ProofType"
            },
            "type": {
              "anyOf": [
                {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          "required": [
            "@context",
            "credentialSubject",
            "issuanceDate",
            "issuer",
            "proof"
          ],
          "type": "object"
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