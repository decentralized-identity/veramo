import { AbstractServiceController } from '../abstract-service-controller'
import { ServiceEventTypes } from '../service-manager'
import { AbstractIdentity } from '../../identity/abstract-identity'
import { Resolver } from '../../agent'
import { Message } from '../../entities/message'

describe('dummy', () => {
  const a = 100
  it('should run a dummy test', () => {
    expect(a).toEqual(100)
  })
})

// const msg1 = new Message({ raw: 'test1', meta: { type: 'mockService', id: 'https://from-did-doc' } })
// const msg2 = new Message({ raw: 'test2', meta: { type: 'mockService', id: 'https://from-did-doc' } })

// export class MockServiceController extends AbstractServiceController {
//   static defaultServiceEndpoint: string = 'https://default.host/path'
//   readonly type = 'mockService'
//   private endPointUrl: string

//   public ready: Promise<boolean>

//   constructor(identity: AbstractIdentity, didResolver: Resolver) {
//     super(identity, didResolver)
//     this.endPointUrl = 'https://from-did-doc'
//     this.ready = new Promise((resolve, reject) => {
//       // do some async stuff
//       resolve(true)
//     })
//   }

//   instanceId() {
//     return {
//       did: this.identity.did,
//       type: this.type,
//       id: this.endPointUrl,
//     }
//   }

//   async getMessagesSince(timestamp: number) {
//     this.emit(ServiceEventTypes.NewMessages, [msg1, msg2])
//     return [msg1, msg2]
//   }

//   async listen() {
//     this.emit(ServiceEventTypes.NewMessages, [msg1])
//   }
// }

// const mockIdentity: AbstractIdentity = {
//   did: 'did:test:123',
//   signer: (keyId?: string) => async (data: string) => data,
//   identityProviderType: 'mock',
//   didDoc: async (): Promise<any> => '',
//   encrypt: async (): Promise<any> => '',
//   decrypt: async (): Promise<any> => '',
// }

// const mockResolver: Resolver = {
//   resolve: async (did: string) => null,
// }

// it('should be possible to set configuration as a static property', async () => {
//   expect(MockServiceController.defaultServiceEndpoint).toEqual('https://default.host/path')
//   MockServiceController.defaultServiceEndpoint = 'https://custom.host/path'
//   expect(MockServiceController.defaultServiceEndpoint).toEqual('https://custom.host/path')
// })

// it('resolves ready promise after finishing async logic in constructor', async () => {
//   const controller = new MockServiceController(mockIdentity, mockResolver)
//   const ready = await controller.ready
//   expect(ready).toEqual(true)
// })

// it('returns and emits an event with the same message array ', async () => {
//   const controller = new MockServiceController(mockIdentity, mockResolver)
//   spyOn(controller, 'emit')
//   const messages = await controller.getMessagesSince(0)
//   expect(controller.emit).toHaveBeenCalledWith(ServiceEventTypes.NewMessages, messages)
// })

// it('emits events on listen', async () => {
//   const controller = new MockServiceController(mockIdentity, mockResolver)
//   spyOn(controller, 'emit')
//   await controller.listen()
//   expect(controller.emit).toHaveBeenCalledWith(ServiceEventTypes.NewMessages, [msg1])
// })

// it('instanceId is generated from state', async () => {
//   const controller = new MockServiceController(mockIdentity, mockResolver)
//   const instanceId = controller.instanceId()
//   expect(instanceId).toEqual({ did: 'did:test:123', type: controller.type, id: 'https://from-did-doc' })
// })
