import { Core, AbstractActionHandler, Types } from 'daf-core'

import Debug from 'debug'
const debug = Debug('action')

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    debug('%o', action)
    return super.handleAction(action, core)
  }
}
