import { AbstractServiceController } from '../abstract-service-controller'
import { ServiceEventTypes } from '../service-manager'
import { Issuer } from '../../identity/identity-manager'
import { Resolver } from '../../core'
import { Message } from '../../message/message'

const msg1 = new Message({ raw: 'test1', meta: { type: 'mockService', id: 'https://from-did-doc' } })
const msg2 = new Message({ raw: 'test2', meta: { type: 'mockService', id: 'https://from-did-doc' } })

export class MockServiceController extends AbstractServiceController {
  static defaultServiceEndpoint: string = 'https://default.host/path'
  readonly type = 'mockService'
  private endPointUrl: string

  public ready: Promise<boolean>

  constructor(issuer: Issuer, didResolver: Resolver) {
    super(issuer, didResolver)
    this.endPointUrl = 'https://from-did-doc'
    this.ready = new Promise((resolve, reject) => {
      // do some async stuff
      resolve(true)
    })
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

it('resolves ready promise after finishing async logic in constructor', async () => {
  const controller = new MockServiceController(mockIssuer, mockResolver)
  const ready = await controller.ready
  expect(ready).toEqual(true)
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
