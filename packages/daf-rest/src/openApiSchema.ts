import { OpenAPIV3 } from 'openapi-types'
export const openApiSchema: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'DAF OpenAPI',
    version: '',
  },
  components: {
    schemas: {
      ResolveDidArgs: {
        description: 'Input arguments for {@link IResolveDid.resolveDid}',
        type: 'object',
        properties: {
          didUrl: {
            description: 'DID URL',
            type: 'string',
          },
        },
        required: ['didUrl'],
      },
      DIDDocument: {
        type: 'object',
        properties: {
          '@context': {
            type: 'string',
            enum: ['https://w3id.org/did/v1'],
          },
          id: {
            type: 'string',
          },
          publicKey: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PublicKey',
            },
          },
          authentication: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Authentication',
            },
          },
          uportProfile: {},
          service: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ServiceEndpoint',
            },
          },
        },
        required: ['@context', 'id', 'publicKey'],
      },
      PublicKey: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          owner: {
            type: 'string',
          },
          ethereumAddress: {
            type: 'string',
          },
          publicKeyBase64: {
            type: 'string',
          },
          publicKeyBase58: {
            type: 'string',
          },
          publicKeyHex: {
            type: 'string',
          },
          publicKeyPem: {
            type: 'string',
          },
        },
        required: ['id', 'owner', 'type'],
      },
      Authentication: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
          },
          publicKey: {
            type: 'string',
          },
        },
        required: ['publicKey', 'type'],
      },
      ServiceEndpoint: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          serviceEndpoint: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
        },
        required: ['id', 'serviceEndpoint', 'type'],
      },
      IMessage: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          createdAt: {
            type: 'string',
          },
          expiresAt: {
            type: 'string',
          },
          threadId: {
            type: 'string',
          },
          raw: {
            type: 'string',
          },
          data: {},
          replyTo: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          replyUrl: {
            type: 'string',
          },
          from: {
            type: 'string',
          },
          to: {
            type: 'string',
          },
          metaData: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/IMetaData',
            },
          },
          credentials: {
            type: 'array',
            items: {
              allOf: [
                {
                  allOf: [
                    {
                      $ref:
                        '#/components/schemas/Pick<FixedCredentialPayload,"id"|"credentialSubject"|"credentialStatus">',
                    },
                    {
                      $ref: '#/components/schemas/NarrowCredentialDefinitions',
                    },
                    {
                      type: 'object',
                      additionalProperties: {},
                    },
                  ],
                },
                {
                  type: 'object',
                  properties: {
                    proof: {
                      $ref: '#/components/schemas/Proof',
                    },
                  },
                  required: ['proof'],
                },
              ],
            },
          },
          presentations: {
            type: 'array',
            items: {
              allOf: [
                {
                  allOf: [
                    {
                      $ref:
                        '#/components/schemas/Pick<FixedPresentationPayload,"id"|"issuanceDate"|"expirationDate"|"holder">',
                    },
                    {
                      $ref: '#/components/schemas/NarrowPresentationDefinitions',
                    },
                    {
                      type: 'object',
                      additionalProperties: {},
                    },
                  ],
                },
                {
                  type: 'object',
                  properties: {
                    proof: {
                      $ref: '#/components/schemas/Proof',
                    },
                  },
                  required: ['proof'],
                },
              ],
            },
          },
        },
        required: ['id', 'type'],
      },
      IMetaData: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
        },
        required: ['type'],
      },
      'Pick<FixedCredentialPayload,"id"|"credentialSubject"|"credentialStatus">': {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          credentialSubject: {
            type: 'object',
            additionalProperties: {},
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          },
          credentialStatus: {
            $ref: '#/components/schemas/CredentialStatus',
          },
        },
        required: ['credentialSubject'],
      },
      CredentialStatus: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
        required: ['id', 'type'],
      },
      NarrowCredentialDefinitions: {
        description: 'This is meant to reflect unambiguous types for the properties in `CredentialPayload`',
        type: 'object',
        properties: {
          '@context': {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          type: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          issuer: {
            description: 'Exclude from T those types that are assignable to U',
            type: 'object',
            additionalProperties: {},
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          },
          issuanceDate: {
            type: 'string',
          },
          expirationDate: {
            type: 'string',
          },
        },
        required: ['@context', 'issuanceDate', 'issuer', 'type'],
      },
      Proof: {
        type: 'object',
        additionalProperties: {},
        properties: {
          type: {
            type: 'string',
          },
        },
      },
      'Pick<FixedPresentationPayload,"id"|"issuanceDate"|"expirationDate"|"holder">': {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          issuanceDate: {
            type: 'string',
          },
          expirationDate: {
            type: 'string',
          },
          holder: {
            type: 'string',
          },
        },
        required: ['holder'],
      },
      NarrowPresentationDefinitions: {
        type: 'object',
        properties: {
          '@context': {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          type: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          verifier: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          verifiableCredential: {
            type: 'array',
            items: {
              allOf: [
                {
                  allOf: [
                    {
                      $ref:
                        '#/components/schemas/Pick<FixedCredentialPayload,"id"|"credentialSubject"|"credentialStatus">',
                    },
                    {
                      $ref: '#/components/schemas/NarrowCredentialDefinitions',
                    },
                    {
                      type: 'object',
                      additionalProperties: {},
                    },
                  ],
                },
                {
                  type: 'object',
                  properties: {
                    proof: {
                      $ref: '#/components/schemas/Proof',
                    },
                  },
                  required: ['proof'],
                },
              ],
            },
          },
        },
        required: ['@context', 'type', 'verifiableCredential', 'verifier'],
      },
      IKeyManagerCreateKeyArgs: {
        type: 'object',
        properties: {
          type: {
            $ref: '#/components/schemas/TKeyType',
          },
          kms: {
            type: 'string',
          },
          meta: {
            $ref: '#/components/schemas/Record<string,any>',
          },
        },
        required: ['kms', 'type'],
      },
      TKeyType: {
        enum: ['Ed25519', 'Secp256k1'],
        type: 'string',
      },
      'Record<string,any>': {
        description: 'Construct a type with a set of properties K of type T',
        type: 'object',
      },
      IKey: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
          kms: {
            type: 'string',
          },
          type: {
            $ref: '#/components/schemas/TKeyType',
          },
          publicKeyHex: {
            type: 'string',
          },
          privateKeyHex: {
            type: 'string',
          },
          meta: {
            $ref: '#/components/schemas/Record<string,any>',
          },
        },
        required: ['kid', 'kms', 'publicKeyHex', 'type'],
      },
      IKeyManagerDecryptJWEArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
          data: {
            type: 'string',
          },
        },
        required: ['data', 'kid'],
      },
      IKeyManagerDeleteKeyArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
        },
        required: ['kid'],
      },
      IKeyManagerEncryptJWEArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
          to: {
            $ref: '#/components/schemas/Pick<IKey,"meta"|"type"|"kid"|"publicKeyHex"|"privateKeyHex">',
          },
          data: {
            type: 'string',
          },
        },
        required: ['data', 'kid', 'to'],
      },
      'Pick<IKey,"meta"|"type"|"kid"|"publicKeyHex"|"privateKeyHex">': {
        description: 'Construct a type with the properties of T except for those in type K.',
        type: 'object',
        properties: {
          meta: {
            $ref: '#/components/schemas/Record<string,any>',
          },
          type: {
            $ref: '#/components/schemas/TKeyType',
          },
          kid: {
            type: 'string',
          },
          publicKeyHex: {
            type: 'string',
          },
          privateKeyHex: {
            type: 'string',
          },
        },
        required: ['kid', 'publicKeyHex', 'type'],
      },
      IKeyManagerGetKeyArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
        },
        required: ['kid'],
      },
      IKeyManagerSignEthTXArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
          transaction: {
            type: 'object',
            properties: {},
            additionalProperties: true,
          },
        },
        required: ['kid', 'transaction'],
      },
      IKeyManagerSignJWTArgs: {
        type: 'object',
        properties: {
          kid: {
            type: 'string',
          },
          data: {
            type: 'string',
          },
        },
        required: ['data', 'kid'],
      },
      EcdsaSignature: {
        type: 'object',
        properties: {
          r: {
            type: 'string',
          },
          s: {
            type: 'string',
          },
          recoveryParam: {
            type: 'number',
          },
        },
        required: ['r', 's'],
      },
      IIdentityManagerAddKeyArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          key: {
            $ref: '#/components/schemas/IKey',
          },
          options: {},
        },
        required: ['did', 'key'],
      },
      IIdentityManagerAddServiceArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          service: {
            $ref: '#/components/schemas/IService',
          },
          options: {},
        },
        required: ['did', 'service'],
      },
      IService: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          serviceEndpoint: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
        },
        required: ['id', 'serviceEndpoint', 'type'],
      },
      IIdentityManagerCreateIdentityArgs: {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          provider: {
            type: 'string',
          },
          kms: {
            type: 'string',
          },
          options: {},
        },
      },
      IIdentity: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          alias: {
            type: 'string',
          },
          provider: {
            type: 'string',
          },
          controllerKeyId: {
            type: 'string',
          },
          keys: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/IKey',
            },
          },
          services: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/IService',
            },
          },
        },
        required: ['controllerKeyId', 'did', 'keys', 'provider', 'services'],
      },
      IIdentityManagerDeleteIdentityArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
        },
        required: ['did'],
      },
      IIdentityManagerGetIdentityArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
        },
        required: ['did'],
      },
      IIdentityManagerGetOrCreateIdentityArgs: {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          provider: {
            type: 'string',
          },
          kms: {
            type: 'string',
          },
          options: {},
        },
        required: ['alias'],
      },
      IIdentityManagerRemoveKeyArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          kid: {
            type: 'string',
          },
          options: {},
        },
        required: ['did', 'kid'],
      },
      IIdentityManagerRemoveServiceArgs: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          id: {
            type: 'string',
          },
          options: {},
        },
        required: ['did', 'id'],
      },
      IHandleMessageArgs: {
        type: 'object',
        properties: {
          raw: {
            type: 'string',
          },
          metaData: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/IMetaData',
            },
          },
          save: {
            type: 'boolean',
          },
        },
        required: ['raw'],
      },
      ArrayBuffer: {
        description:
          'Represents a raw buffer of binary data, which is used to store data for the\ndifferent typed arrays. ArrayBuffers cannot be read from or written to directly,\nbut can be passed to a typed array or DataView Object to interpret the raw\nbuffer as needed.',
        type: 'object',
        properties: {
          byteLength: {
            description: 'Read-only. The length of the ArrayBuffer (in bytes).',
            type: 'number',
          },
          '__@toStringTag': {
            type: 'string',
          },
        },
        required: ['__@toStringTag', 'byteLength'],
      },
      ICreateSelectiveDisclosureRequestArgs: {
        type: 'object',
        properties: {
          data: {
            $ref: '#/components/schemas/ISelectiveDisclosureRequest',
          },
        },
        required: ['data'],
      },
      ISelectiveDisclosureRequest: {
        type: 'object',
        properties: {
          issuer: {
            type: 'string',
          },
          subject: {
            type: 'string',
          },
          replyUrl: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
          claims: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ICredentialRequestInput',
            },
          },
          credentials: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        required: ['claims', 'issuer'],
      },
      ICredentialRequestInput: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
          },
          essential: {
            type: 'boolean',
          },
          credentialType: {
            type: 'string',
          },
          credentialContext: {
            type: 'string',
          },
          claimType: {
            type: 'string',
          },
          claimValue: {
            type: 'string',
          },
          issuers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Issuer',
            },
          },
        },
        required: ['claimType'],
      },
      Issuer: {
        type: 'object',
        properties: {
          did: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
        },
        required: ['did', 'url'],
      },
      IGetVerifiableCredentialsForSdrArgs: {
        type: 'object',
        properties: {
          sdr: {
            $ref:
              '#/components/schemas/Pick<ISelectiveDisclosureRequest,"replyUrl"|"subject"|"tag"|"claims"|"credentials">',
          },
          did: {
            type: 'string',
          },
        },
        required: ['sdr'],
      },
      'Pick<ISelectiveDisclosureRequest,"replyUrl"|"subject"|"tag"|"claims"|"credentials">': {
        description: 'Construct a type with the properties of T except for those in type K.',
        type: 'object',
        properties: {
          replyUrl: {
            type: 'string',
          },
          subject: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
          claims: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ICredentialRequestInput',
            },
          },
          credentials: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        required: ['claims'],
      },
      ICredentialsForSdr: {
        type: 'object',
        properties: {
          credentials: {
            type: 'array',
            items: {
              allOf: [
                {
                  allOf: [
                    {
                      $ref:
                        '#/components/schemas/Pick<FixedCredentialPayload,"id"|"credentialSubject"|"credentialStatus">',
                    },
                    {
                      $ref: '#/components/schemas/NarrowCredentialDefinitions',
                    },
                    {
                      type: 'object',
                      additionalProperties: {},
                    },
                  ],
                },
                {
                  type: 'object',
                  properties: {
                    proof: {
                      $ref: '#/components/schemas/Proof',
                    },
                  },
                  required: ['proof'],
                },
              ],
            },
          },
          reason: {
            type: 'string',
          },
          essential: {
            type: 'boolean',
          },
          credentialType: {
            type: 'string',
          },
          credentialContext: {
            type: 'string',
          },
          claimType: {
            type: 'string',
          },
          claimValue: {
            type: 'string',
          },
          issuers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Issuer',
            },
          },
        },
        required: ['claimType', 'credentials'],
      },
      IValidatePresentationAgainstSdrArgs: {
        type: 'object',
        properties: {
          presentation: {
            allOf: [
              {
                allOf: [
                  {
                    $ref:
                      '#/components/schemas/Pick<FixedPresentationPayload,"id"|"issuanceDate"|"expirationDate"|"holder">',
                  },
                  {
                    $ref: '#/components/schemas/NarrowPresentationDefinitions',
                  },
                  {
                    type: 'object',
                    additionalProperties: {},
                  },
                ],
              },
              {
                type: 'object',
                properties: {
                  proof: {
                    $ref: '#/components/schemas/Proof',
                  },
                },
                required: ['proof'],
              },
            ],
          },
          sdr: {
            $ref: '#/components/schemas/ISelectiveDisclosureRequest',
          },
        },
        required: ['presentation', 'sdr'],
      },
      IPresentationValidationResult: {
        type: 'object',
        properties: {
          valid: {
            type: 'boolean',
          },
          claims: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ICredentialsForSdr',
            },
          },
        },
        required: ['claims', 'valid'],
      },
      FindIdentitiesArgs: {
        type: 'object',
        properties: {
          where: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Where<TIdentitiesColumns>',
            },
          },
          order: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Order<TIdentitiesColumns>',
            },
          },
          take: {
            type: 'number',
          },
          skip: {
            type: 'number',
          },
        },
      },
      'Where<TIdentitiesColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Where.TColumns',
          },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          not: {
            type: 'boolean',
          },
          op: {
            enum: [
              'Any',
              'Between',
              'Equal',
              'In',
              'IsNull',
              'LessThan',
              'LessThanOrEqual',
              'Like',
              'MoreThan',
              'MoreThanOrEqual',
            ],
            type: 'string',
          },
        },
        required: ['column'],
      },
      'Where.TColumns': {
        enum: ['alias', 'did', 'provider'],
        type: 'string',
      },
      'Order<TIdentitiesColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Order.TColumns',
          },
          direction: {
            enum: ['ASC', 'DESC'],
            type: 'string',
          },
        },
        required: ['column', 'direction'],
      },
      'Order.TColumns': {
        enum: ['alias', 'did', 'provider'],
        type: 'string',
      },
      FindMessagesArgs: {
        type: 'object',
        properties: {
          where: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Where<TMessageColumns>',
            },
          },
          order: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Order<TMessageColumns>',
            },
          },
          take: {
            type: 'number',
          },
          skip: {
            type: 'number',
          },
        },
      },
      'Where<TMessageColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Where.TColumns_1',
          },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          not: {
            type: 'boolean',
          },
          op: {
            enum: [
              'Any',
              'Between',
              'Equal',
              'In',
              'IsNull',
              'LessThan',
              'LessThanOrEqual',
              'Like',
              'MoreThan',
              'MoreThanOrEqual',
            ],
            type: 'string',
          },
        },
        required: ['column'],
      },
      'Where.TColumns_1': {
        enum: [
          'createdAt',
          'expiresAt',
          'from',
          'id',
          'raw',
          'replyTo',
          'replyUrl',
          'threadId',
          'to',
          'type',
        ],
        type: 'string',
      },
      'Order<TMessageColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Order.TColumns_1',
          },
          direction: {
            enum: ['ASC', 'DESC'],
            type: 'string',
          },
        },
        required: ['column', 'direction'],
      },
      'Order.TColumns_1': {
        enum: [
          'createdAt',
          'expiresAt',
          'from',
          'id',
          'raw',
          'replyTo',
          'replyUrl',
          'threadId',
          'to',
          'type',
        ],
        type: 'string',
      },
      FindCredentialsArgs: {
        type: 'object',
        properties: {
          where: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Where<TCredentialColumns>',
            },
          },
          order: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Order<TCredentialColumns>',
            },
          },
          take: {
            type: 'number',
          },
          skip: {
            type: 'number',
          },
        },
      },
      'Where<TCredentialColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Where.TColumns_2',
          },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          not: {
            type: 'boolean',
          },
          op: {
            enum: [
              'Any',
              'Between',
              'Equal',
              'In',
              'IsNull',
              'LessThan',
              'LessThanOrEqual',
              'Like',
              'MoreThan',
              'MoreThanOrEqual',
            ],
            type: 'string',
          },
        },
        required: ['column'],
      },
      'Where.TColumns_2': {
        enum: ['context', 'expirationDate', 'id', 'issuanceDate', 'issuer', 'subject', 'type'],
        type: 'string',
      },
      'Order<TCredentialColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Order.TColumns_2',
          },
          direction: {
            enum: ['ASC', 'DESC'],
            type: 'string',
          },
        },
        required: ['column', 'direction'],
      },
      'Order.TColumns_2': {
        enum: ['context', 'expirationDate', 'id', 'issuanceDate', 'issuer', 'subject', 'type'],
        type: 'string',
      },
      FindClaimsArgs: {
        type: 'object',
        properties: {
          where: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Where<TClaimsColumns>',
            },
          },
          order: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Order<TClaimsColumns>',
            },
          },
          take: {
            type: 'number',
          },
          skip: {
            type: 'number',
          },
        },
      },
      'Where<TClaimsColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Where.TColumns_3',
          },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          not: {
            type: 'boolean',
          },
          op: {
            enum: [
              'Any',
              'Between',
              'Equal',
              'In',
              'IsNull',
              'LessThan',
              'LessThanOrEqual',
              'Like',
              'MoreThan',
              'MoreThanOrEqual',
            ],
            type: 'string',
          },
        },
        required: ['column'],
      },
      'Where.TColumns_3': {
        enum: [
          'context',
          'credentialType',
          'expirationDate',
          'id',
          'isObj',
          'issuanceDate',
          'issuer',
          'subject',
          'type',
          'value',
        ],
        type: 'string',
      },
      'Order<TClaimsColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Order.TColumns_3',
          },
          direction: {
            enum: ['ASC', 'DESC'],
            type: 'string',
          },
        },
        required: ['column', 'direction'],
      },
      'Order.TColumns_3': {
        enum: [
          'context',
          'credentialType',
          'expirationDate',
          'id',
          'isObj',
          'issuanceDate',
          'issuer',
          'subject',
          'type',
          'value',
        ],
        type: 'string',
      },
      FindPresentationsArgs: {
        type: 'object',
        properties: {
          where: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Where<TPresentationColumns>',
            },
          },
          order: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Order<TPresentationColumns>',
            },
          },
          take: {
            type: 'number',
          },
          skip: {
            type: 'number',
          },
        },
      },
      'Where<TPresentationColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Where.TColumns_4',
          },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          not: {
            type: 'boolean',
          },
          op: {
            enum: [
              'Any',
              'Between',
              'Equal',
              'In',
              'IsNull',
              'LessThan',
              'LessThanOrEqual',
              'Like',
              'MoreThan',
              'MoreThanOrEqual',
            ],
            type: 'string',
          },
        },
        required: ['column'],
      },
      'Where.TColumns_4': {
        enum: ['context', 'expirationDate', 'holder', 'id', 'issuanceDate', 'type', 'verifier'],
        type: 'string',
      },
      'Order<TPresentationColumns>': {
        type: 'object',
        properties: {
          column: {
            $ref: '#/components/schemas/Order.TColumns_4',
          },
          direction: {
            enum: ['ASC', 'DESC'],
            type: 'string',
          },
        },
        required: ['column', 'direction'],
      },
      'Order.TColumns_4': {
        enum: ['context', 'expirationDate', 'holder', 'id', 'issuanceDate', 'type', 'verifier'],
        type: 'string',
      },
      ICreateVerifiableCredentialArgs: {
        type: 'object',
        properties: {
          credential: {
            description:
              'This data type represents a parsed VerifiableCredential.\nIt is meant to be an unambiguous representation of the properties of a Credential and is usually the result of a transformation method.\n\n`issuer` is always an object with an `id` property and potentially other app specific issuer claims\n`issuanceDate` is an ISO DateTime string\n`expirationDate`, is a nullable ISO DateTime string\n\nAny JWT specific properties are transformed to the broader W3C variant and any app specific properties are left intact',
            allOf: [
              {
                $ref:
                  '#/components/schemas/Pick<FixedCredentialPayload,"id"|"credentialSubject"|"credentialStatus">',
              },
              {
                $ref: '#/components/schemas/NarrowCredentialDefinitions',
              },
              {
                type: 'object',
                additionalProperties: {},
              },
            ],
          },
          save: {
            type: 'boolean',
          },
          proofFormat: {
            type: 'string',
            enum: ['jwt'],
          },
        },
        required: ['credential', 'proofFormat'],
      },
      ICreateVerifiablePresentationArgs: {
        type: 'object',
        properties: {
          presentation: {
            description:
              'This data type represents a parsed Presentation payload.\nIt is meant to be an unambiguous representation of the properties of a Presentation and is usually the result of a transformation method.\n\nThe `verifiableCredential` array should contain parsed `Verifiable<Credential>` elements.\nAny JWT specific properties are transformed to the broader W3C variant and any other app specific properties are left intact.',
            allOf: [
              {
                $ref:
                  '#/components/schemas/Pick<FixedPresentationPayload,"id"|"issuanceDate"|"expirationDate"|"holder">',
              },
              {
                $ref: '#/components/schemas/NarrowPresentationDefinitions',
              },
              {
                type: 'object',
                additionalProperties: {},
              },
            ],
          },
          save: {
            type: 'boolean',
          },
          proofFormat: {
            type: 'string',
            enum: ['jwt'],
          },
        },
        required: ['presentation', 'proofFormat'],
      },
    },
  },
  paths: {
    '/resolveDid': {
      post: {
        description: 'Resolves DID and returns DID Document',
        operationId: 'resolveDid',
        parameters: [
          {
            $ref: '#/components/schemas/ResolveDidArgs',
          },
        ],
        responses: {
          '200': {
            description: 'Resolves DID and returns DID Document',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DIDDocument',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreSaveMessage': {
      post: {
        description: '',
        operationId: 'dataStoreSaveMessage',
        parameters: [
          {
            $ref: '#/components/schemas/IMessage',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreSaveVerifiableCredential': {
      post: {
        description: '',
        operationId: 'dataStoreSaveVerifiableCredential',
        parameters: [
          {
            $ref: '#/components/schemas/VerifiableCredential',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreSaveVerifiablePresentation': {
      post: {
        description: '',
        operationId: 'dataStoreSaveVerifiablePresentation',
        parameters: [
          {
            $ref: '#/components/schemas/VerifiablePresentation',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerCreateKey': {
      post: {
        description: '',
        operationId: 'keyManagerCreateKey',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerCreateKeyArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IKey',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerDecryptJWE': {
      post: {
        description: '',
        operationId: 'keyManagerDecryptJWE',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerDecryptJWEArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerDeleteKey': {
      post: {
        description: '',
        operationId: 'keyManagerDeleteKey',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerDeleteKeyArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerEncryptJWE': {
      post: {
        description: '',
        operationId: 'keyManagerEncryptJWE',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerEncryptJWEArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerGetKey': {
      post: {
        description: '',
        operationId: 'keyManagerGetKey',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerGetKeyArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IKey',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerImportKey': {
      post: {
        description: '',
        operationId: 'keyManagerImportKey',
        parameters: [
          {
            $ref: '#/components/schemas/IKey',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerSignEthTX': {
      post: {
        description: '',
        operationId: 'keyManagerSignEthTX',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerSignEthTXArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/keyManagerSignJWT': {
      post: {
        description: '',
        operationId: 'keyManagerSignJWT',
        parameters: [
          {
            $ref: '#/components/schemas/IKeyManagerSignJWTArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EcdsaSignature | string',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerAddKey': {
      post: {
        description: '',
        operationId: 'identityManagerAddKey',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerAddKeyArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {},
              },
            },
          },
        },
      },
    },
    '/identityManagerAddService': {
      post: {
        description: '',
        operationId: 'identityManagerAddService',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerAddServiceArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {},
              },
            },
          },
        },
      },
    },
    '/identityManagerCreateIdentity': {
      post: {
        description: '',
        operationId: 'identityManagerCreateIdentity',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerCreateIdentityArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IIdentity',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerDeleteIdentity': {
      post: {
        description: '',
        operationId: 'identityManagerDeleteIdentity',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerDeleteIdentityArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerGetIdentities': {
      post: {
        description: '',
        operationId: 'identityManagerGetIdentities',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/IIdentity',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerGetIdentity': {
      post: {
        description: '',
        operationId: 'identityManagerGetIdentity',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerGetIdentityArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IIdentity',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerGetOrCreateIdentity': {
      post: {
        description: '',
        operationId: 'identityManagerGetOrCreateIdentity',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerGetOrCreateIdentityArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IIdentity',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerGetProviders': {
      post: {
        description: '',
        operationId: 'identityManagerGetProviders',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerImportIdentity': {
      post: {
        description: '',
        operationId: 'identityManagerImportIdentity',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentity',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IIdentity',
                },
              },
            },
          },
        },
      },
    },
    '/identityManagerRemoveKey': {
      post: {
        description: '',
        operationId: 'identityManagerRemoveKey',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerRemoveKeyArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {},
              },
            },
          },
        },
      },
    },
    '/identityManagerRemoveService': {
      post: {
        description: '',
        operationId: 'identityManagerRemoveService',
        parameters: [
          {
            $ref: '#/components/schemas/IIdentityManagerRemoveServiceArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {},
              },
            },
          },
        },
      },
    },
    '/handleMessage': {
      post: {
        description: '',
        operationId: 'handleMessage',
        parameters: [
          {
            $ref: '#/components/schemas/IHandleMessageArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Message',
                },
              },
            },
          },
        },
      },
    },
    '/createSelectiveDisclosureRequest': {
      post: {
        description: '',
        operationId: 'createSelectiveDisclosureRequest',
        parameters: [
          {
            $ref: '#/components/schemas/ICreateSelectiveDisclosureRequestArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/getVerifiableCredentialsForSdr': {
      post: {
        description: '',
        operationId: 'getVerifiableCredentialsForSdr',
        parameters: [
          {
            $ref: '#/components/schemas/IGetVerifiableCredentialsForSdrArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ICredentialsForSdr',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/validatePresentationAgainstSdr': {
      post: {
        description: '',
        operationId: 'validatePresentationAgainstSdr',
        parameters: [
          {
            $ref: '#/components/schemas/IValidatePresentationAgainstSdrArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IPresentationValidationResult',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetIdentities': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetIdentities',
        parameters: [
          {
            $ref: '#/components/schemas/FindIdentitiesArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/IIdentity',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetIdentitiesCount': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetIdentitiesCount',
        parameters: [
          {
            $ref: '#/components/schemas/FindIdentitiesArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetMessages': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetMessages',
        parameters: [
          {
            $ref: '#/components/schemas/FindMessagesArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/IMessage',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetMessagesCount': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetMessagesCount',
        parameters: [
          {
            $ref: '#/components/schemas/FindMessagesArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiableCredentials': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiableCredentials',
        parameters: [
          {
            $ref: '#/components/schemas/FindCredentialsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/VerifiableCredential',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiableCredentialsByClaims': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiableCredentialsByClaims',
        parameters: [
          {
            $ref: '#/components/schemas/FindClaimsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/VerifiableCredential',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiableCredentialsByClaimsCount': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiableCredentialsByClaimsCount',
        parameters: [
          {
            $ref: '#/components/schemas/FindClaimsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiableCredentialsCount': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiableCredentialsCount',
        parameters: [
          {
            $ref: '#/components/schemas/FindCredentialsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiablePresentations': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiablePresentations',
        parameters: [
          {
            $ref: '#/components/schemas/FindPresentationsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/VerifiablePresentation',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dataStoreORMGetVerifiablePresentationsCount': {
      post: {
        description: '',
        operationId: 'dataStoreORMGetVerifiablePresentationsCount',
        parameters: [
          {
            $ref: '#/components/schemas/FindPresentationsArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    '/createVerifiableCredential': {
      post: {
        description: '',
        operationId: 'createVerifiableCredential',
        parameters: [
          {
            $ref: '#/components/schemas/ICreateVerifiableCredentialArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VerifiableCredential',
                },
              },
            },
          },
        },
      },
    },
    '/createVerifiablePresentation': {
      post: {
        description: '',
        operationId: 'createVerifiablePresentation',
        parameters: [
          {
            $ref: '#/components/schemas/ICreateVerifiablePresentationArgs',
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VerifiablePresentation',
                },
              },
            },
          },
        },
      },
    },
  },
}
