export const schema = {
  "ISelectiveDisclosure": {
    "components": {
      "schemas": {
        "ICreateProfileCredentialsArgs": {
          "type": "object",
          "properties": {
            "holder": {
              "type": "string",
              "description": "Holder DID"
            },
            "verifier": {
              "type": "string",
              "description": "Optional. Verifier DID"
            },
            "name": {
              "type": "string",
              "description": "Optional. Name"
            },
            "picture": {
              "type": "string",
              "description": "Optional. Picture URL"
            },
            "url": {
              "type": "string",
              "description": "Optional. URL"
            },
            "save": {
              "type": "boolean",
              "description": "Save presentation"
            },
            "send": {
              "type": "boolean",
              "description": "Send presentation"
            }
          },
          "required": [
            "holder",
            "save",
            "send"
          ],
          "description": "Profile data"
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
        "ProofType": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            }
          },
          "description": "A proof property of a  {@link  VerifiableCredential }  or  {@link  VerifiablePresentation }"
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
              "description": "The credential type. See  {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types }"
            },
            "credentialContext": {
              "type": "string",
              "description": "The credential context. See  {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context }"
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
              "description": "The credential type. See  {@link https://www.w3.org/TR/vc-data-model/#types | W3C Credential Types }"
            },
            "credentialContext": {
              "type": "string",
              "description": "The credential context. See  {@link https://www.w3.org/TR/vc-data-model/#contexts | W3C Credential Context }"
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
                "$ref": "#/components/schemas/UniqueVerifiableCredential"
              }
            }
          },
          "required": [
            "claimType",
            "credentials"
          ],
          "description": "The credentials that make up a response of a Selective Disclosure"
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
          "description": "A tuple used to verify a Selective Disclosure Response. Encapsulates the response(`presentation`) and the corresponding request (`sdr`) that made it."
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
          "description": "The result of a selective disclosure response validation."
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