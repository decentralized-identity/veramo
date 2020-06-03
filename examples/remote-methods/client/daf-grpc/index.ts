import { IAgentPlugin, TMethodMap } from 'daf-core'

export class DafGrpc implements IAgentPlugin {
  readonly methods: TMethodMap = {}

  constructor(options: { url: string; methods: string[] }) {
    // TODO https://grpc.io/docs/languages/node/quickstart/
  }
}
