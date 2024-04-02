import { DIDResolverPlugin } from '../resolver.js'
import { Resolver, VerificationMethod } from 'did-resolver'

describe('@veramo/did-resolver', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      new DIDResolverPlugin({
        // @ts-ignore
        resolver: undefined,
      })
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    expect(resolver).toHaveProperty('resolveDid')
  })

  const didDoc1 = {
    '@context':["https://www.w3.org/ns/did/v1","https://w3id.org/security/multikey/v1",
      // line below causes TS issue but isn't used in getDIDComponentById
      // {"@base":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ"}
    ],
    "id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ",
    "verificationMethod":[
      {"id":"#key-2","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff"},
      {"id":"#key-1","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA"}
    ],
    "keyAgreement":["#key-1"],
    "authentication":["#key-2"],
    "assertionMethod":["#key-2"],
    "service":[{"id":"1","description":"a DIDComm endpoint","serviceEndpoint":"did:web:dev-didcomm-mediator.herokuapp.com","type":"DIDCommMessaging"}]
  }
  
  it('should correctly get component by key suffix with key in verificationMethod as suffix only', async () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    const result = await resolver.getDIDComponentById({ didDocument: didDoc1, section: 'keyAgreement', didUrl: '#key-1'})
    expect((result.valueOf()as VerificationMethod).id).toEqual("did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1")
  })
  
  const didDoc2 = {
    "@context":["https://www.w3.org/ns/did/v1","https://w3id.org/security/multikey/v1",
      // {"@base":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ"}
    ],
    "id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ",
    "verificationMethod":[
      {"id":"#key-2","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff"},
      {"id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA"}
    ],
    "keyAgreement":["#key-1"],
    "authentication":["#key-2"],
    "assertionMethod":["#key-2"],
    "service":[{"id":"1","description":"a DIDComm endpoint","serviceEndpoint":"did:web:dev-didcomm-mediator.herokuapp.com","type":"DIDCommMessaging"}]
  }  

  it('should correctly get component by key suffix with key in verificationMethod as DID + suffix', async () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    const result = await resolver.getDIDComponentById({ didDocument: didDoc2, section: 'keyAgreement', didUrl: '#key-1'})
    expect((result.valueOf()as VerificationMethod).id).toEqual("did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1")
  })

  const didDoc3 = {
    "@context":["https://www.w3.org/ns/did/v1","https://w3id.org/security/multikey/v1",
      // {"@base":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ"}
    ],
    "id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ",
    "verificationMethod":[
      {"id":"#key-2","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff"},
      {"id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA"}
    ],
    "keyAgreement":["#key-1"],
    "authentication":["#key-2"],
    "assertionMethod":["#key-2"],
    "service":[{"id":"1","description":"a DIDComm endpoint","serviceEndpoint":"did:web:dev-didcomm-mediator.herokuapp.com","type":"DIDCommMessaging"}]
  }  

  it('should correctly get component by DID + key suffix with key in verificationMethod as DID + suffix', async () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    const result = await resolver.getDIDComponentById({ didDocument: didDoc3, section: 'keyAgreement', didUrl: 'did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1'})
    expect((result.valueOf()as VerificationMethod).id).toEqual("did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1")
  })

  
  const didDoc4 = {
    "@context":["https://www.w3.org/ns/did/v1","https://w3id.org/security/multikey/v1",
      // {"@base":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ"}
    ],
    "id":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ",
    "verificationMethod":[
      {"id":"#key-2","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff"},
      {"id":"#key-1","type":"Multikey","controller":"did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ","publicKeyMultibase":"z6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA"}
    ],
    "keyAgreement":["#key-1"],
    "authentication":["#key-2"],
    "assertionMethod":["#key-2"],
    "service":[{"id":"1","description":"a DIDComm endpoint","serviceEndpoint":"did:web:dev-didcomm-mediator.herokuapp.com","type":"DIDCommMessaging"}]
  }  

  it('should correctly get component by DID + key suffix with key in verificationMethod as suffix only', async () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    const result = await resolver.getDIDComponentById({ didDocument: didDoc4, section: 'keyAgreement', didUrl: 'did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1'})
    expect((result.valueOf()as VerificationMethod).id).toEqual("did:peer:2.Ez6LSiNkZ4hS9ivnKXcEf1GGfXxqcWSCCXaFC775JZjVfwkoA.Vz6Mkr6TpZKXqdt4Kx28GSrLt4VysTWof6Npm4HNaGMcVPTff.SeyJpZCI6IjEiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ#key-1")
  })
})
