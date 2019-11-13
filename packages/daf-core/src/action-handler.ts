import { Action } from './types'
import { Core } from './core'

export interface ActionHandler {
  setNext(actionHandler: ActionHandler): ActionHandler
  handleAction(action: Action, core: Core): Promise<any>
}

export abstract class AbstractActionHandler implements ActionHandler {
  public nextActionHandler?: ActionHandler

  public setNext(actionHandler: ActionHandler): ActionHandler {
    this.nextActionHandler = actionHandler
    return actionHandler
  }

  public async handleAction(action: Action, core: Core): Promise<any> {
    if (this.nextActionHandler) {
      return this.nextActionHandler.handleAction(action, core)
    }

    return null
  }
}
