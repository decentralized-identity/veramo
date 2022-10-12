// noinspection ES6PreferShortImport

import { IDataStore, IDataStoreORM, IMessage, IMessageHandler, TAgent } from '../../packages/core/src'

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
        'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdmVyYW1vLmlvL2NvbnRleHRzL3Byb2ZpbGUvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJ5b3UiOiJSb2NrIn19LCJzdWIiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIiwibmJmIjoxNjY1NDQ2NTgxLCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHgwMmExNDYzZDIyMDVjN2NkN2ZiMjkzY2RlNGQ5ZTM2YWRjYTk5MGY3ZWZhOTBiOTVlNTRmNTBkZjBhMTZjMTc0MjIifQ.cOUOSic-8YGQfUGPmHjj5HDS09LXGj9nEe6UOsbYRbl-VZMoLBNHcFgp2B-ZWNhe202B-pbCK51xM3viO3OfZA'
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
