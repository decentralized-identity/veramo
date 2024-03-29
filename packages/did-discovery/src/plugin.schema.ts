export const schema = {
  "IDIDDiscovery": {
    "components": {
      "schemas": {
        "IDIDDiscoveryDiscoverDidArgs": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search string"
            },
            "options": {
              "type": "object",
              "description": "Provider specific options"
            }
          },
          "required": [
            "query"
          ],
          "description": "Contains the parameters of a DID Discovery Request."
        },
        "IDIDDiscoveryDiscoverDidResult": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search string"
            },
            "options": {
              "type": "object",
              "description": "Provider specific options"
            },
            "results": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IDIDDiscoveryProviderResult"
              },
              "description": "List of discovery results from different providers"
            },
            "errors": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              },
              "description": "A record of encountered errors"
            }
          },
          "required": [
            "results"
          ],
          "description": "DID Discovery results."
        },
        "IDIDDiscoveryProviderResult": {
          "type": "object",
          "properties": {
            "provider": {
              "type": "string",
              "description": "Provider name"
            },
            "matches": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/IDIDDiscoverMatch"
              },
              "description": "List of discovery matches"
            }
          },
          "required": [
            "provider",
            "matches"
          ],
          "description": "Discovery results from one provider."
        },
        "IDIDDiscoverMatch": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string",
              "description": "DID"
            },
            "metaData": {
              "type": "object",
              "description": "Provider specific related metadata about the match"
            }
          },
          "required": [
            "did",
            "metaData"
          ],
          "description": "A single discovery match."
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