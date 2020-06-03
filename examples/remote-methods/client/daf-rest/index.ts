import { IAgentPlugin, TMethodMap } from 'daf-core'

export class DafRest implements IAgentPlugin {
  readonly methods: TMethodMap = {}

  constructor(options: { url: string; methods: string[] }) {
    // TODO https://expressjs.com/en/guide/writing-middleware.html
  }
}
