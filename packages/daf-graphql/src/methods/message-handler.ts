import { IAgentGraphQLMethod } from '../types'

export const handleMessage: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation handleMessage($raw: String!, $metaData: [MetaDataInput], $save: Boolean) {
      handleMessage(raw: $raw, metaData: $metaData, save: $save) {
        id
        createdAt
        expiresAt
        threadId
        type
        raw
        data
        replyTo
        replyUrl
        from 
        to 
        presentations
        credentials
        metaData {
          type
          value
        }
      } 
    }
  `,
  typeDef: `
    input MetaDataInput {
      type: String!
      value: String
    }

    extend type Mutation {
      handleMessage(raw: String!, metaData: [MetaDataInput], save: Boolean = true): Message
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  handleMessage,
}

export default supportedMethods
