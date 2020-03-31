import { Action } from '../types'
import { Agent } from '../agent'

export interface ActionHandler {
  setNext(actionHandler: ActionHandler): ActionHandler
  handleAction(action: Action, agent: Agent): Promise<any>
}

export abstract class AbstractActionHandler implements ActionHandler {
  public nextActionHandler?: ActionHandler

  public setNext(actionHandler: ActionHandler): ActionHandler {
    this.nextActionHandler = actionHandler
    return actionHandler
  }

  public async handleAction(action: Action, agent: Agent): Promise<any> {
    if (this.nextActionHandler) {
      return this.nextActionHandler.handleAction(action, agent)
    }

    return null
  }
}
