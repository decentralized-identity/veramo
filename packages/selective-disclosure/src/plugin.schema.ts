export const schema = {
  "ISelectiveDisclosure": {
    "components": {
      "schemas": {
        "ICreateProfileCredentialsArgs": {
          "description": "Profile data",
          "properties": {
            "holder": {
              "description": "Holder DID",
              "type": "string"
            },
            "name": {
              "description": "Optional. Name",
              "type": "string"
            },
            "picture": {
              "description": "Optional. Picture URL",
              "type": "string"
            },
            "save": {
              "description": "Save presentation",
              "type": "boolean"
            },
            "send": {
              "description": "Send presentation",
              "type": "boolean"
            },
            "url": {
              "description": "Optional. URL",
              "type": "string"
            },
            "verifier": {
              "description": "Optional. Verifier DID",
              "type": "string"
            }
          },
          "required": [
            "holder",
            "save",
            "send"
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
        "ICreateSelectiveDisclosureRequestArgs": {
          "description": "Contains the parameters of a Selective Disclosure Request.",
          "properties": {
            "data": {
              "$ref": "#/components/schemas/ISelectiveDisclosureRequest"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "ICredentialRequestInput": {
          "description": "Describes a particular credential that is being requested",
          "properties": {
            "claimType": {
              "description": "The name of the claim property that the credential should express.",
              "type": "string"
            },
            "claimValue": {
              "description": "The value of the claim that the credential should express.",
              "type": "string"
            },
            "credentialContext": {
              "description": "The credential context. See  {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context }",
              "type": "string"
            },
            "credentialType": {
              "description": "The credential type. See  {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types }",
              "type": "string"
            },
            "essential": {
              "description": "If it is essential. A response that does not include this credential is not sufficient.",
              "type": "boolean"
            },
            "issuers": {
              "description": "A list of accepted Issuers for this credential.",
              "items": {
                "$ref": "#/components/schemas/Issuer"
              },
              "type": "array"
            },
            "reason": {
              "description": "Motive for requiring this credential.",
              "type": "string"
            }
          },
          "required": [
            "claimType"
          ],
          "type": "object"
        },
        "ISelectiveDisclosureRequest": {
          "description": "Represents the Selective Disclosure request parameters.",
          "properties": {
            "claims": {
              "description": "A list of claims that are being requested",
              "items": {
                "$ref": "#/components/schemas/ICredentialRequestInput"
              },
              "type": "array"
            },
            "credentials": {
              "description": "A list of issuer credentials that the target will use to establish trust",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "issuer": {
              "description": "The issuer of the request",
              "type": "string"
            },
            "replyUrl": {
              "description": "The URL where the response should be sent back",
              "type": "string"
            },
            "subject": {
              "description": "The target of the request",
              "type": "string"
            },
            "tag": {
              "type": "string"
            }
          },
          "required": [
            "issuer",
            "claims"
          ],
          "type": "object"
        },
        "Issuer": {
          "description": "Used for requesting Credentials using Selective Disclosure. Represents an accepted issuer of a credential.",
          "properties": {
            "did": {
              "description": "The DID of the issuer of a requested credential.",
              "type": "string"
            },
            "url": {
              "description": "A URL where a credential of that type can be obtained.",
              "type": "string"
            }
          },
          "required": [
            "did",
            "url"
          ],
          "type": "object"
        },
        "IGetVerifiableCredentialsForSdrArgs": {
          "description": "Encapsulates the params needed to gather credentials to fulfill a Selective disclosure request.",
          "properties": {
            "did": {
              "description": "The DID of the subject",
              "type": "string"
            },
            "sdr": {
              "description": "The Selective Disclosure Request (issuer is omitted)",
              "properties": {
                "claims": {
                  "description": "A list of claims that are being requested",
                  "items": {
                    "$ref": "#/components/schemas/ICredentialRequestInput"
                  },
                  "type": "array"
                },
                "credentials": {
                  "description": "A list of issuer credentials that the target will use to establish trust",
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "replyUrl": {
                  "description": "The URL where the response should be sent back",
                  "type": "string"
                },
                "subject": {
                  "description": "The target of the request",
                  "type": "string"
                },
                "tag": {
                  "type": "string"
                }
              },
              "required": [
                "claims"
              ],
              "type": "object"
            }
          },
          "required": [
            "sdr"
          ],
          "type": "object"
        },
        "ICredentialsForSdr": {
          "description": "The credentials that make up a response of a Selective Disclosure",
          "properties": {
            "claimType": {
              "description": "The name of the claim property that the credential should express.",
              "type": "string"
            },
            "claimValue": {
              "description": "The value of the claim that the credential should express.",
              "type": "string"
            },
            "credentialContext": {
              "description": "The credential context. See  {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context }",
              "type": "string"
            },
            "credentialType": {
              "description": "The credential type. See  {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types }",
              "type": "string"
            },
            "credentials": {
              "items": {
                "$ref": "#/components/schemas/UniqueVerifiableCredential"
              },
              "type": "array"
            },
            "essential": {
              "description": "If it is essential. A response that does not include this credential is not sufficient.",
              "type": "boolean"
            },
            "issuers": {
              "description": "A list of accepted Issuers for this credential.",
              "items": {
                "$ref": "#/components/schemas/Issuer"
              },
              "type": "array"
            },
            "reason": {
              "description": "Motive for requiring this credential.",
              "type": "string"
            }
          },
          "required": [
            "claimType",
            "credentials"
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
        "IValidatePresentationAgainstSdrArgs": {
          "description": "A tuple used to verify a Selective Disclosure Response. Encapsulates the response(`presentation`) and the corresponding request (`sdr`) that made it.",
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
          "type": "object"
        },
        "IPresentationValidationResult": {
          "description": "The result of a selective disclosure response validation.",
          "properties": {
            "claims": {
              "items": {
                "$ref": "#/components/schemas/ICredentialsForSdr"
              },
              "type": "array"
            },
            "valid": {
              "type": "boolean"
            }
          },
          "required": [
            "valid",
            "claims"
          ],
          "type": "object"
        }
      },
      "methods": {
        "createProfilePresentation": {
          "description": "",
          "arguments": {
            "$ref": "#/components/schemas/ICreateProfileCredentialsArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/VerifiablePresentation"
          }
        },
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
}