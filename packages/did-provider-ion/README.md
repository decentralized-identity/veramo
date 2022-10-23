# Veramo did:ion provider

This package contains an implementation of the `AbstractIdentifierProvider` for the `did:ion` method.
Enabling creating, updating, deactivating and resolving of `did:ion` entities. The ION Network is an implementation of
the
[Sidetree](https://identity.foundation/sidetree/spec/) protocol
and [specification](https://identity.foundation/sidetree/spec/) using the Bitcoin blockchain.
An explorer can be found [here](https://identity.foundation/ion/explorer/).

_WARNING: Although the update and removal functions for Keys and Services seem to yield a request with a valid response
from the ION
node, right now these update and delete operations are not reflected in the eventual DID Document after the anchor time
has passed when using Microsoft's Public ION node. We are actively looking to solve this issue_

## Long form and short form ION DIDs

ION has the concept of short form DIDs. a Short form DID is a DID, you also typically encounter when using other DID
methods. They are resolved using a resolver, as long as the DID is anchored or stored.

Since ION uses the Bitcoin network it takes time to propagate changes (see next chapter). To ensure that ION DIDs can
already be resolved directly after creation a long form DID is available. The long form DID starts with the short form
DID and then a signed string is appended after a colon. This means that a long form DID is self certifying as it is
signed. It basically is a representation of the DID Document directly within the DID, similar to for instance did:key.
Long form DIDs are resolvable immediately.
More info about long and short form ION DIDs can be found in
the [Sidetree specification](https://identity.foundation/sidetree/spec/#did-uri-composition)

This ION Provider creates Veramo Identifiers using Long form as the identifier's 'did' value, whilst using the short
form as it's 'alias' value.

## Timing and limitations of current ION Network

ION uses the Bitcoin network to anchor DIDs. As a result it typically also takes at least 10 minutes before requests are
actually reflected in the ION Network.
The net result is that you will not see your updates reflected in for instance
the [ION Explorer](https://identity.foundation/ion/explorer/) or when resolving the DID, until this time has passed.

Currently, you can only use one operation for the same Identifier in between anchoring on the network. This typically is
roughly 10-15 minutes.
The net-result is that you will receive an error in case you are trying to add or remove keys and services for the same
identifier within this period.

## Update key(s) and rotation

The ION DID provider uses Update keys when updating the DID document. The provider creates new update keys internally
for every update. These are stored ordered by timestamp. When updating the DID Document if first resolves the current
DID document to look at the ION/Sidetree update commitment value. It then looks up the local key with the same
commitment value. The update request will be signed using the matched update key. At the same time a new update key is
generated, and the new key's update commitment will also be part of the update request, so that this new key needs to be used
next time. The provider takes care of both the rotation and the selection of the correct update key.

## Recovery key(s) and rotation

Recovery Keys are needed for deleting the Identifier and deactivating the DID. It uses a similar mechanism as described
above for the update keys.
The ION update keys could also be used in case of loss of update keys. Currently, this provider does not expose methods
to do this, although most of the methods and infra to do so should be present.

## NodeJS and Browser notice

When using the ION DID Provider in the browser or a Node environment, you can ignore the warning about the missing peer
dependency for `@sphereon/react-native-argon2`. Obviously these are not needed for non react-native
projects.

## React Native notice

Next to NodeJS and Browser support, the ION DID Provider also works with react-native. You do need to install the
following
package using your package manager. This has to do with auto-linking not being available for transitive dependencies. We
need some native Argon2 Android/IOS modules on React Native because WASM isn't available. As such you will have to
install the dependency directly into your app. You do not need to change settings or anything. The dependency will be
picked up and used automatically.
See [this ticket](https://github.com/react-native-community/cli/issues/870) for a discussion about this issue.

npm: `npm install @sphereon/react-native-argon2`

yarn: `yarn add @sphereon/react-native-argon2`

## Different ION node and challenge/response settings

The ION DID provider by default uses Microsoft's publicly hosted ION node(s)
at: https://beta.ion.msidentity.com/api/v1.0/operations

This Node uses a challenge/response system to prevent spam. The `challengeEnabled` option, defaults to true with
a `challengeEndpoint` value of https://beta.ion.msidentity.com/api/v1.0/proof-of-work-challenge.
If you are running your own node, you might want to change the `solutionEndpoint` constructor option, pointing to your
ION node, together with setting the `challengeEnabled` constructor option to false.

## Creating an identifier

When creating a new Veramo Identifier you can choose to import your own keys or have them generated for you. You can
also choose to use specific Key IDs for your key, regardless of generation or import.
The options object when creating an identifier is as follows:

```typescript
export interface ICreateIdentifierOpts {
  verificationMethods?: VerificationMethod[] // The Verification method to add
  recoveryKey?: KeyOpts // Recovery key options
  updateKey?: KeyOpts // Update key options
  services?: IService[] // Service(s) to add
  actionTimestamp?: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  anchor?: boolean // Whether the DID should be anchored on ION or not. Handy for testing or importing an ID
}

export interface VerificationMethod extends KeyOpts {
  purposes: IonPublicKeyPurpose[] // In sidetree these are called purposes, but in DID-Core Verification Relationships
}

export interface KeyOpts {
  kid?: string // Key ID to assign in case we are importing or creating a key
  key?: MinimalImportableKey // Optional key to import. If not specified a key with random kid will be created
  type?: KeyType // The key type. Defaults to Secp256k1
}

export interface IService {
  id: string // ID
  type: string // Service type
  serviceEndpoint: string // Endpoint URL
  description?: string //Optional description
}
```

### Creating an Identifier using auto-generated keys

The example below generates an update key, a recover key and creates one DID Verification Method as part of the DID
Document with id `did-generated`, with accompanying key.
The `anchor: true`, means to propagate the anchor to the ION Network. You typically want to use `true`, unless you are
importing keys for an existing DID.
The purposes are the Verification Method Relationships in the DID Document. ION/Sidetree calls these purposes.

```typescript
const identifier: IIdentifier = await agent.didManagerCreate({
  options: {
    anchor: true,
    recoveryKey: {
      kid: 'recovery-generated',
    },
    updateKey: {
      kid: 'update-generated',
    },
    verificationMethods: [
      {
        kid: 'did-generated',
        purposes: [IonPublicKeyPurpose.Authentication, IonPublicKeyPurpose.AssertionMethod],
      },
    ],
  },
})
```

### Creating an Identifier using imported keys

The example below generates an update key with random Key ID. Notice the absence of the recoveryKey property. It imports
an existing recovery key and creates one DID Verification Method as part of the DID Document with id `did-imported1`,
using an imported key.
The `anchor: true`, means to propagate the anchor to the ION Network. You typically want to use `true`, unless you are
importing keys for an existing DID.
The purposes are the Verification Method Relationships in the DID Document. ION/Sidetree calls these purposes.

```typescript
const identifier: IIdentifier = await agent.didManagerCreate({
  options: {
    anchor: true,
    updateKey: {
      kid: 'update-imported',
    },
    verificationMethods: [
      {
        kid: 'did-imported1',
        purposes: [IonPublicKeyPurpose.Authentication, IonPublicKeyPurpose.AssertionMethod],
      },
    ],
  },
})
```

## Adding and removing Keys

Adding and removing keys typically use the below options:

```typescript
export interface IUpdateOpts {
  actionTimestamp?: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  anchor?: boolean // Whether the DID should be anchored on ION or not. Handy for testing or importing an ID
}

export interface VerificationMethod extends KeyOpts {
  purposes: IonPublicKeyPurpose[] // In sidetree these are called purposes, but in DID-Core Verification Relationships
}

export interface KeyOpts {
  kid?: string // Key ID to assign in case we are importing or creating a key
  key?: MinimalImportableKey // Optional key to import. If not specified a key with random kid will be created
  type?: KeyType // The key type. Defaults to Secp256k1
}
```

### Adding a Key

Adding a key always has to happen using a previously created or imported key in Veramo. Unlike the create Identifier
function we do not support generating the key on the fly. This has to do with the interface of Veramo requiring a key.

```typescript
const key = await agent.keyManagerCreate({ kms: 'mem', type: 'Secp256k1' })
const result = agent.didManagerAddKey({
  did: identifier.did,
  key,
  kid: 'my-newly-added-key',
  options: {
    purposes: [IonPublicKeyPurpose.AssertionMethod],
    anchor: true,
  },
})
```

### Removing a Key

Removing a key always has to happen using a previously created or imported key in Veramo.

```typescript
const result = await agent.didManagerRemoveKey({
  did: identifier.did,
  kid: 'my-newly-added-key',
  options: { anchor: true },
})
```

## Adding and removing Services

Adding and removing DID Document Services involves the below interfaces:

```typescript
export interface IUpdateOpts {
  actionTimestamp?: number // Unique number denoting the action. Used for ordering internally. Suggested to use current timestamp
  anchor?: boolean // Whether the DID should be anchored on ION or not. Handy for testing or importing an ID
}

export interface VerificationMethod extends KeyOpts {
  purposes: IonPublicKeyPurpose[] // In sidetree these are called purposes, but in DID-Core Verification Relationships
}

export interface IService {
  id: string // ID
  type: string // Service type
  serviceEndpoint: string // Endpoint URL
  description?: string //Optional description
}
```

### Adding a service

Adding a service is straightforward. It requires a Service object which will end up in the DID Document, and it needs
the
DID value.

```typescript
const service: IService = {
  type: 'LinkedDomains',
  id: 'example-domain',
  serviceEndpoint: 'https://test-example.com',
}

const result = await agent.didManagerAddService({
  did: identifier.did,
  service,
  options: { anchor: true },
})
```

### Removing a service

Removing a service is straightforward. The example has no options, which equates to anchor being true.

```typescript
const result = await agent.didManagerRemoveService({
  did: identifier.did,
  id: 'example-domain',
})
```

## Removing the Identifier and DID

_WARNING: Currently deleting the identifier will always be propagated to the ION Network. Reason is that Veramo doesn't
expose an options parameter for deleting an identifier._

Deleting an identifier is straightforward:

```typescript
const deleted = await agent.didManagerDelete({ did: identifier.did })
```
