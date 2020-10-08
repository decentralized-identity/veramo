export default {
  "components": {
    "schemas": {
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
        "description": "Used for requesting Credentials using Selective Disclosure. Represents an accepted issuer of a credential."
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
        "description": "A tuple used to verify a Selective Disclosure Response. Encapsulates the response(`presentation`) and the corresponding request (`sdr`) that made it."
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
      }
    },
    "methods": {
      "createSelectiveDisclosureRequest": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/ICreateSelectiveDisclosureRequestArgs"
        },
        "returnType": {
          "type": "string"
        }
      },
      "getVerifiableCredentialsForSdr": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/IGetVerifiableCredentialsForSdrArgs"
        },
        "returnType": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/ICredentialsForSdr"
          }
        }
      },
      "validatePresentationAgainstSdr": {
        "description": "",
        "arguments": {
          "$ref": "#/components/schemas/IValidatePresentationAgainstSdrArgs"
        },
        "returnType": {
          "$ref": "#/components/schemas/IPresentationValidationResult"
        }
      }
    }
  }
}