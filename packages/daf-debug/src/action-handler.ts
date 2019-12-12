import { Core, AbstractActionHandler, Types } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:debug:action-handler')

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    debug('%o', action)
    return super.handleAction(action, core)
  }
}
