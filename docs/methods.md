# Available agent methods
## [IResolver](./api/daf-core.iresolver.md) 


### [resolveDid](./api/daf-core.iresolver.resolvedid.md)

Resolves DID and returns DID Document

```typescript
const doc = await agent.resolveDid({
  didUrl: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
})

expect(doc).toEqual({
  '@context': 'https://w3id.org/did/v1',
  id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
  publicKey: [
    {
       id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
       type: 'Secp256k1VerificationKey2018',
       controller: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
       ethereumAddress: '0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
    }
  ],
  authentication: [
    {
       type: 'Secp256k1SignatureAuthentication2018',
       publicKey: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'
    }
  ]
})
```
## [IIdentityManager](./api/daf-core.iidentitymanager.md) 


### [identityManagerAddKey](./api/daf-core.iidentitymanager.identitymanageraddkey.md)

Adds a key to a DID Document


### [identityManagerAddService](./api/daf-core.iidentitymanager.identitymanageraddservice.md)

Adds a service to a DID Document


### [identityManagerCreateIdentity](./api/daf-core.iidentitymanager.identitymanagercreateidentity.md)

Creates and returns a new identity

```typescript
const identity = await agent.identityManagerCreateIdentity({
  alias: 'alice',
  provider: 'did:ethr:rinkeby',
  kms: 'local'
})
```

### [identityManagerDeleteIdentity](./api/daf-core.iidentitymanager.identitymanagerdeleteidentity.md)

Deletes identity


### [identityManagerGetIdentities](./api/daf-core.iidentitymanager.identitymanagergetidentities.md)

Returns a list of managed identities

```typescript
const aliceIdentities = await agent.identityManagerGetIdentities({
  alias: 'alice'
})

const rinkebyIdentities = await agent.identityManagerGetIdentities({
  provider: 'did:ethr:rinkeby'
})
```

### [identityManagerGetIdentity](./api/daf-core.iidentitymanager.identitymanagergetidentity.md)

Returns a specific identity


### [identityManagerGetIdentityByAlias](./api/daf-core.iidentitymanager.identitymanagergetidentitybyalias.md)

Returns a specific identity by alias

```typescript
const identity = await agent.identityManagerGetIdentityByAlias({
  alias: 'alice',
  provider: 'did:ethr:rinkeby'
})
```

### [identityManagerGetOrCreateIdentity](./api/daf-core.iidentitymanager.identitymanagergetorcreateidentity.md)

Returns an existing identity or creates a new one for a specific alias


### [identityManagerGetProviders](./api/daf-core.iidentitymanager.identitymanagergetproviders.md)

Returns a list of available identity providers


### [identityManagerImportIdentity](./api/daf-core.iidentitymanager.identitymanagerimportidentity.md)

Imports identity


### [identityManagerRemoveKey](./api/daf-core.iidentitymanager.identitymanagerremovekey.md)

Removes a key from a DID Document


### [identityManagerRemoveService](./api/daf-core.iidentitymanager.identitymanagerremoveservice.md)

Removes a service from a DID Document


### [identityManagerSetAlias](./api/daf-core.iidentitymanager.identitymanagersetalias.md)

Sets identity alias

```typescript
const identity = await agent.identityManagerCreateIdentity()
const result = await agent.identityManagerSetAlias({
  did: identity.did,
  alias: 'carol',
})
```
## [IMessageHandler](./api/daf-core.imessagehandler.md) 


### [handleMessage](./api/daf-core.imessagehandler.handlemessage.md)

Parses and optionally saves a message

## [IDataStore](./api/daf-core.idatastore.md) 


### [dataStoreGetMessage](./api/daf-core.idatastore.datastoregetmessage.md)

Gets message from the data store


### [dataStoreGetVerifiableCredential](./api/daf-core.idatastore.datastoregetverifiablecredential.md)

Gets verifiable credential from the data store


### [dataStoreGetVerifiablePresentation](./api/daf-core.idatastore.datastoregetverifiablepresentation.md)

Gets verifiable presentation from the data store


### [dataStoreSaveMessage](./api/daf-core.idatastore.datastoresavemessage.md)

Saves message to the data store


