import { Core, AbstractActionHandler, Action } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:debug:action-handler')

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Action, core: Core) {
    debug('%o', action)
    return super.handleAction(action, core)
  }
}
