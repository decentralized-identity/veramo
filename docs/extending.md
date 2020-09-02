# Extending agent functionality

To add new functionality that depends on other agent plugins, you need to create a new [agent plugin](docs/plugin.md)

## Support for new "DID method"

To add support for new "DID method" (`did:btcr`, `did:elem`, etc) you need to create a new `IdentityProvider` that extends [AbstractIdentityProvider](api/daf-identity-manager.abstractidentityprovider.md) and add a compatible resolver to [DafResolver](api/daf-resolver.dafresolver.md) or [DafUniversalResolver](api/daf-resolver-universal.md) 

## Support for other Key Management Systems

To add support for other key management solutions you need to create a `KeyManagementSystem` that extends [AbstractKeyManagementSystem](api/daf-key-manager.abstractkeymanagementsystem.md)

## Support for new Message types

To add support for new message types, you need to write a plugin for the [MessageHandler](api/daf-message-handler.messagehandler.md) that extends [AbstractMessageHandler](api/daf-message-handler.abstractmessagehandler.md)

## Use different storage

If you want to use a custom storage for managed identities you need to create an [IdentityStore](api/daf-identity-manager.abstractidentitystore.md) for the [IdentityManager](./daf-identity-manager.identitymanager.md) 

If you want to use a custom storage for managed keys you need to create a [KeyStore](api/daf-identity-manager.abstractidentitystore.md) for the [KeyManager](api/daf-key-manager.keymanager.md) 

