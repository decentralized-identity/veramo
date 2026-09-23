export const schema = {
  "IDIDComm": {
    "components": {
      "schemas": {
        "IPackedDIDCommMessage": {
          "description": "The result of packing a DIDComm v2 message. The message is always serialized as string.",
          "properties": {
            "message": {
              "type": "string"
            }
          },
          "required": [
            "message"
          ],
          "type": "object"
        },
        "DIDCommMessageMediaType": {
          "description": "Represents different DIDComm v2 message encapsulation.",
          "enum": [
            "application/didcomm-plain+json",
            "application/didcomm-signed+json",
            "application/didcomm-encrypted+json"
          ],
          "type": "string"
        },
        "DIDCommMessagePacking": {
          "description": "The possible types of message packing.\n\n`authcrypt`, `anoncrypt`, `anoncrypt+authcrypt`, and `anoncrypt+jws` will produce `DIDCommMessageMediaType.ENCRYPTED` messages.\n\n`jws` will produce `DIDCommMessageMediaType.SIGNED` messages.\n\n`none` will produce `DIDCommMessageMediaType.PLAIN` messages.",
          "enum": [
            "authcrypt",
            "anoncrypt",
            "jws",
            "none",
            "anoncrypt+authcrypt",
            "anoncrypt+jws"
          ],
          "type": "string"
        },
        "IDIDCommMessage": {
          "description": "The DIDComm message structure. See https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure",
          "properties": {
            "attachments": {
              "items": {
                "$ref": "#/components/schemas/IDIDCommMessageAttachment"
              },
              "type": "array"
            },
            "body": {},
            "created_time": {
              "type": [
                "number",
                "string"
              ]
            },
            "expires_time": {
              "type": [
                "number",
                "string"
              ]
            },
            "from": {
              "type": "string"
            },
            "from_prior": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "next": {
              "type": "string"
            },
            "pthid": {
              "type": "string"
            },
            "return_route": {
              "type": "string"
            },
            "thid": {
              "type": "string"
            },
            "to": {
              "items": {
                "type": "string"
              },
              "type": "array"
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
        "IDIDCommMessageAttachment": {
          "description": "The DIDComm message structure for attachments. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IDIDCommMessageAttachmentData"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IDIDCommMessageAttachmentData": {
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "base64": {
              "type": "string"
            },
            "hash": {
              "type": "string"
            },
            "json": {},
            "jws": {},
            "links": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IDIDCommOptions": {
          "description": "Extra options when packing a DIDComm message.",
          "properties": {
            "alg": {
              "description": "Optional key wrapping algorithm to use. Defaults to 'ECDH-ES+A256KW'",
              "enum": [
                "ECDH-ES+A256KW",
                "ECDH-1PU+A256KW",
                "ECDH-ES+XC20PKW",
                "ECDH-1PU+XC20PKW"
              ],
              "type": "string"
            },
            "bcc": {
              "description": "Add extra recipients for the packed message.",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "enc": {
              "description": "Optional content encryption algorithm to use. Defaults to 'A256GCM'",
              "enum": [
                "XC20P",
                "A256GCM",
                "A256CBC-HS512"
              ],
              "type": "string"
            },
            "recipientKids": {
              "description": "Restrict to a set of kids for recipient",
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IPackDIDCommMessageArgs": {
          "description": "The input to the  {@link  IDIDComm.packDIDCommMessage  }  method. When `packing` is `authcrypt` or `jws`, a `keyRef` MUST be provided.",
          "properties": {
            "keyRef": {
              "type": "string"
            },
            "message": {
              "$ref": "#/components/schemas/IDIDCommMessage"
            },
            "options": {
              "$ref": "#/components/schemas/IDIDCommOptions"
            },
            "packing": {
              "$ref": "#/components/schemas/DIDCommMessagePacking"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "message",
            "packing"
          ],
          "type": "object"
        },
        "ISendDIDCommMessageArgs": {
          "description": "The input to the  {@link  IDIDComm.sendDIDCommMessage  }  method. The provided `messageId` will be used in the emitted event to allow event/message correlation.",
          "properties": {
            "messageId": {
              "type": "string"
            },
            "packedMessage": {
              "$ref": "#/components/schemas/IPackedDIDCommMessage"
            },
            "recipientDidUrl": {
              "type": "string"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            },
            "returnTransportId": {
              "type": "string"
            }
          },
          "required": [
            "packedMessage",
            "messageId",
            "recipientDidUrl"
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
        "IMessage": {
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations.",
          "properties": {
            "attachments": {
              "description": "Optional. Array of generic attachments",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "type": "array"
            },
            "createdAt": {
              "description": "Optional. Creation date (ISO 8601)",
              "type": "string"
            },
            "credentials": {
              "description": "Optional. Array of attached verifiable credentials",
              "items": {
                "$ref": "#/components/schemas/VerifiableCredential"
              },
              "type": "array"
            },
            "data": {
              "anyOf": [
                {
                  "type": "object"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Parsed data"
            },
            "expiresAt": {
              "description": "Optional. Expiration date (ISO 8601)",
              "type": "string"
            },
            "from": {
              "description": "Optional. Sender DID",
              "type": "string"
            },
            "id": {
              "description": "Unique message ID",
              "type": "string"
            },
            "metaData": {
              "anyOf": [
                {
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  },
                  "type": "array"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Array of message metadata"
            },
            "presentations": {
              "description": "Optional. Array of attached verifiable presentations",
              "items": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              },
              "type": "array"
            },
            "raw": {
              "description": "Optional. Original message raw data",
              "type": "string"
            },
            "replyTo": {
              "description": "Optional. List of DIDs to reply to",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "replyUrl": {
              "description": "Optional. URL to post a reply message to",
              "type": "string"
            },
            "returnRoute": {
              "description": "Optional. Signal how to reuse transport for return messages",
              "type": "string"
            },
            "threadId": {
              "description": "Optional. Thread ID",
              "type": "string"
            },
            "to": {
              "description": "Optional. Recipient DID",
              "type": "string"
            },
            "type": {
              "description": "Message type",
              "type": "string"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "type": "object"
        },
        "IMessageAttachment": {
          "description": "Message attachment",
          "properties": {
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IMessageAttachmentData": {
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments",
          "properties": {
            "base64": {
              "type": "string"
            },
            "hash": {
              "type": "string"
            },
            "json": {},
            "jws": {},
            "links": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "type": "object"
        },
        "IMetaData": {
          "description": "Message meta data",
          "properties": {
            "type": {
              "description": "Type",
              "type": "string"
            },
            "value": {
              "description": "Optional. Value",
              "type": "string"
            }
          },
          "required": [
            "type"
          ],
          "type": "object"
        },
        "ISendDIDCommMessageResponse": {
          "description": "The response from the  {@link  IDIDComm.sendDIDCommMessage  }  method.",
          "properties": {
            "returnMessage": {
              "$ref": "#/components/schemas/IMessage"
            },
            "transportId": {
              "type": "string"
            }
          },
          "required": [
            "transportId"
          ],
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
        "ISendMessageDIDCommAlpha1Args": {
          "deprecated": "Please use {@link IDIDComm.sendDIDCommMessage} instead. This will be removed in Veramo 4.0.\nInput arguments for {@link IDIDComm.sendMessageDIDCommAlpha1}",
          "properties": {
            "data": {
              "properties": {
                "body": {
                  "anyOf": [
                    {
                      "type": "object"
                    },
                    {
                      "type": "string"
                    }
                  ]
                },
                "from": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                },
                "to": {
                  "type": "string"
                },
                "type": {
                  "type": "string"
                }
              },
              "required": [
                "from",
                "to",
                "type",
                "body"
              ],
              "type": "object"
            },
            "headers": {
              "additionalProperties": {
                "type": "string"
              },
              "type": "object"
            },
            "save": {
              "type": "boolean"
            },
            "url": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ],
          "type": "object"
        },
        "IUnpackDIDCommMessageArgs": {
          "description": "The input to the  {@link  IDIDComm.unpackDIDCommMessage  }  method.",
          "properties": {
            "message": {
              "type": "string"
            },
            "resolutionOptions": {
              "description": "Options to be passed to the DID resolver.",
              "properties": {
                "accept": {
                  "type": "string"
                },
                "publicKeyFormat": {
                  "type": "string"
                }
              },
              "type": "object"
            }
          },
          "required": [
            "message"
          ],
          "type": "object"
        },
        "IDIDCommMessageMetaData": {
          "description": "Metadata resulting from unpacking a DIDComm v2 message.",
          "properties": {
            "packing": {
              "$ref": "#/components/schemas/DIDCommMessagePacking"
            }
          },
          "required": [
            "packing"
          ],
          "type": "object"
        },
        "IUnpackedDIDCommMessage": {
          "description": "The result of unpacking a DIDComm v2 message.",
          "properties": {
            "message": {
              "$ref": "#/components/schemas/IDIDCommMessage"
            },
            "metaData": {
              "$ref": "#/components/schemas/IDIDCommMessageMetaData"
            }
          },
          "required": [
            "metaData",
            "message"
          ],
          "type": "object"
        }
      },
      "methods": {
        "getDIDCommMessageMediaType": {
          "description": "Partially decodes a possible DIDComm message string to determine the ",
          "arguments": {
            "$ref": "#/components/schemas/IPackedDIDCommMessage"
          },
          "returnType": {
            "$ref": "#/components/schemas/DIDCommMessageMediaType"
          }
        },
        "packDIDCommMessage": {
          "description": "Packs a ",
          "arguments": {
            "$ref": "#/components/schemas/IPackDIDCommMessageArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IPackedDIDCommMessage"
          }
        },
        "sendDIDCommMessage": {
          "description": "Sends the given message to the recipient. If a return-transport is provided it will be checked whether the parent thread allows reusing the route. You cannot reuse the transport if the message was forwarded from a DIDComm mediator.",
          "arguments": {
            "$ref": "#/components/schemas/ISendDIDCommMessageArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/ISendDIDCommMessageResponse"
          }
        },
        "sendMessageDIDCommAlpha1": {
          "description": "",
          "arguments": {
            "$ref": "#/components/schemas/ISendMessageDIDCommAlpha1Args"
          },
          "returnType": {
            "$ref": "#/components/schemas/IMessage"
          }
        },
        "unpackDIDCommMessage": {
          "description": "Unpacks a possible DIDComm message and returns the ",
          "arguments": {
            "$ref": "#/components/schemas/IUnpackDIDCommMessageArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IUnpackedDIDCommMessage"
          }
        }
      }
    }
  }
}