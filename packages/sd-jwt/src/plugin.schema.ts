export const schema = {
  ISDJwtPlugin: {
    components: {
      schemas: {
        ICreateSdJwtVcArgs: {
          type: 'object',
          properties: {
            credentialPayload: {
              type: 'object',
              properties: {
                iss: {
                  type: 'string',
                },
                iat: {
                  type: 'number',
                },
                nbf: {
                  type: 'number',
                },
                exp: {
                  type: 'number',
                },
                cnf: {},
                vct: {
                  type: 'string',
                },
                status: {},
                sub: {
                  type: 'string',
                },
              },
              required: ['iss', 'iat', 'vct'],
            },
            disclosureFrame: {},
          },
          required: ['credentialPayload'],
          description: 'ICreateSdJwtVcArgs',
        },
        ICreateSdJwtVcResult: {
          type: 'object',
          properties: {
            credential: {
              type: 'string',
              description: 'the encoded sd-jwt credential',
            },
          },
          required: ['credential'],
          description: 'ICreateSdJwtVcResult',
        },
        ICreateSdJwtVcPresentationArgs: {
          type: 'object',
          properties: {
            presentation: {
              type: 'string',
              description: 'Encoded SD-JWT credential',
            },
            presentationKeys: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            kb: {
              type: 'object',
              properties: {
                payload: {
                  type: 'object',
                  properties: {
                    iat: {
                      type: 'number',
                    },
                    aud: {
                      type: 'string',
                    },
                    nonce: {
                      type: 'string',
                    },
                  },
                  required: ['iat', 'aud', 'nonce'],
                },
              },
              required: ['payload'],
              description: 'Information to include to add key binding.',
            },
          },
          required: ['presentation'],
        },
        ICreateSdJwtVcPresentationResult: {
          type: 'object',
          properties: {
            presentation: {
              type: 'string',
              description: 'Encoded presentation.',
            },
          },
          required: ['presentation'],
          description: 'Created presentation',
        },
        IVerifySdJwtVcArgs: {
          type: 'object',
          properties: {
            credential: {
              type: 'string',
            },
          },
          required: ['credential'],
        },
        IVerifySdJwtVcResult: {
          type: 'object',
          properties: {
            verifiedPayloads: {},
          },
          required: ['verifiedPayloads'],
        },
        IVerifySdJwtVcPresentationArgs: {
          type: 'object',
          properties: {
            presentation: {
              type: 'string',
            },
            requiredClaimKeys: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            kb: {
              type: 'boolean',
            },
          },
          required: ['presentation'],
        },
        IVerifySdJwtVcPresentationResult: {
          type: 'object',
          properties: {
            verifiedPayloads: {
              type: 'object',
              additionalProperties: {},
            },
          },
          required: ['verifiedPayloads'],
        },
      },
      methods: {
        createSdJwtVc: {
          description: 'Create a signed SD-JWT credential.',
          arguments: {
            $ref: '#/components/schemas/ICreateSdJwtVcArgs',
          },
          returnType: {
            $ref: '#/components/schemas/ICreateSdJwtVcResult',
          },
        },
        createSdJwtVcPresentation: {
          description: 'Create a signed SD-JWT presentation.',
          arguments: {
            $ref: '#/components/schemas/ICreateSdJwtVcPresentationArgs',
          },
          returnType: {
            $ref: '#/components/schemas/ICreateSdJwtVcPresentationResult',
          },
        },
        verifySdJwtVc: {
          description: 'Verify a signed SD-JWT credential.',
          arguments: {
            $ref: '#/components/schemas/IVerifySdJwtVcArgs',
          },
          returnType: {
            $ref: '#/components/schemas/IVerifySdJwtVcResult',
          },
        },
        verifySdJwtVcPresentation: {
          description: 'Verify a signed SD-JWT presentation.',
          arguments: {
            $ref: '#/components/schemas/IVerifySdJwtVcPresentationArgs',
          },
          returnType: {
            $ref: '#/components/schemas/IVerifySdJwtVcPresentationResult',
          },
        },
      },
    },
  },
}
