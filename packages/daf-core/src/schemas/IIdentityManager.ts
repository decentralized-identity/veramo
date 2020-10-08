export default {
  "components": {
    "schemas": {
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
            "type": "object",
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
            "type": "object",
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
            "type": "object",
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
            "type": "object",
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
            "type": "object",
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
            "type": "object",
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
      "IIdentityManagerSetAliasArgs": {
        "type": "object",
        "properties": {
          "did": {
            "type": "string",
            "description": "Required. DID"
          },
          "alias": {
            "type": "string",
            "description": "Required. Identity alias"
          }
        },
        "required": [
          "did",
          "alias"
        ],
        "additionalProperties": false,
        "description": "Input arguments for {@link IIdentityManager.identityManagerSetAlias | identityManagerSetAlias}"
      }
    },
    "methods": {
      "identityManagerAddKey": {
        "description": "Adds a key to a DID Document",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerAddKeyArgs"
        },
        "returnType": {
          "type": "object"
        }
      },
      "identityManagerAddService": {
        "description": "Adds a service to a DID Document",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerAddServiceArgs"
        },
        "returnType": {
          "type": "object"
        }
      },
      "identityManagerCreateIdentity": {
        "description": "Creates and returns a new identity",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerCreateIdentityArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IIdentity"
        }
      },
      "identityManagerDeleteIdentity": {
        "description": "Deletes identity",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerDeleteIdentityArgs"
        },
        "returnType": {
          "type": "boolean"
        }
      },
      "identityManagerGetIdentities": {
        "description": "Returns a list of managed identities",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerGetIdentitiesArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/IIdentity"
          }
        }
      },
      "identityManagerGetIdentity": {
        "description": "Returns a specific identity",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerGetIdentityArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IIdentity"
        }
      },
      "identityManagerGetIdentityByAlias": {
        "description": "Returns a specific identity by alias",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerGetIdentityByAliasArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IIdentity"
        }
      },
      "identityManagerGetOrCreateIdentity": {
        "description": "Returns an existing identity or creates a new one for a specific alias",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerGetOrCreateIdentityArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IIdentity"
        }
      },
      "identityManagerGetProviders": {
        "description": "Returns a list of available identity providers",
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
      "identityManagerImportIdentity": {
        "description": "Imports identity",
        "arguments": {
          "$ref": "#/components/schemas/IIdentity"
        },
        "returnType": {
          "$ref": "#/components/schemas/IIdentity"
        }
      },
      "identityManagerRemoveKey": {
        "description": "Removes a key from a DID Document",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerRemoveKeyArgs"
        },
        "returnType": {
          "type": "object"
        }
      },
      "identityManagerRemoveService": {
        "description": "Removes a service from a DID Document",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerRemoveServiceArgs"
        },
        "returnType": {
          "type": "object"
        }
      },
      "identityManagerSetAlias": {
        "description": "Sets identity alias",
        "arguments": {
          "$ref": "#/components/schemas/IIdentityManagerSetAliasArgs"
        },
        "returnType": {
          "type": "boolean"
        }
      }
    }
  }
}