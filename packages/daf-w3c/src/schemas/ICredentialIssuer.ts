export default {
  "components": {
    "schemas": {
      "ICreateVerifiableCredentialArgs": {
        "type": "object",
        "properties": {
          "credential": {
            "$ref": "#/components/schemas/W3CCredential",
            "description": "The json payload of the Credential according to the {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}\n\nThe signer of the Credential is chosen based on the `issuer.id` property of the `credential`"
          },
          "save": {
            "type": "boolean",
            "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the {@link daf-core#IDataStore | storage plugin} to be saved"
          },
          "proofFormat": {
            "$ref": "#/components/schemas/EncodingFormat",
            "description": "The desired format for the VerifiablePresentation to be created. Currently, only JWT is supported"
          }
        },
        "required": [
          "credential",
          "proofFormat"
        ],
        "additionalProperties": false,
        "description": "Encapsulates the parameters required to create a {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}"
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
        "description": "This data type represents a parsed VerifiableCredential. It is meant to be an unambiguous representation of the properties of a Credential and is usually the result of a transformation method.\n\n`issuer` is always an object with an `id` property and potentially other app specific issuer claims `issuanceDate` is an ISO DateTime string `expirationDate`, is a nullable ISO DateTime string\n\nAny JWT specific properties are transformed to the broader W3C variant and any app specific properties are left intact"
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
        "const": "jwt",
        "description": "The type of encoding to be used for the Verifiable Credential or Presentation to be generated.\n\nOnly `jwt` is supported at the moment."
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
      "ICreateVerifiablePresentationArgs": {
        "type": "object",
        "properties": {
          "presentation": {
            "$ref": "#/components/schemas/W3CPresentation",
            "description": "The json payload of the Presentation according to the {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.\n\nThe signer of the Presentation is chosen based on the `holder` property of the `presentation`"
          },
          "save": {
            "type": "boolean",
            "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the {@link daf-core#IDataStore | storage plugin} to be saved"
          },
          "proofFormat": {
            "$ref": "#/components/schemas/EncodingFormat",
            "description": "The desired format for the VerifiablePresentation to be created. Currently, only JWT is supported"
          }
        },
        "required": [
          "presentation",
          "proofFormat"
        ],
        "additionalProperties": false,
        "description": "Encapsulates the parameters required to create a {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}"
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
        "description": "This data type represents a parsed Presentation payload. It is meant to be an unambiguous representation of the properties of a Presentation and is usually the result of a transformation method.\n\nThe `verifiableCredential` array should contain parsed `Verifiable-Credential` elements. Any JWT specific properties are transformed to the broader W3C variant and any other app specific properties are left intact."
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
      }
    }
  }
}