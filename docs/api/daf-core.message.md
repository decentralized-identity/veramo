<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [daf-core](./daf-core.md) &gt; [Message](./daf-core.message.md)

## Message class

<b>Signature:</b>

```typescript
export declare class Message extends BaseEntity
```

## Constructors

| Constructor                                                | Modifiers | Description                                                 |
| ---------------------------------------------------------- | --------- | ----------------------------------------------------------- |
| [(constructor)(data)](./daf-core.message._constructor_.md) |           | Constructs a new instance of the <code>Message</code> class |

## Properties

| Property                                             | Modifiers | Type                        | Description |
| ---------------------------------------------------- | --------- | --------------------------- | ----------- |
| [createdAt](./daf-core.message.createdat.md)         |           | <code>Date</code>           |             |
| [credentials](./daf-core.message.credentials.md)     |           | <code>Credential[]</code>   |             |
| [data](./daf-core.message.data.md)                   |           | <code>any</code>            |             |
| [expiresAt](./daf-core.message.expiresat.md)         |           | <code>Date</code>           |             |
| [from](./daf-core.message.from.md)                   |           | <code>Identity</code>       |             |
| [id](./daf-core.message.id.md)                       |           | <code>string</code>         |             |
| [metaData](./daf-core.message.metadata.md)           |           | <code>MetaData[]</code>     |             |
| [presentations](./daf-core.message.presentations.md) |           | <code>Presentation[]</code> |             |
| [raw](./daf-core.message.raw.md)                     |           | <code>string</code>         |             |
| [replyTo](./daf-core.message.replyto.md)             |           | <code>string[]</code>       |             |
| [replyUrl](./daf-core.message.replyurl.md)           |           | <code>string</code>         |             |
| [saveDate](./daf-core.message.savedate.md)           |           | <code>Date</code>           |             |
| [threadId](./daf-core.message.threadid.md)           |           | <code>string</code>         |             |
| [to](./daf-core.message.to.md)                       |           | <code>Identity</code>       |             |
| [type](./daf-core.message.type.md)                   |           | <code>string</code>         |             |
| [updateDate](./daf-core.message.updatedate.md)       |           | <code>Date</code>           |             |

## Methods

| Method                                                     | Modifiers | Description |
| ---------------------------------------------------------- | --------- | ----------- |
| [addMetaData(meta)](./daf-core.message.addmetadata.md)     |           |             |
| [getLastMetaData()](./daf-core.message.getlastmetadata.md) |           |             |
| [isValid()](./daf-core.message.isvalid.md)                 |           |             |
| [setId()](./daf-core.message.setid.md)                     |           |             |