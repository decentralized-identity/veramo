export const schema = {
  "IDIDDiscovery": {
    "components": {
      "schemas": {
        "IDIDDiscoveryDiscoverDidArgs": {
          "description": "Contains the parameters of a DID Discovery Request.",
          "properties": {
            "options": {
              "description": "Provider specific options",
              "type": "object"
            },
            "query": {
              "description": "Search string",
              "type": "string"
            }
          },
          "required": [
            "query"
          ],
          "type": "object"
        },
        "IDIDDiscoverMatch": {
          "description": "A single discovery match.",
          "properties": {
            "did": {
              "description": "DID",
              "type": "string"
            },
            "metaData": {
              "description": "Provider specific related metadata about the match",
              "type": "object"
            }
          },
          "required": [
            "did",
            "metaData"
          ],
          "type": "object"
        },
        "IDIDDiscoveryDiscoverDidResult": {
          "description": "DID Discovery results.",
          "properties": {
            "errors": {
              "additionalProperties": {
                "type": "string"
              },
              "description": "A record of encountered errors",
              "type": "object"
            },
            "options": {
              "description": "Provider specific options",
              "type": "object"
            },
            "query": {
              "description": "Search string",
              "type": "string"
            },
            "results": {
              "description": "List of discovery results from different providers",
              "items": {
                "$ref": "#/components/schemas/IDIDDiscoveryProviderResult"
              },
              "type": "array"
            }
          },
          "required": [
            "results"
          ],
          "type": "object"
        },
        "IDIDDiscoveryProviderResult": {
          "description": "Discovery results from one provider.",
          "properties": {
            "matches": {
              "description": "List of discovery matches",
              "items": {
                "$ref": "#/components/schemas/IDIDDiscoverMatch"
              },
              "type": "array"
            },
            "provider": {
              "description": "Provider name",
              "type": "string"
            }
          },
          "required": [
            "provider",
            "matches"
          ],
          "type": "object"
        }
      },
      "methods": {
        "discoverDid": {
          "description": "",
          "arguments": {
            "$ref": "#/components/schemas/IDIDDiscoveryDiscoverDidArgs"
          },
          "returnType": {
            "$ref": "#/components/schemas/IDIDDiscoveryDiscoverDidResult"
          }
        }
      }
    }
  }
}