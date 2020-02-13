import { Core, AbstractActionHandler, Types } from 'daf-core'

export const ActionTypes = {
  addPublicKey: 'action.createAndAddPublicKey',
  addDelegate: 'action.addDelegate',
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.addPublicKey) {
      /// NR 1
      const did = action.data.did
      const keyType = action.data.keyType

      // create keypair

      // update did document
      const identity = await core.identityManager.getIdentity(did)
      const kms = identity.kms
      const key = kms.create(keyType)

      try {
        const result = await identity.controller.addPublicKey(key.serialized, { gas: action.data.gas })
        // update serialized identity
        identity.serialized.keys.push(key.serialized)
        const x = await identity.identityProvider.updateIdentity(identity.did, identity.serialized)
      } catch (e) {}
    }

    return super.handleAction(action, core)
  }
}
