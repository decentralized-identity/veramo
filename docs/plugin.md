# Agent plugin

All of the agent functionality comes from it's plugins.

A plugin is a class that implements [IAgentPlugin](api/daf-core.iagentplugin.md) and provides a list of plugin methods for the agent.

Plugin methods can depend on other plugin methods. These can be accessed through the execution context.

## Writing a plugin

Let's create a plugin with a method that returns a specific service endpoint from a DID Document. We will be depending on [IResolver](api/daf-core.IResolver.md) plugin.

```typescript
// my-plugin.ts
import { IAgentPlugin, IPluginMethodMap, IAgentContext, IResolver, IService } from 'daf-core'

export interface IGetServiceArgs {
  didUrl: string
  serviceType: string
}

export interface IMyMethods extends IPluginMethodMap {
  getService(
    args: IGetServiceArgs,              // Method arguments
    context: IAgentContext<IResolver> // Execution context
  ): Promise<IService>
}

export class MyPlugin implements IAgentPlugin {
  public methods: IMyMethods

  constructor() {
    this.methods = {
      getService: this.getService.bind(this),
    }
  }

  async getService(
    args: IGetServiceArgs,
    context: IAgentContext<IResolver>
  ): Promise<IService> {
    // Resolving a DID Document using a method provided by another plugin
    const didDoc = await context.agent.resolveDid({ didUrl: args.didUrl })

    const service = didDoc?.service?.find(
      (item) => item.type === args.serviceType
    )

    if (!service) throw Error(args.serviceType + ' service not found')
    return service
  }
}
```

## Executing plugin methods

There are two valid ways of executing agent methods:

```typescript
// with IDE autocomplete
await agent.getService({
  didUrl: 'did:example:123',
  serviceType: 'custom',
}) // Notice: no need to pass in the context

// or without IDE autocomplete
await agent.execute('getService', {
  didUrl: 'did:example:123',
  serviceType: 'custom',
}) // Notice: no need to pass in the context
```

**You don't have to pass in the context**. It is done automatically by the agent.

### With IDE autocomplete

```typescript
import { createAgent, TAgent, IResolver } from 'daf-core'
import { DafResolver } from 'daf-resolver'
import { MyPlugin, IMyMethods } from './my-plugin'

const agent = createAgent<IMyMethods & IResolver>({
  plugins: [
    new MyPlugin(),
    new DafResolver({ infuraProjectId: '5ffc47f65c4042ce847ef66a3fa70d4c' }),
  ],
})

agent
  .getService({
    didUrl: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
    serviceType: 'custom',
  })
  .then((service) => console.log(service))
  .catch((error) => console.log(error.message))
```

### Without IDE autocomplete

```typescript
import { Agent } from 'daf-core'
import { DafResolver } from 'daf-resolver'
import { MyPlugin } from './my-plugin'

const agent = new Agent({
  plugins: [
    new MyPlugin(),
    new DafResolver({ infuraProjectId: '5ffc47f65c4042ce847ef66a3fa70d4c' }), 
  ],
})

agent
  .execute('getService', {
    didUrl: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
    serviceType: 'custom',
  })
  .then((service) => console.log(service))
  .catch((error) => console.log(error.message))
```
