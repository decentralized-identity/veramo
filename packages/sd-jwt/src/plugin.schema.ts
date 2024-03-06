export const schema = {
  "ISDJwtPlugin": {
    "components": {
      "schemas": {
        "IcreateSDJwtVcArgs": {
          "type": 'object',
          "properties": {
            "credentialPayload": {
              "$ref": '#/components/schemas/CredentialPayload',
            },
            "disclosureFrame": {},
          },
          "required": ['credentialPayload'],
          "description": 'IcreateSDJwtVcArgs',
        },
        "CredentialPayload": {
          "type": 'object',
          "properties": {
            "issuer": {
              "$ref": '#/components/schemas/IssuerType',
            },
            "credentialSubject": {
              "$ref": '#/components/schemas/CredentialSubject',
            },
            "type": {
              "type": 'array',
              "items": {
                "type": 'string',
              },
            },
            '@context': {
              "$ref": '#/components/schemas/ContextType',
            },
            "issuanceDate": {
              "$ref": '#/components/schemas/DateType',
            },
            "expirationDate": {
              "$ref": '#/components/schemas/DateType',
            },
            "credentialStatus": {
              "$ref": '#/components/schemas/CredentialStatusReference',
            },
            "id": {
              "type": 'string',
            },
          },
          "required": ['issuer'],
          "description": 'Used as input when creating Verifiable Credentials',
        },
        "IssuerType": {
          "anyOf": [
            {
              "type": 'object',
              "properties": {
                "id": {
                  "type": 'string',
                },
              },
              "required": ['id'],
            },
            {
              'type': 'string',
            },
          ],
          "description":
            'The issuer of a  {@link  VerifiableCredential }  or the holder of a  {@link  VerifiablePresentation } .\n\nThe value of the issuer property MUST be either a URI or an object containing an id property. It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document containing machine-readable information about the issuer that can be used to verify the information expressed in the credential.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model }',
        },
        "CredentialSubject": {
          "type": 'object',
          "properties": {
            "id": {
              "type": 'string',
            },
          },
          "description":
            'The value of the credentialSubject property is defined as a set of objects that contain one or more properties that are each related to a subject of the verifiable credential. Each object MAY contain an id.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject }',
        },
        "ContextType": {
          "anyOf": [
            {
              "type": 'string',
            },
            {
              "type": 'object',
            },
            {
              "type": 'array',
              "items": {
                "anyOf": [
                  {
                    "type": 'string',
                  },
                  {
                    "type": 'object',
                  },
                ],
              },
            },
          ],
          "description": 'The data type for `@context` properties of credentials, presentations, etc.',
        },
        "DateType": {
          "type": 'string',
          "description":
            'Represents an issuance or expiration date for Credentials / Presentations. This is used as input when creating them.',
        },
        "CredentialStatusReference": {
          "type": 'object',
          "properties": {
            "id": {
              "type": 'string',
            },
            "type": {
              "type": 'string',
            },
          },
          "required": ['id', 'type'],
          "description":
            'Used for the discovery of information about the current status of a verifiable credential, such as whether it is suspended or revoked. The precise contents of the credential status information is determined by the specific `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.\n\nSee  {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status }',
        },
        "IcreateSDJwtVcResult": {
          "type": 'object',
          "properties": {
            "credential": {
              "type": 'string',
            },
          },
          "required": ['credential'],
          "description": 'IcreateSDJwtVcResult',
        },
        "ICreateSdJwtVcPresentationArgs": {
          "type": 'object',
          "properties": {
            "presentation": {
              "type": 'string',
            },
            "presentationKeys": {
              "type": 'array',
              "items": {
                "type": 'string',
              },
            },
          },
          "required": ['presentation'],
        },
        "ICreateSdJwtVcPresentationResult": {
          "type": 'object',
          "properties": {
            "presentation": {
              "type": 'string',
            },
          },
          "required": ['presentation'],
        },
        "IVerifySdJwtVcArgs": {
          "type": 'object',
          "properties": {
            "credential": {
              "type": 'string',
            },
          },
          "required": ['credential'],
        },
        "IVerifySdJwtVcResult": {
          "type": 'object',
        },
        "IVerifySdJwtVcPresentationArgs": {
          "type": 'object',
          "properties": {
            "presentation": {
              "type": 'string',
            },
            "requiredClaimKeys": {
              "type": 'array',
              "items": {
                "type": 'string',
              },
            },
          },
          "required": ['presentation'],
        },
        "IVerifySdJwtVcPresentationResult": {
          "type": 'object',
          "properties": {
            "verifiedPayloads": {},
          },
          "required": ['verifiedPayloads'],
        },
      },
      "methods": {
        "createSDJwtVc": {
          "description": 'Create a signed SD-JWT credential.',
          "arguments": {
            "$ref": '#/components/schemas/IcreateSDJwtVcArgs',
          },
          "returnType": {
            "$ref": '#/components/schemas/IcreateSDJwtVcResult',
          },
        },
        "createSdJwtVcPresentation": {
          "description": 'Create a signed SD-JWT presentation.',
          "arguments": {
            "$ref": '#/components/schemas/ICreateSdJwtVcPresentationArgs',
          },
          "returnType": {
            "$ref": '#/components/schemas/ICreateSdJwtVcPresentationResult',
          },
        },
        "verifySdJwtVc": {
          "description": 'Verify a signed SD-JWT credential.',
          "arguments": {
            "$ref": '#/components/schemas/IVerifySdJwtVcArgs',
          },
          "returnType": {
            "$ref": '#/components/schemas/IVerifySdJwtVcResult',
          },
        },
        "verifySdJwtVcPresentation": {
          "description": 'Verify a signed SD-JWT presentation.',
          "arguments": {
            "$ref": '#/components/schemas/IVerifySdJwtVcPresentationArgs',
          },
          "returnType": {
            "$ref": '#/components/schemas/IVerifySdJwtVcPresentationResult',
          },
        },
      },
    },
  },
}
