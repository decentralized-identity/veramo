export const schema = {
  "IDIDComm": {
    "components": {
      "schemas": {
        "IPackedDIDCommMessage": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string"
            }
          },
          "required": [
            "message"
          ],
          "description": "The result of packing a DIDComm v2 message. The message is always serialized as string."
        },
        "DIDCommMessageMediaType": {
          "type": "string",
          "enum": [
            "application/didcomm-plain+json",
            "application/didcomm-signed+json",
            "application/didcomm-encrypted+json"
          ],
          "description": "Represents different DIDComm v2 message encapsulation."
        },
        "IPackDIDCommMessageArgs": {
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
            "message": {
              "$ref": "#/components/schemas/IDIDCommMessage"
            },
            "packing": {
              "$ref": "#/components/schemas/DIDCommMessagePacking"
            },
            "keyRef": {
              "type": "string"
            },
            "options": {
              "$ref": "#/components/schemas/IDIDCommOptions"
            }
          },
          "required": [
            "message",
            "packing"
          ],
          "description": "The input to the  {@link  IDIDComm.packDIDCommMessage }  method. When `packing` is `authcrypt` or `jws`, a `keyRef` MUST be provided."
        },
        "IDIDCommMessage": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "from": {
              "type": "string"
            },
            "to": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "thid": {
              "type": "string"
            },
            "pthid": {
              "type": "string"
            },
            "expires_time": {
              "type": "string"
            },
            "created_time": {
              "type": "string"
            },
            "next": {
              "type": "string"
            },
            "from_prior": {
              "type": "string"
            },
            "body": {},
            "attachments": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IDIDCommMessageAttachment"
              }
            },
            "return_route": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "description": "The DIDComm message structure. See https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure"
        },
        "IDIDCommMessageAttachment": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IDIDCommMessageAttachmentData"
            }
          },
          "required": [
            "data"
          ],
          "description": "The DIDComm message structure for attachments. See https://identity.foundation/didcomm-messaging/spec/#attachments"
        },
        "IDIDCommMessageAttachmentData": {
          "type": "object",
          "properties": {
            "jws": {},
            "hash": {
              "type": "string"
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "base64": {
              "type": "string"
            },
            "json": {}
          },
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments"
        },
        "DIDCommMessagePacking": {
          "type": "string",
          "enum": [
            "authcrypt",
            "anoncrypt",
            "jws",
            "none",
            "anoncrypt+authcrypt",
            "anoncrypt+jws"
          ],
          "description": "The possible types of message packing.\n\n`authcrypt`, `anoncrypt`, `anoncrypt+authcrypt`, and `anoncrypt+jws` will produce `DIDCommMessageMediaType.ENCRYPTED` messages.\n\n`jws` will produce `DIDCommMessageMediaType.SIGNED` messages.\n\n`none` will produce `DIDCommMessageMediaType.PLAIN` messages."
        },
        "IDIDCommOptions": {
          "type": "object",
          "properties": {
            "bcc": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Add extra recipients for the packed message."
            },
            "recipientKids": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Restrict to a set of kids for recipient"
            },
            "enc": {
              "type": "string",
              "enum": [
                "XC20P",
                "A256GCM",
                "A256CBC-HS512"
              ],
              "description": "Optional content encryption algorithm to use. Defaults to 'A256GCM'"
            },
            "alg": {
              "type": "string",
              "enum": [
                "ECDH-ES+A256KW",
                "ECDH-1PU+A256KW",
                "ECDH-ES+XC20PKW",
                "ECDH-1PU+XC20PKW"
              ],
              "description": "Optional key wrapping algorithm to use. Defaults to 'ECDH-ES+A256KW'"
            }
          },
          "description": "Extra options when packing a DIDComm message."
        },
        "ISendDIDCommMessageArgs": {
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
            "packedMessage": {
              "$ref": "#/components/schemas/IPackedDIDCommMessage"
            },
            "messageId": {
              "type": "string"
            },
            "returnTransportId": {
              "type": "string"
            },
            "recipientDidUrl": {
              "type": "string"
            }
          },
          "required": [
            "packedMessage",
            "messageId",
            "recipientDidUrl"
          ],
          "description": "The input to the  {@link  IDIDComm.sendDIDCommMessage }  method. The provided `messageId` will be used in the emitted event to allow event/message correlation."
        },
        "ISendDIDCommMessageResponse": {
          "type": "object",
          "properties": {
            "transportId": {
              "type": "string"
            },
            "returnMessage": {
              "$ref": "#/components/schemas/IMessage"
            }
          },
          "required": [
            "transportId"
          ],
          "description": "The response from the  {@link  IDIDComm.sendDIDCommMessage }  method."
        },
        "IMessage": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Unique message ID"
            },
            "type": {
              "type": "string",
              "description": "Message type"
            },
            "createdAt": {
              "type": "string",
              "description": "Optional. Creation date (ISO 8601)"
            },
            "expiresAt": {
              "type": "string",
              "description": "Optional. Expiration date (ISO 8601)"
            },
            "threadId": {
              "type": "string",
              "description": "Optional. Thread ID"
            },
            "raw": {
              "type": "string",
              "description": "Optional. Original message raw data"
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
            "replyTo": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Optional. List of DIDs to reply to"
            },
            "replyUrl": {
              "type": "string",
              "description": "Optional. URL to post a reply message to"
            },
            "from": {
              "type": "string",
              "description": "Optional. Sender DID"
            },
            "to": {
              "type": "string",
              "description": "Optional. Recipient DID"
            },
            "metaData": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/IMetaData"
                  }
                },
                {
                  "type": "null"
                }
              ],
              "description": "Optional. Array of message metadata"
            },
            "credentials": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerifiableCredential"
              },
              "description": "Optional. Array of attached verifiable credentials"
            },
            "presentations": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/VerifiablePresentation"
              },
              "description": "Optional. Array of attached verifiable presentations"
            },
            "attachments": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IMessageAttachment"
              },
              "description": "Optional. Array of generic attachments"
            },
            "returnRoute": {
              "type": "string",
              "description": "Optional. Signal how to reuse transport for return messages"
            }
          },
          "required": [
            "id",
            "type"
          ],
          "description": "Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations."
        },
        "IMetaData": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "description": "Type"
            },
            "value": {
              "type": "string",
              "description": "Optional. Value"
            }
          },
          "required": [
            "type"
          ],
          "description": "Message meta data"
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
        "IMessageAttachment": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "filename": {
              "type": "string"
            },
            "media_type": {
              "type": "string"
            },
            "format": {
              "type": "string"
            },
            "lastmod_time": {
              "type": "string"
            },
            "byte_count": {
              "type": "number"
            },
            "data": {
              "$ref": "#/components/schemas/IMessageAttachmentData"
            }
          },
          "required": [
            "data"
          ],
          "description": "Message attachment"
        },
        "IMessageAttachmentData": {
          "type": "object",
          "properties": {
            "jws": {},
            "hash": {
              "type": "string"
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "base64": {
              "type": "string"
            },
            "json": {}
          },
          "description": "The DIDComm message structure for data in an attachment. See https://identity.foundation/didcomm-messaging/spec/#attachments"
        },
        "ISendMessageDIDCommAlpha1Args": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "save": {
              "type": "boolean"
            },
            "data": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "from": {
                  "type": "string"
                },
                "to": {
                  "type": "string"
                },
                "type": {
                  "type": "string"
                },
                "body": {
                  "anyOf": [
                    {
                      "type": "object"
                    },
                    {
                      "type": "string"
                    }
                  ]
                }
              },
              "required": [
                "from",
                "to",
                "type",
                "body"
              ]
            },
            "headers": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            }
          },
          "required": [
            "data"
          ],
          "deprecated": "Please use {@link IDIDComm.sendDIDCommMessage } instead. This will be removed in Veramo 4.0.\nInput arguments for {@link IDIDComm.sendMessageDIDCommAlpha1 }"
        },
        "IUnpackDIDCommMessageArgs": {
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
            "message": {
              "type": "string"
            }
          },
          "required": [
            "message"
          ],
          "description": "The input to the  {@link  IDIDComm.unpackDIDCommMessage }  method."
        },
        "IUnpackedDIDCommMessage": {
          "type": "object",
          "properties": {
            "metaData": {
              "$ref": "#/components/schemas/IDIDCommMessageMetaData"
            },
            "message": {
              "$ref": "#/components/schemas/IDIDCommMessage"
            }
          },
          "required": [
            "metaData",
            "message"
          ],
          "description": "The result of unpacking a DIDComm v2 message."
        },
        "IDIDCommMessageMetaData": {
          "type": "object",
          "properties": {
            "packing": {
              "$ref": "#/components/schemas/DIDCommMessagePacking"
            }
          },
          "required": [
            "packing"
          ],
          "description": "Metadata resulting from unpacking a DIDComm v2 message."
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