### [dataStoreSaveVerifiableCredential](./api/daf-core.idatastore.datastoresaveverifiablecredential.md)

Saves verifiable credential to the data store


### [dataStoreSaveVerifiablePresentation](./api/daf-core.idatastore.datastoresaveverifiablepresentation.md)

Saves verifiable presentation to the data store

## [IKeyManager](./api/daf-core.ikeymanager.md) 


### [keyManagerCreateKey](./api/daf-core.ikeymanager.keymanagercreatekey.md)

Creates and returns a new key


### [keyManagerDecryptJWE](./api/daf-core.ikeymanager.keymanagerdecryptjwe.md)

Decrypts data


### [keyManagerDeleteKey](./api/daf-core.ikeymanager.keymanagerdeletekey.md)

Deletes a key


### [keyManagerEncryptJWE](./api/daf-core.ikeymanager.keymanagerencryptjwe.md)

Encrypts data


### [keyManagerGetKey](./api/daf-core.ikeymanager.keymanagergetkey.md)

Returns an existing key


### [keyManagerGetKeyManagementSystems](./api/daf-core.ikeymanager.keymanagergetkeymanagementsystems.md)

Lists available key management systems


### [keyManagerImportKey](./api/daf-core.ikeymanager.keymanagerimportkey.md)

Imports a created key


### [keyManagerSignEthTX](./api/daf-core.ikeymanager.keymanagersignethtx.md)

Signs Ethereum transaction


### [keyManagerSignJWT](./api/daf-core.ikeymanager.keymanagersignjwt.md)

Signs JWT

## [ICredentialIssuer](./api/daf-w3c.icredentialissuer.md) 


### [createVerifiableCredential](./api/daf-w3c.icredentialissuer.createverifiablecredential.md)

Creates a Verifiable Credential. The payload, signer and format are chosen based on the 


### [createVerifiablePresentation](./api/daf-w3c.icredentialissuer.createverifiablepresentation.md)

Creates a Verifiable Presentation. The payload, signer and format are chosen based on the 

## [ISelectiveDisclosure](./api/daf-selective-disclosure.iselectivedisclosure.md) 


### [createProfilePresentation](./api/daf-selective-disclosure.iselectivedisclosure.createprofilepresentation.md)




### [createSelectiveDisclosureRequest](./api/daf-selective-disclosure.iselectivedisclosure.createselectivedisclosurerequest.md)




### [getVerifiableCredentialsForSdr](./api/daf-selective-disclosure.iselectivedisclosure.getverifiablecredentialsforsdr.md)




### [validatePresentationAgainstSdr](./api/daf-selective-disclosure.iselectivedisclosure.validatepresentationagainstsdr.md)



## [IDIDComm](./api/daf-did-comm.ididcomm.md) 


### [sendMessageDIDCommAlpha1](./api/daf-did-comm.ididcomm.sendmessagedidcommalpha1.md)

This is used to create a message according to the initial 

## [IDataStoreORM](./api/daf-typeorm.idatastoreorm.md) 


### [dataStoreORMGetIdentities](./api/daf-typeorm.idatastoreorm.datastoreormgetidentities.md)




### [dataStoreORMGetIdentitiesCount](./api/daf-typeorm.idatastoreorm.datastoreormgetidentitiescount.md)




### [dataStoreORMGetMessages](./api/daf-typeorm.idatastoreorm.datastoreormgetmessages.md)




### [dataStoreORMGetMessagesCount](./api/daf-typeorm.idatastoreorm.datastoreormgetmessagescount.md)




### [dataStoreORMGetVerifiableCredentials](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablecredentials.md)




### [dataStoreORMGetVerifiableCredentialsByClaims](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablecredentialsbyclaims.md)




### [dataStoreORMGetVerifiableCredentialsByClaimsCount](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablecredentialsbyclaimscount.md)




### [dataStoreORMGetVerifiableCredentialsCount](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablecredentialscount.md)




### [dataStoreORMGetVerifiablePresentations](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablepresentations.md)




### [dataStoreORMGetVerifiablePresentationsCount](./api/daf-typeorm.idatastoreorm.datastoreormgetverifiablepresentationscount.md)



