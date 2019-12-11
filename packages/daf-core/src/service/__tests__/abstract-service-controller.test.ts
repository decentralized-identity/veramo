import { AbstractServiceController, ServiceEventTypes } from '../abstract-service-controller'
import { Issuer } from '../../identity/identity-manager'
import { Resolver } from '../../core'
import { Message } from '../../message/message'

const msg1 = new Message({ raw: 'test1', meta: { type: 'test' } })
const msg2 = new Message({ raw: 'test2', meta: { type: 'test' } })

export class MockServiceController extends AbstractServiceController {
  static defaultServiceEndpoint: string = 'https://default.host/path'
  readonly type = 'mockService'
  private endPointUrl: string

  constructor(issuer: Issuer, didResolver: Resolver) {
    super(issuer, didResolver)
    this.endPointUrl = 'https://from-did-doc'
  }

  instanceId() {
    return {
      did: this.issuer.did,
      type: this.type,
      id: this.endPointUrl,
    }
  }

  async getMessagesSince(timestamp: number) {
    this.emit(ServiceEventTypes.NewMessages, [msg1, msg2])
    return [msg1, msg2]
  }

  async listen() {
    this.emit(ServiceEventTypes.NewMessages, [msg1])
  }
}

const mockIssuer: Issuer = {
  did: 'did:test:123',
  signer: async (data: string) => data,
  type: 'mock',
}

const mockResolver: Resolver = {
  resolve: async (did: string) => null,
}

it('should be possible to set configuration as a static property', async () => {
  expect(MockServiceController.defaultServiceEndpoint).toEqual('https://default.host/path')
  MockServiceController.defaultServiceEndpoint = 'https://custom.host/path'
  expect(MockServiceController.defaultServiceEndpoint).toEqual('https://custom.host/path')
})

it('returns and emits an event with the same message array ', async () => {
  const controller = new MockServiceController(mockIssuer, mockResolver)
  spyOn(controller, 'emit')
  const messages = await controller.getMessagesSince(0)
  expect(controller.emit).toHaveBeenCalledWith(ServiceEventTypes.NewMessages, messages)
})

it('emits events on listen', async () => {
  const controller = new MockServiceController(mockIssuer, mockResolver)
  spyOn(controller, 'emit')
  await controller.listen()
  expect(controller.emit).toHaveBeenCalledWith(ServiceEventTypes.NewMessages, [msg1])
})

it('instanceId is generated from state', async () => {
  const controller = new MockServiceController(mockIssuer, mockResolver)
  const instanceId = controller.instanceId()
  expect(instanceId).toEqual({ did: 'did:test:123', type: controller.type, id: 'https://from-did-doc' })
})
