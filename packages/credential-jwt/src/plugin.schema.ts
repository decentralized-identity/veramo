export const schema = {
  "ICredentialIssuerJWT": {
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
            "EthereumEip712Signature2021",
            "bbs"
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
        "ICreateVerifiablePresentationJWTArgs": {
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
              "description": "The json payload of the Presentation according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model } .\n\nThe signer of the Presentation is chosen based on the `holder` property of the `presentation`\n\n`@context`, `type` and `issuanceDate` will be added automatically if omitted."
            },
            "challenge": {
              "type": "string",
              "description": "Optional (only JWT) string challenge parameter to add to the verifiable presentation."
            },
            "domain": {
              "type": "string",
              "description": "Optional string domain parameter to add to the verifiable presentation."
            },
            "keyRef": {
              "type": "string",
              "description": "Optional. The key handle ( {@link  @veramo/core-types#IKey.kid | IKey.kid } ) from the internal database."
            },
            "fetchRemoteContexts": {
              "type": "boolean",
              "description": "Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.\n\nDefaults to `false`"
            }
          },
          "required": [
            "presentation"
          ],
          "additionalProperties": {
            "description": "Any other options that can be forwarded to the lower level libraries"
          },
          "description": "Encapsulates the parameters required to create a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }  using the  {@link https://w3c-ccg.github.io/ethereum-JWT-signature-2021-spec/ | EthereumJWTSignature2021 }  proof format."
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
        "IVerifyCredentialJWTArgs": {
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
              "description": "The json payload of the Credential according to the  {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model } \n\nThe signer of the Credential is chosen based on the `issuer.id` property of the `credential`"
            }
          },
          "required": [
            "credential"
          ],
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential }"
        },
        "IVerifyPresentationJWTArgs": {
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
              "$ref": "#/components/schemas/VerifiablePresentation",
              "description": "The Verifiable Presentation object according to the  {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model }  or the JWT representation.\n\nThe signer of the Presentation is verified based on the `holder` property of the `presentation` or the `iss` property of the JWT payload respectively"
            }
          },
          "required": [
            "presentation"
          ],
          "description": "Encapsulates the parameters required to verify a  {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation }"
        }
      },
      "methods": {
        "createVerifiableCredentialJWT": {
          "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
          "arguments": {
            "$ref": "#/components/schemas/ICreateVerifiableCredentialArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/VerifiableCredential"
          }
        },
        "createVerifiablePresentationJWT": {
          "description": "Creates a Verifiable Presentation. The payload and signer are chosen based on the ",
          "arguments": {
            "$ref": "#/components/schemas/ICreateVerifiablePresentationJWTArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/VerifiablePresentation"
          }
        },
        "verifyCredentialJWT": {
          "description": "Verifies a Verifiable Credential in JWT Format.",
          "arguments": {
            "$ref": "#/components/schemas/IVerifyCredentialJWTArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        },
        "verifyPresentationJWT": {
          "description": "Verifies a Verifiable Presentation JWT Format.",
          "arguments": {
            "$ref": "#/components/schemas/IVerifyPresentationJWTArgs"
          },
          "returnType": {
            "type": "boolean"
          }
        }
      }
    }
  }
}