import { OpenAPIV3 } from 'openapi-types'
export const openApiSchema: OpenAPIV3.Document = {
  "openapi": "3.0.0",
  "info": {
    "title": "DAF OpenAPI",
    "version": ""
  },
  "components": {
    "schemas": {}
  },
  "paths": {
    "/resolveDid": {
      "post": {
        "description": "Resolves DID and returns DID Document",
        "operationId": "resolveDid",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "didUrl": {
                    "type": "string",
                    "description": "DID URL"
                  }
                },
                "required": [
                  "didUrl"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IResolver.resolveDid | resolveDid}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Resolves DID and returns DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "@context": {
                      "type": "string",
                      "enum": [
                        "https://w3id.org/did/v1"
                      ]
                    },
                    "id": {
                      "type": "string"
                    },
                    "publicKey": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "type": {
                            "type": "string"
                          },
                          "controller": {
                            "type": "string"
                          },
                          "ethereumAddress": {
                            "type": "string"
                          },
                          "publicKeyBase64": {
                            "type": "string"
                          },
                          "publicKeyBase58": {
                            "type": "string"
                          },
                          "publicKeyHex": {
                            "type": "string"
                          },
                          "publicKeyPem": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "controller"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "authentication": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string"
                          },
                          "publicKey": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "type",
                          "publicKey"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "uportProfile": {
                      "type": "object"
                    },
                    "service": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "type": {
                            "type": "string"
                          },
                          "serviceEndpoint": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "created": {
                      "type": "string"
                    },
                    "updated": {
                      "type": "string"
                    },
                    "proof": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        },
                        "created": {
                          "type": "string"
                        },
                        "creator": {
                          "type": "string"
                        },
                        "nonce": {
                          "type": "string"
                        },
                        "signatureValue": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "type",
                        "created",
                        "creator",
                        "nonce",
                        "signatureValue"
                      ],
                      "additionalProperties": false
                    },
                    "keyAgreement": {
                      "type": "array",
                      "items": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string"
                              },
                              "type": {
                                "type": "string"
                              },
                              "controller": {
                                "type": "string"
                              },
                              "ethereumAddress": {
                                "type": "string"
                              },
                              "publicKeyBase64": {
                                "type": "string"
                              },
                              "publicKeyBase58": {
                                "type": "string"
                              },
                              "publicKeyHex": {
                                "type": "string"
                              },
                              "publicKeyPem": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "id",
                              "type",
                              "controller"
                            ],
                            "additionalProperties": false
                          }
                        ]
                      }
                    }
                  },
                  "required": [
                    "@context",
                    "id",
                    "publicKey"
                  ],
                  "additionalProperties": false
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerAddKey": {
      "post": {
        "description": "Adds a key to a DID Document",
        "operationId": "identityManagerAddKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  },
                  "key": {
                    "type": "object",
                    "properties": {
                      "kid": {
                        "type": "string",
                        "description": "Key ID"
                      },
                      "kms": {
                        "type": "string",
                        "description": "Key Management System"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "Ed25519",
                          "Secp256k1"
                        ],
                        "description": "Cryptographic key type"
                      },
                      "publicKeyHex": {
                        "type": "string",
                        "description": "Public key"
                      },
                      "privateKeyHex": {
                        "type": "string",
                        "description": "Optional. Private key"
                      },
                      "meta": {
                        "type": "object",
                        "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                      }
                    },
                    "required": [
                      "kid",
                      "kms",
                      "type",
                      "publicKeyHex"
                    ],
                    "additionalProperties": false,
                    "description": "Cryptographic key"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "required": [
                  "did",
                  "key"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerAddKey | identityManagerAddKey}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Adds a key to a DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerAddService": {
      "post": {
        "description": "Adds a service to a DID Document",
        "operationId": "identityManagerAddService",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  },
                  "service": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "ID"
                      },
                      "type": {
                        "type": "string",
                        "description": "Service type"
                      },
                      "serviceEndpoint": {
                        "type": "string",
                        "description": "Endpoint URL"
                      },
                      "description": {
                        "type": "string",
                        "description": "Optional. Description"
                      }
                    },
                    "required": [
                      "id",
                      "type",
                      "serviceEndpoint"
                    ],
                    "additionalProperties": false,
                    "description": "Identity service"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "required": [
                  "did",
                  "service"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerAddService | identityManagerAddService}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Adds a service to a DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerCreateIdentity": {
      "post": {
        "description": "Creates and returns a new identity",
        "operationId": "identityManagerCreateIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "alias": {
                    "type": "string",
                    "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                  },
                  "provider": {
                    "type": "string",
                    "description": "Optional. Identity provider"
                  },
                  "kms": {
                    "type": "string",
                    "description": "Optional. Key Management System"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerCreateIdentity | identityManagerCreateIdentity}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates and returns a new identity",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "did": {
                      "type": "string",
                      "description": "Decentralized identifier"
                    },
                    "alias": {
                      "type": "string",
                      "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Identity provider name"
                    },
                    "controllerKeyId": {
                      "type": "string",
                      "description": "Controller key id"
                    },
                    "keys": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "kid": {
                            "type": "string",
                            "description": "Key ID"
                          },
                          "kms": {
                            "type": "string",
                            "description": "Key Management System"
                          },
                          "type": {
                            "type": "string",
                            "enum": [
                              "Ed25519",
                              "Secp256k1"
                            ],
                            "description": "Cryptographic key type"
                          },
                          "publicKeyHex": {
                            "type": "string",
                            "description": "Public key"
                          },
                          "privateKeyHex": {
                            "type": "string",
                            "description": "Optional. Private key"
                          },
                          "meta": {
                            "type": "object",
                            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                          }
                        },
                        "required": [
                          "kid",
                          "kms",
                          "type",
                          "publicKeyHex"
                        ],
                        "additionalProperties": false,
                        "description": "Cryptographic key"
                      },
                      "description": "Array of managed keys"
                    },
                    "services": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "ID"
                          },
                          "type": {
                            "type": "string",
                            "description": "Service type"
                          },
                          "serviceEndpoint": {
                            "type": "string",
                            "description": "Endpoint URL"
                          },
                          "description": {
                            "type": "string",
                            "description": "Optional. Description"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false,
                        "description": "Identity service"
                      },
                      "description": "Array of services"
                    }
                  },
                  "required": [
                    "did",
                    "provider",
                    "controllerKeyId",
                    "keys",
                    "services"
                  ],
                  "additionalProperties": false,
                  "description": "Identity interface"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerDeleteIdentity": {
      "post": {
        "description": "Deletes identity",
        "operationId": "identityManagerDeleteIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  }
                },
                "required": [
                  "did"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerDeleteIdentity | identityManagerDeleteIdentity}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Deletes identity",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentities": {
      "post": {
        "description": "Returns a list of managed identities",
        "operationId": "identityManagerGetIdentities",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "alias": {
                    "type": "string",
                    "description": "Optional. Alias"
                  },
                  "provider": {
                    "type": "string",
                    "description": "Optional. Provider"
                  }
                },
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentities | identityManagerGetIdentities}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a list of managed identities",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "did": {
                        "type": "string",
                        "description": "Decentralized identifier"
                      },
                      "alias": {
                        "type": "string",
                        "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                      },
                      "provider": {
                        "type": "string",
                        "description": "Identity provider name"
                      },
                      "controllerKeyId": {
                        "type": "string",
                        "description": "Controller key id"
                      },
                      "keys": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "kid": {
                              "type": "string",
                              "description": "Key ID"
                            },
                            "kms": {
                              "type": "string",
                              "description": "Key Management System"
                            },
                            "type": {
                              "type": "string",
                              "enum": [
                                "Ed25519",
                                "Secp256k1"
                              ],
                              "description": "Cryptographic key type"
                            },
                            "publicKeyHex": {
                              "type": "string",
                              "description": "Public key"
                            },
                            "privateKeyHex": {
                              "type": "string",
                              "description": "Optional. Private key"
                            },
                            "meta": {
                              "type": "object",
                              "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                            }
                          },
                          "required": [
                            "kid",
                            "kms",
                            "type",
                            "publicKeyHex"
                          ],
                          "additionalProperties": false,
                          "description": "Cryptographic key"
                        },
                        "description": "Array of managed keys"
                      },
                      "services": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "description": "ID"
                            },
                            "type": {
                              "type": "string",
                              "description": "Service type"
                            },
                            "serviceEndpoint": {
                              "type": "string",
                              "description": "Endpoint URL"
                            },
                            "description": {
                              "type": "string",
                              "description": "Optional. Description"
                            }
                          },
                          "required": [
                            "id",
                            "type",
                            "serviceEndpoint"
                          ],
                          "additionalProperties": false,
                          "description": "Identity service"
                        },
                        "description": "Array of services"
                      }
                    },
                    "required": [
                      "did",
                      "provider",
                      "controllerKeyId",
                      "keys",
                      "services"
                    ],
                    "additionalProperties": false,
                    "description": "Identity interface"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentity": {
      "post": {
        "description": "Returns a specific identity",
        "operationId": "identityManagerGetIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  }
                },
                "required": [
                  "did"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentity | identityManagerGetIdentity}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a specific identity",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "did": {
                      "type": "string",
                      "description": "Decentralized identifier"
                    },
                    "alias": {
                      "type": "string",
                      "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Identity provider name"
                    },
                    "controllerKeyId": {
                      "type": "string",
                      "description": "Controller key id"
                    },
                    "keys": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "kid": {
                            "type": "string",
                            "description": "Key ID"
                          },
                          "kms": {
                            "type": "string",
                            "description": "Key Management System"
                          },
                          "type": {
                            "type": "string",
                            "enum": [
                              "Ed25519",
                              "Secp256k1"
                            ],
                            "description": "Cryptographic key type"
                          },
                          "publicKeyHex": {
                            "type": "string",
                            "description": "Public key"
                          },
                          "privateKeyHex": {
                            "type": "string",
                            "description": "Optional. Private key"
                          },
                          "meta": {
                            "type": "object",
                            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                          }
                        },
                        "required": [
                          "kid",
                          "kms",
                          "type",
                          "publicKeyHex"
                        ],
                        "additionalProperties": false,
                        "description": "Cryptographic key"
                      },
                      "description": "Array of managed keys"
                    },
                    "services": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "ID"
                          },
                          "type": {
                            "type": "string",
                            "description": "Service type"
                          },
                          "serviceEndpoint": {
                            "type": "string",
                            "description": "Endpoint URL"
                          },
                          "description": {
                            "type": "string",
                            "description": "Optional. Description"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false,
                        "description": "Identity service"
                      },
                      "description": "Array of services"
                    }
                  },
                  "required": [
                    "did",
                    "provider",
                    "controllerKeyId",
                    "keys",
                    "services"
                  ],
                  "additionalProperties": false,
                  "description": "Identity interface"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetIdentityByAlias": {
      "post": {
        "description": "Returns a specific identity by alias",
        "operationId": "identityManagerGetIdentityByAlias",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "alias": {
                    "type": "string",
                    "description": "Alias"
                  },
                  "provider": {
                    "type": "string",
                    "description": "Optional provider"
                  }
                },
                "required": [
                  "alias"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerGetIdentityByAlias | identityManagerGetIdentityByAlias}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a specific identity by alias",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "did": {
                      "type": "string",
                      "description": "Decentralized identifier"
                    },
                    "alias": {
                      "type": "string",
                      "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Identity provider name"
                    },
                    "controllerKeyId": {
                      "type": "string",
                      "description": "Controller key id"
                    },
                    "keys": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "kid": {
                            "type": "string",
                            "description": "Key ID"
                          },
                          "kms": {
                            "type": "string",
                            "description": "Key Management System"
                          },
                          "type": {
                            "type": "string",
                            "enum": [
                              "Ed25519",
                              "Secp256k1"
                            ],
                            "description": "Cryptographic key type"
                          },
                          "publicKeyHex": {
                            "type": "string",
                            "description": "Public key"
                          },
                          "privateKeyHex": {
                            "type": "string",
                            "description": "Optional. Private key"
                          },
                          "meta": {
                            "type": "object",
                            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                          }
                        },
                        "required": [
                          "kid",
                          "kms",
                          "type",
                          "publicKeyHex"
                        ],
                        "additionalProperties": false,
                        "description": "Cryptographic key"
                      },
                      "description": "Array of managed keys"
                    },
                    "services": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "ID"
                          },
                          "type": {
                            "type": "string",
                            "description": "Service type"
                          },
                          "serviceEndpoint": {
                            "type": "string",
                            "description": "Endpoint URL"
                          },
                          "description": {
                            "type": "string",
                            "description": "Optional. Description"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false,
                        "description": "Identity service"
                      },
                      "description": "Array of services"
                    }
                  },
                  "required": [
                    "did",
                    "provider",
                    "controllerKeyId",
                    "keys",
                    "services"
                  ],
                  "additionalProperties": false,
                  "description": "Identity interface"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetOrCreateIdentity": {
      "post": {
        "description": "Returns an existing identity or creates a new one for a specific alias",
        "operationId": "identityManagerGetOrCreateIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "alias": {
                    "type": "string",
                    "description": "Identity alias. Can be used to reference an object in an external system"
                  },
                  "provider": {
                    "type": "string",
                    "description": "Optional. Identity provider"
                  },
                  "kms": {
                    "type": "string",
                    "description": "Optional. Key Management System"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "required": [
                  "alias"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerGetOrCreateIdentity | identityManagerGetOrCreateIdentity}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns an existing identity or creates a new one for a specific alias",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "did": {
                      "type": "string",
                      "description": "Decentralized identifier"
                    },
                    "alias": {
                      "type": "string",
                      "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Identity provider name"
                    },
                    "controllerKeyId": {
                      "type": "string",
                      "description": "Controller key id"
                    },
                    "keys": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "kid": {
                            "type": "string",
                            "description": "Key ID"
                          },
                          "kms": {
                            "type": "string",
                            "description": "Key Management System"
                          },
                          "type": {
                            "type": "string",
                            "enum": [
                              "Ed25519",
                              "Secp256k1"
                            ],
                            "description": "Cryptographic key type"
                          },
                          "publicKeyHex": {
                            "type": "string",
                            "description": "Public key"
                          },
                          "privateKeyHex": {
                            "type": "string",
                            "description": "Optional. Private key"
                          },
                          "meta": {
                            "type": "object",
                            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                          }
                        },
                        "required": [
                          "kid",
                          "kms",
                          "type",
                          "publicKeyHex"
                        ],
                        "additionalProperties": false,
                        "description": "Cryptographic key"
                      },
                      "description": "Array of managed keys"
                    },
                    "services": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "ID"
                          },
                          "type": {
                            "type": "string",
                            "description": "Service type"
                          },
                          "serviceEndpoint": {
                            "type": "string",
                            "description": "Endpoint URL"
                          },
                          "description": {
                            "type": "string",
                            "description": "Optional. Description"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false,
                        "description": "Identity service"
                      },
                      "description": "Array of services"
                    }
                  },
                  "required": [
                    "did",
                    "provider",
                    "controllerKeyId",
                    "keys",
                    "services"
                  ],
                  "additionalProperties": false,
                  "description": "Identity interface"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerGetProviders": {
      "post": {
        "description": "Returns a list of available identity providers",
        "operationId": "identityManagerGetProviders",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a list of available identity providers",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerImportIdentity": {
      "post": {
        "description": "Imports identity",
        "operationId": "identityManagerImportIdentity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "Decentralized identifier"
                  },
                  "alias": {
                    "type": "string",
                    "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                  },
                  "provider": {
                    "type": "string",
                    "description": "Identity provider name"
                  },
                  "controllerKeyId": {
                    "type": "string",
                    "description": "Controller key id"
                  },
                  "keys": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "kid": {
                          "type": "string",
                          "description": "Key ID"
                        },
                        "kms": {
                          "type": "string",
                          "description": "Key Management System"
                        },
                        "type": {
                          "type": "string",
                          "enum": [
                            "Ed25519",
                            "Secp256k1"
                          ],
                          "description": "Cryptographic key type"
                        },
                        "publicKeyHex": {
                          "type": "string",
                          "description": "Public key"
                        },
                        "privateKeyHex": {
                          "type": "string",
                          "description": "Optional. Private key"
                        },
                        "meta": {
                          "type": "object",
                          "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                        }
                      },
                      "required": [
                        "kid",
                        "kms",
                        "type",
                        "publicKeyHex"
                      ],
                      "additionalProperties": false,
                      "description": "Cryptographic key"
                    },
                    "description": "Array of managed keys"
                  },
                  "services": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "description": "ID"
                        },
                        "type": {
                          "type": "string",
                          "description": "Service type"
                        },
                        "serviceEndpoint": {
                          "type": "string",
                          "description": "Endpoint URL"
                        },
                        "description": {
                          "type": "string",
                          "description": "Optional. Description"
                        }
                      },
                      "required": [
                        "id",
                        "type",
                        "serviceEndpoint"
                      ],
                      "additionalProperties": false,
                      "description": "Identity service"
                    },
                    "description": "Array of services"
                  }
                },
                "required": [
                  "did",
                  "provider",
                  "controllerKeyId",
                  "keys",
                  "services"
                ],
                "additionalProperties": false,
                "description": "Identity interface"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Imports identity",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "did": {
                      "type": "string",
                      "description": "Decentralized identifier"
                    },
                    "alias": {
                      "type": "string",
                      "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Identity provider name"
                    },
                    "controllerKeyId": {
                      "type": "string",
                      "description": "Controller key id"
                    },
                    "keys": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "kid": {
                            "type": "string",
                            "description": "Key ID"
                          },
                          "kms": {
                            "type": "string",
                            "description": "Key Management System"
                          },
                          "type": {
                            "type": "string",
                            "enum": [
                              "Ed25519",
                              "Secp256k1"
                            ],
                            "description": "Cryptographic key type"
                          },
                          "publicKeyHex": {
                            "type": "string",
                            "description": "Public key"
                          },
                          "privateKeyHex": {
                            "type": "string",
                            "description": "Optional. Private key"
                          },
                          "meta": {
                            "type": "object",
                            "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                          }
                        },
                        "required": [
                          "kid",
                          "kms",
                          "type",
                          "publicKeyHex"
                        ],
                        "additionalProperties": false,
                        "description": "Cryptographic key"
                      },
                      "description": "Array of managed keys"
                    },
                    "services": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "ID"
                          },
                          "type": {
                            "type": "string",
                            "description": "Service type"
                          },
                          "serviceEndpoint": {
                            "type": "string",
                            "description": "Endpoint URL"
                          },
                          "description": {
                            "type": "string",
                            "description": "Optional. Description"
                          }
                        },
                        "required": [
                          "id",
                          "type",
                          "serviceEndpoint"
                        ],
                        "additionalProperties": false,
                        "description": "Identity service"
                      },
                      "description": "Array of services"
                    }
                  },
                  "required": [
                    "did",
                    "provider",
                    "controllerKeyId",
                    "keys",
                    "services"
                  ],
                  "additionalProperties": false,
                  "description": "Identity interface"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerRemoveKey": {
      "post": {
        "description": "Removes a key from a DID Document",
        "operationId": "identityManagerRemoveKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  },
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "required": [
                  "did",
                  "kid"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerRemoveKey | identityManagerRemoveKey}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Removes a key from a DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerRemoveService": {
      "post": {
        "description": "Removes a service from a DID Document",
        "operationId": "identityManagerRemoveService",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "DID"
                  },
                  "id": {
                    "type": "string",
                    "description": "Service ID"
                  },
                  "options": {
                    "type": "object",
                    "description": "Optional. Identity provider specific options"
                  }
                },
                "required": [
                  "did",
                  "id"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerRemoveService | identityManagerRemoveService}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Removes a service from a DID Document",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/identityManagerSetAlias": {
      "post": {
        "description": "Sets identity alias",
        "operationId": "identityManagerSetAlias",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "did": {
                    "type": "string",
                    "description": "Required. DID"
                  },
                  "alias": {
                    "type": "string",
                    "description": "Required. Identity alias"
                  }
                },
                "required": [
                  "did",
                  "alias"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IIdentityManager.identityManagerSetAlias | identityManagerSetAlias}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Sets identity alias",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/handleMessage": {
      "post": {
        "description": "Parses and optionally saves a message",
        "operationId": "handleMessage",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "raw": {
                    "type": "string",
                    "description": "Raw message data"
                  },
                  "metaData": {
                    "type": "array",
                    "items": {
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
                      "additionalProperties": false,
                      "description": "Message meta data"
                    },
                    "description": "Optional. Message meta data"
                  },
                  "save": {
                    "type": "boolean",
                    "description": "Optional. If set to `true`, the message will be saved using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}"
                  }
                },
                "required": [
                  "raw"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IMessageHandler.handleMessage | handleMessage}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Parses and optionally saves a message",
            "content": {
              "application/json": {
                "schema": {
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
                          "type": "string"
                        },
                        {
                          "type": "object"
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
                      "type": "array",
                      "items": {
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
                        "additionalProperties": false,
                        "description": "Message meta data"
                      },
                      "description": "Optional. Array of message metadata"
                    },
                    "credentials": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
                            }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable credentials"
                    },
                    "presentations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable presentations"
                    }
                  },
                  "required": [
                    "id",
                    "type"
                  ],
                  "additionalProperties": false,
                  "description": "DIDComm message"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreGetMessage": {
      "post": {
        "description": "Gets message from the data store",
        "operationId": "dataStoreGetMessage",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "description": "Required. Message ID"
                  }
                },
                "required": [
                  "id"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreGetMessage | dataStoreGetMessage}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Gets message from the data store",
            "content": {
              "application/json": {
                "schema": {
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
                          "type": "string"
                        },
                        {
                          "type": "object"
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
                      "type": "array",
                      "items": {
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
                        "additionalProperties": false,
                        "description": "Message meta data"
                      },
                      "description": "Optional. Array of message metadata"
                    },
                    "credentials": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
                            }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable credentials"
                    },
                    "presentations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable presentations"
                    }
                  },
                  "required": [
                    "id",
                    "type"
                  ],
                  "additionalProperties": false,
                  "description": "DIDComm message"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreGetVerifiableCredential": {
      "post": {
        "description": "Gets verifiable credential from the data store",
        "operationId": "dataStoreGetVerifiableCredential",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "hash": {
                    "type": "string",
                    "description": "Required. VerifiableCredential hash"
                  }
                },
                "required": [
                  "hash"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreGetVerifiableCredential | dataStoreGetVerifiableCredential}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Gets verifiable credential from the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "proof": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        }
                      }
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
                  "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreGetVerifiablePresentation": {
      "post": {
        "description": "Gets verifiable presentation from the data store",
        "operationId": "dataStoreGetVerifiablePresentation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "hash": {
                    "type": "string",
                    "description": "Required. VerifiablePresentation hash"
                  }
                },
                "required": [
                  "hash"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreGetVerifiablePresentation | dataStoreGetVerifiablePresentation}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Gets verifiable presentation from the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "proof": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        }
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
                  "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveMessage": {
      "post": {
        "description": "Saves message to the data store",
        "operationId": "dataStoreSaveMessage",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
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
                            "type": "string"
                          },
                          {
                            "type": "object"
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
                        "type": "array",
                        "items": {
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
                          "additionalProperties": false,
                          "description": "Message meta data"
                        },
                        "description": "Optional. Array of message metadata"
                      },
                      "credentials": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
                              }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                        },
                        "description": "Optional. Array of attached verifiable credentials"
                      },
                      "presentations": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                        },
                        "description": "Optional. Array of attached verifiable presentations"
                      }
                    },
                    "required": [
                      "id",
                      "type"
                    ],
                    "additionalProperties": false,
                    "description": "DIDComm message"
                  }
                },
                "required": [
                  "message"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves message to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveVerifiableCredential": {
      "post": {
        "description": "Saves verifiable credential to the data store",
        "operationId": "dataStoreSaveVerifiableCredential",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "verifiableCredential": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                      "proof": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string"
                          }
                        }
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
                    "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                  }
                },
                "required": [
                  "verifiableCredential"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves verifiable credential to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreSaveVerifiablePresentation": {
      "post": {
        "description": "Saves verifiable presentation to the data store",
        "operationId": "dataStoreSaveVerifiablePresentation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "verifiablePresentation": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                      "proof": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string"
                          }
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
                    "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                  }
                },
                "required": [
                  "verifiablePresentation"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saves verifiable presentation to the data store",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerCreateKey": {
      "post": {
        "description": "Creates and returns a new key",
        "operationId": "keyManagerCreateKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "Ed25519",
                      "Secp256k1"
                    ],
                    "description": "Cryptographic key type"
                  },
                  "kms": {
                    "type": "string",
                    "description": "Key Management System"
                  },
                  "meta": {
                    "type": "object",
                    "description": "Optional. Key meta data"
                  }
                },
                "required": [
                  "type",
                  "kms"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerCreateKey | keyManagerCreateKey}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates and returns a new key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "kid": {
                      "type": "string",
                      "description": "Key ID"
                    },
                    "kms": {
                      "type": "string",
                      "description": "Key Management System"
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "Ed25519",
                        "Secp256k1"
                      ],
                      "description": "Cryptographic key type"
                    },
                    "publicKeyHex": {
                      "type": "string",
                      "description": "Public key"
                    },
                    "privateKeyHex": {
                      "type": "string",
                      "description": "Optional. Private key"
                    },
                    "meta": {
                      "type": "object",
                      "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                    }
                  },
                  "required": [
                    "kid",
                    "kms",
                    "type",
                    "publicKeyHex"
                  ],
                  "additionalProperties": false,
                  "description": "Cryptographic key"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerDecryptJWE": {
      "post": {
        "description": "Decrypts data",
        "operationId": "keyManagerDecryptJWE",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  },
                  "data": {
                    "type": "string",
                    "description": "Encrypted data"
                  }
                },
                "required": [
                  "kid",
                  "data"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerDecryptJWE | keyManagerDecryptJWE}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Decrypts data",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerDeleteKey": {
      "post": {
        "description": "Deletes a key",
        "operationId": "keyManagerDeleteKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  }
                },
                "required": [
                  "kid"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerDeleteKey | keyManagerDeleteKey}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Deletes a key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerEncryptJWE": {
      "post": {
        "description": "Encrypts data",
        "operationId": "keyManagerEncryptJWE",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID to use for encryption"
                  },
                  "to": {
                    "type": "object",
                    "properties": {
                      "kid": {
                        "type": "string",
                        "description": "Key ID"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "Ed25519",
                          "Secp256k1"
                        ],
                        "description": "Cryptographic key type"
                      },
                      "publicKeyHex": {
                        "type": "string",
                        "description": "Public key"
                      },
                      "privateKeyHex": {
                        "type": "string",
                        "description": "Optional. Private key"
                      },
                      "meta": {
                        "type": "object",
                        "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                      }
                    },
                    "required": [
                      "kid",
                      "type",
                      "publicKeyHex"
                    ],
                    "additionalProperties": false,
                    "description": "Recipient key object"
                  },
                  "data": {
                    "type": "string",
                    "description": "Data to encrypt"
                  }
                },
                "required": [
                  "kid",
                  "to",
                  "data"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Encrypts data",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerGetKey": {
      "post": {
        "description": "Returns an existing key",
        "operationId": "keyManagerGetKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  }
                },
                "required": [
                  "kid"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerGetKey | keyManagerGetKey}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns an existing key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "kid": {
                      "type": "string",
                      "description": "Key ID"
                    },
                    "kms": {
                      "type": "string",
                      "description": "Key Management System"
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "Ed25519",
                        "Secp256k1"
                      ],
                      "description": "Cryptographic key type"
                    },
                    "publicKeyHex": {
                      "type": "string",
                      "description": "Public key"
                    },
                    "privateKeyHex": {
                      "type": "string",
                      "description": "Optional. Private key"
                    },
                    "meta": {
                      "type": "object",
                      "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                    }
                  },
                  "required": [
                    "kid",
                    "kms",
                    "type",
                    "publicKeyHex"
                  ],
                  "additionalProperties": false,
                  "description": "Cryptographic key"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerGetKeyManagementSystems": {
      "post": {
        "description": "Lists available key management systems",
        "operationId": "keyManagerGetKeyManagementSystems",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Lists available key management systems",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerImportKey": {
      "post": {
        "description": "Imports a created key",
        "operationId": "keyManagerImportKey",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  },
                  "kms": {
                    "type": "string",
                    "description": "Key Management System"
                  },
                  "type": {
                    "type": "string",
                    "enum": [
                      "Ed25519",
                      "Secp256k1"
                    ],
                    "description": "Cryptographic key type"
                  },
                  "publicKeyHex": {
                    "type": "string",
                    "description": "Public key"
                  },
                  "privateKeyHex": {
                    "type": "string",
                    "description": "Optional. Private key"
                  },
                  "meta": {
                    "type": "object",
                    "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                  }
                },
                "required": [
                  "kid",
                  "kms",
                  "type",
                  "publicKeyHex"
                ],
                "additionalProperties": false,
                "description": "Cryptographic key"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Imports a created key",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerSignEthTX": {
      "post": {
        "description": "Signs Ethereum transaction",
        "operationId": "keyManagerSignEthTX",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  },
                  "transaction": {
                    "type": "object",
                    "description": "Ethereum transaction object"
                  }
                },
                "required": [
                  "kid",
                  "transaction"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerSignEthTX | keyManagerSignEthTX}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signs Ethereum transaction",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/keyManagerSignJWT": {
      "post": {
        "description": "Signs JWT",
        "operationId": "keyManagerSignJWT",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "kid": {
                    "type": "string",
                    "description": "Key ID"
                  },
                  "data": {
                    "type": "string",
                    "description": "Data to sign"
                  }
                },
                "required": [
                  "kid",
                  "data"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IKeyManager.keyManagerSignJWT | keyManagerSignJWT}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signs JWT",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/createVerifiableCredential": {
      "post": {
        "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
        "operationId": "createVerifiableCredential",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "credential": {
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
                      }
                    },
                    "required": [
                      "@context",
                      "credentialSubject",
                      "issuanceDate",
                      "issuer",
                      "type"
                    ],
                    "description": "This data type represents a parsed VerifiableCredential.\nIt is meant to be an unambiguous representation of the properties of a Credential and is usually the result of a transformation method.\n\n`issuer` is always an object with an `id` property and potentially other app specific issuer claims\n`issuanceDate` is an ISO DateTime string\n`expirationDate`, is a nullable ISO DateTime string\n\nAny JWT specific properties are transformed to the broader W3C variant and any app specific properties are left intact"
                  },
                  "save": {
                    "type": "boolean",
                    "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the\n{@link daf-core#IDataStore | storage plugin} to be saved"
                  },
                  "proofFormat": {
                    "type": "string",
                    "enum": [
                      "jwt"
                    ],
                    "description": "The type of encoding to be used for the Verifiable Credential or Presentation to be generated.\n\nOnly `jwt` is supported at the moment."
                  }
                },
                "required": [
                  "credential",
                  "proofFormat"
                ],
                "additionalProperties": false,
                "description": "Encapsulates the parameters required to create a\n{@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates a Verifiable Credential. The payload, signer and format are chosen based on the ",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "proof": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        }
                      }
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
                  "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                }
              }
            }
          }
        }
      }
    },
    "/createVerifiablePresentation": {
      "post": {
        "description": "Creates a Verifiable Presentation. The payload, signer and format are chosen based on the ",
        "operationId": "createVerifiablePresentation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "presentation": {
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
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
                              }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
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
                    "description": "This data type represents a parsed Presentation payload.\nIt is meant to be an unambiguous representation of the properties of a Presentation and is usually the result of a transformation method.\n\nThe `verifiableCredential` array should contain parsed `Verifiable-Credential` elements.\nAny JWT specific properties are transformed to the broader W3C variant and any other app specific properties are left intact."
                  },
                  "save": {
                    "type": "boolean",
                    "description": "If this parameter is true, the resulting VerifiablePresentation is sent to the\n{@link daf-core#IDataStore | storage plugin} to be saved"
                  },
                  "proofFormat": {
                    "type": "string",
                    "enum": [
                      "jwt"
                    ],
                    "description": "The type of encoding to be used for the Verifiable Credential or Presentation to be generated.\n\nOnly `jwt` is supported at the moment."
                  }
                },
                "required": [
                  "presentation",
                  "proofFormat"
                ],
                "additionalProperties": false,
                "description": "Encapsulates the parameters required to create a\n{@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Creates a Verifiable Presentation. The payload, signer and format are chosen based on the ",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "proof": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        }
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
                  "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                }
              }
            }
          }
        }
      }
    },
    "/createSelectiveDisclosureRequest": {
      "post": {
        "description": "",
        "operationId": "createSelectiveDisclosureRequest",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
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
                                "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
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
                  }
                },
                "required": [
                  "data"
                ],
                "additionalProperties": false,
                "description": "Contains the parameters of a Selective Disclosure Request."
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/getVerifiableCredentialsForSdr": {
      "post": {
        "description": "",
        "operationId": "getVerifiableCredentialsForSdr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
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
                                "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
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
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
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
                          "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
                        },
                        "description": "A list of accepted Issuers for this credential."
                      },
                      "credentials": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
                              }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                        }
                      }
                    },
                    "required": [
                      "claimType",
                      "credentials"
                    ],
                    "additionalProperties": false,
                    "description": "The credentials that make up a response of a Selective Disclosure"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/validatePresentationAgainstSdr": {
      "post": {
        "description": "",
        "operationId": "validatePresentationAgainstSdr",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "presentation": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                      "proof": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string"
                          }
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
                    "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                  },
                  "sdr": {
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
                                "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
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
                  }
                },
                "required": [
                  "presentation",
                  "sdr"
                ],
                "additionalProperties": false,
                "description": "A tuple used to verify a Selective Disclosure Response.\nEncapsulates the response(`presentation`) and the corresponding request (`sdr`) that made it."
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "valid": {
                      "type": "boolean"
                    },
                    "claims": {
                      "type": "array",
                      "items": {
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
                              "description": "Used for requesting Credentials using Selective Disclosure.\nRepresents an accepted issuer of a credential."
                            },
                            "description": "A list of accepted Issuers for this credential."
                          },
                          "credentials": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "additionalProperties": false,
                              "properties": {
                                "proof": {
                                  "type": "object",
                                  "properties": {
                                    "type": {
                                      "type": "string"
                                    }
                                  }
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
                              "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                            }
                          }
                        },
                        "required": [
                          "claimType",
                          "credentials"
                        ],
                        "additionalProperties": false,
                        "description": "The credentials that make up a response of a Selective Disclosure"
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
              }
            }
          }
        }
      }
    },
    "/sendMessageDIDCommAlpha1": {
      "post": {
        "description": "This is used to create a message according to the initial ",
        "operationId": "sendMessageDIDCommAlpha1",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
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
                    ],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "data"
                ],
                "additionalProperties": false,
                "description": "Input arguments for {@link IDIDComm.sendMessageDIDCommAlpha1}"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "This is used to create a message according to the initial ",
            "content": {
              "application/json": {
                "schema": {
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
                          "type": "string"
                        },
                        {
                          "type": "object"
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
                      "type": "array",
                      "items": {
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
                        "additionalProperties": false,
                        "description": "Message meta data"
                      },
                      "description": "Optional. Array of message metadata"
                    },
                    "credentials": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
                            }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable credentials"
                    },
                    "presentations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      },
                      "description": "Optional. Array of attached verifiable presentations"
                    }
                  },
                  "required": [
                    "id",
                    "type"
                  ],
                  "additionalProperties": false,
                  "description": "DIDComm message"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetIdentities": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetIdentities",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "did",
                            "alias",
                            "provider"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "did",
                            "alias",
                            "provider"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "did": {
                        "type": "string",
                        "description": "Decentralized identifier"
                      },
                      "alias": {
                        "type": "string",
                        "description": "Optional. Identity alias. Can be used to reference an object in an external system"
                      },
                      "provider": {
                        "type": "string",
                        "description": "Identity provider name"
                      },
                      "controllerKeyId": {
                        "type": "string",
                        "description": "Controller key id"
                      },
                      "keys": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "kid": {
                              "type": "string",
                              "description": "Key ID"
                            },
                            "kms": {
                              "type": "string",
                              "description": "Key Management System"
                            },
                            "type": {
                              "type": "string",
                              "enum": [
                                "Ed25519",
                                "Secp256k1"
                              ],
                              "description": "Cryptographic key type"
                            },
                            "publicKeyHex": {
                              "type": "string",
                              "description": "Public key"
                            },
                            "privateKeyHex": {
                              "type": "string",
                              "description": "Optional. Private key"
                            },
                            "meta": {
                              "type": "object",
                              "description": "Optional. Key metadata. Can be used to store auth data to access remote kms"
                            }
                          },
                          "required": [
                            "kid",
                            "kms",
                            "type",
                            "publicKeyHex"
                          ],
                          "additionalProperties": false,
                          "description": "Cryptographic key"
                        },
                        "description": "Array of managed keys"
                      },
                      "services": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "description": "ID"
                            },
                            "type": {
                              "type": "string",
                              "description": "Service type"
                            },
                            "serviceEndpoint": {
                              "type": "string",
                              "description": "Endpoint URL"
                            },
                            "description": {
                              "type": "string",
                              "description": "Optional. Description"
                            }
                          },
                          "required": [
                            "id",
                            "type",
                            "serviceEndpoint"
                          ],
                          "additionalProperties": false,
                          "description": "Identity service"
                        },
                        "description": "Array of services"
                      }
                    },
                    "required": [
                      "did",
                      "provider",
                      "controllerKeyId",
                      "keys",
                      "services"
                    ],
                    "additionalProperties": false,
                    "description": "Identity interface"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetIdentitiesCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetIdentitiesCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "did",
                            "alias",
                            "provider"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "did",
                            "alias",
                            "provider"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetMessages": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetMessages",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "from",
                            "to",
                            "id",
                            "createdAt",
                            "expiresAt",
                            "threadId",
                            "type",
                            "raw",
                            "replyTo",
                            "replyUrl"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "from",
                            "to",
                            "id",
                            "createdAt",
                            "expiresAt",
                            "threadId",
                            "type",
                            "raw",
                            "replyTo",
                            "replyUrl"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
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
                            "type": "string"
                          },
                          {
                            "type": "object"
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
                        "type": "array",
                        "items": {
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
                          "additionalProperties": false,
                          "description": "Message meta data"
                        },
                        "description": "Optional. Array of message metadata"
                      },
                      "credentials": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
                              }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                        },
                        "description": "Optional. Array of attached verifiable credentials"
                      },
                      "presentations": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "properties": {
                            "proof": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                }
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
                          "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                        },
                        "description": "Optional. Array of attached verifiable presentations"
                      }
                    },
                    "required": [
                      "id",
                      "type"
                    ],
                    "additionalProperties": false,
                    "description": "DIDComm message"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetMessagesCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetMessagesCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "from",
                            "to",
                            "id",
                            "createdAt",
                            "expiresAt",
                            "threadId",
                            "type",
                            "raw",
                            "replyTo",
                            "replyUrl"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "from",
                            "to",
                            "id",
                            "createdAt",
                            "expiresAt",
                            "threadId",
                            "type",
                            "raw",
                            "replyTo",
                            "replyUrl"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentials": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentials",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "hash": {
                        "type": "string"
                      },
                      "verifiableCredential": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
                            }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      }
                    },
                    "required": [
                      "hash",
                      "verifiableCredential"
                    ],
                    "additionalProperties": false
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsByClaims": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsByClaims",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "credentialType",
                            "type",
                            "value",
                            "isObj",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "credentialType",
                            "type",
                            "value",
                            "isObj",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "hash": {
                        "type": "string"
                      },
                      "verifiableCredential": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
                            }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      }
                    },
                    "required": [
                      "hash",
                      "verifiableCredential"
                    ],
                    "additionalProperties": false
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsByClaimsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsByClaimsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "credentialType",
                            "type",
                            "value",
                            "isObj",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "credentialType",
                            "type",
                            "value",
                            "isObj",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiableCredentialsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiableCredentialsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "issuer",
                            "subject",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiablePresentations": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiablePresentations",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "holder",
                            "verifier",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "holder",
                            "verifier",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "hash": {
                        "type": "string"
                      },
                      "verifiablePresentation": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "proof": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string"
                              }
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
                        "description": "Represents a readonly representation of a verifiable object, including the {@link Proof}\nproperty that can be used to verify it."
                      }
                    },
                    "required": [
                      "hash",
                      "verifiablePresentation"
                    ],
                    "additionalProperties": false
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dataStoreORMGetVerifiablePresentationsCount": {
      "post": {
        "description": "",
        "operationId": "dataStoreORMGetVerifiablePresentationsCount",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "where": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "holder",
                            "verifier",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "value": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "not": {
                          "type": "boolean"
                        },
                        "op": {
                          "type": "string",
                          "enum": [
                            "LessThan",
                            "LessThanOrEqual",
                            "MoreThan",
                            "MoreThanOrEqual",
                            "Equal",
                            "Like",
                            "Between",
                            "In",
                            "Any",
                            "IsNull"
                          ]
                        }
                      },
                      "required": [
                        "column"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "order": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "column": {
                          "type": "string",
                          "enum": [
                            "context",
                            "type",
                            "id",
                            "holder",
                            "verifier",
                            "expirationDate",
                            "issuanceDate"
                          ]
                        },
                        "direction": {
                          "type": "string",
                          "enum": [
                            "ASC",
                            "DESC"
                          ]
                        }
                      },
                      "required": [
                        "column",
                        "direction"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "take": {
                    "type": "number"
                  },
                  "skip": {
                    "type": "number"
                  }
                },
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    }
  }
}