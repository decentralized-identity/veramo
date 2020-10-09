export default {
  "components": {
    "schemas": {
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
      "TKeyType": {
        "type": "string",
        "enum": [
          "Ed25519",
          "Secp256k1"
        ],
        "description": "Cryptographic key type"
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
                "type": "object"
              },
              {
                "type": "null"
              }
            ],
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
                "anyOf": [
                  {
                    "type": "object"
                  },
                  {
                    "type": "null"
                  }
                ],
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
      }
    },
    "methods": {
      "keyManagerCreateKey": {
        "description": "Creates and returns a new key",
        "arguments": {
          "$ref": "#/components/schemas/IKeyManagerCreateKeyArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IKey"
        }
      },
      "keyManagerDecryptJWE": {
        "description": "Decrypts data",
        "arguments": {
          "$ref": "#/components/schemas/IKeyManagerDecryptJWEArgs"
        },
        "returnType": {
          "type": "string"
        }
      },
      "keyManagerDeleteKey": {
        "description": "Deletes a key",
        "arguments": {
          "$ref": "#/components/schemas/IKeyManagerDeleteKeyArgs"
        },
        "returnType": {
          "type": "boolean"
        }
      },
      "keyManagerEncryptJWE": {
        "description": "Encrypts data",
        "arguments": {
          "$ref": "#/components/schemas/IKeyManagerEncryptJWEArgs"
        },
        "returnType": {
          "type": "string"
        }
      },
      "keyManagerGetKey": {
        "description": "Returns an existing key",
        "arguments": {
          "$ref": "#/components/schemas/IKeyManagerGetKeyArgs"
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
      "keyManagerImportKey": {
        "description": "Imports a created key",
        "arguments": {
          "$ref": "#/components/schemas/IKey"
        },
        "returnType": {
          "type": "boolean"
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
}