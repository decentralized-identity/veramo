import { describe, expect, it } from 'vitest'

import { IAgentContext, IMessageHandler } from '../../../core-types/src/index.js'
import { createAgent } from '../../../core/src/index.js'
import { MessageHandler } from '../message-handler.js'

import { AbstractMessageHandler } from "../abstract-message-handler.js";
import { Message } from "../message.js";



class DummyHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IAgentContext<{}>): Promise<Message> {
    return super.handle(message, context)
  }
}

describe('@veramo/message-handler', () => {
  const a = 100
  it('should run a dummy test', () => {
    expect(a).toEqual(100)
  })

  let agent = createAgent<IMessageHandler>({
    plugins: [
      new MessageHandler({
        messageHandlers: [new DummyHandler()],
      }),
    ],
  })

  it('should reject unknown message', async () => {
    expect.assertions(1)
    const raw = 'some message of unknown format'
    await expect(agent.handleMessage({ raw, save: false, metaData: [{ type: 'test' }] })).rejects.toThrow(
      'Unsupported message type',
    )
  })
})
