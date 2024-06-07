// noinspection ES6PreferShortImport

import { IDataStore, IDataStoreORM, IMessage, IMessageHandler, TAgent } from '../../packages/core-types/src'

type ConfiguredAgent = TAgent<IDataStore & IMessageHandler & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('message handler', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    let parsedMessage: IMessage

    it('should parse raw message', async () => {
      const raw =
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJBbGljZSJ9fSwic3ViIjoiZGlkOmtleTp6Nk1rakRVR29STDFTVVdGWVkzRmF6SkZYd1JpeVZQeHNwS3NraTlCSlZzRFpIQmkiLCJuYmYiOjE3MTc3NDY3MzUsImlzcyI6ImRpZDprZXk6ejZNa2pEVUdvUkwxU1VXRllZM0ZhekpGWHdSaXlWUHhzcEtza2k5QkpWc0RaSEJpIn0.USuGnZCTwqDUXRaPBlQN_c8LZxl03zf8TkEqP6xC4I6I-ruj5NNbQ_bYhOCUTi9LER_FO5zDU8V0MmaPCxnNBA'
      parsedMessage = await agent.handleMessage({
        raw,
        save: false,
        metaData: [{ type: 'test' }],
      })
      expect(typeof parsedMessage.id).toEqual('string')
    })

    it('should save message', async () => {
      const id = await agent.dataStoreSaveMessage({ message: parsedMessage })
      expect(id).toEqual(parsedMessage.id)
    })

    it('should get message from db', async () => {
      const message = await agent.dataStoreGetMessage({ id: parsedMessage.id })
      // message has empty `presentations` array (not present in `parsedMessage`), when 
      // using db (not json store)
      // expect(message).toEqual(parsedMessage)
      expect(message.raw).toEqual(parsedMessage.raw)
      expect(message.data).toEqual(parsedMessage.data)
      expect(message.metaData).toEqual(parsedMessage.metaData)
    })

    it('should throw error for non existing message', async () => {
      await expect(
        agent.dataStoreGetMessage({
          id: 'foobar',
        }),
      ).rejects.toThrow('Message not found')
    })

    it('should count messages', async () => {
      const allMessages = await agent.dataStoreORMGetMessages()
      const count = await agent.dataStoreORMGetMessagesCount()
      expect(allMessages.length).toEqual(count)
    })
  })
}
