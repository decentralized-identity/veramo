import { Command } from 'commander'
import inquirer from 'inquirer'

import { getAgent } from './setup.js'

import { MediationPolicies } from '@veramo/core-types'

type ConfiguredAgent = Awaited<ReturnType<typeof getAgent>>

const ALLOW = MediationPolicies.ALLOW
const DENY = MediationPolicies.DENY

type Options = Partial<{
  allowFrom: boolean
  denyFrom: boolean
  interactive: boolean
  fileJson: string
}>

type UpdatePolicyParams = {
  dids: string[]
  agent: ConfiguredAgent
  policy?: MediationPolicies
  remove?: boolean
}

/**
 * private functions
 **/

const updatePolicies = async (options: UpdatePolicyParams): Promise<void> => {
  const { dids, agent, policy, remove = false } = options
  if (remove) return dids.forEach(async (did) => await agent.mediationManagerRemoveMediationPolicy({ did }))
  if (!policy) throw new Error('No policy provided')
  return options.dids.forEach(async (did) => await agent.mediationManagerSaveMediationPolicy({ did, policy }))
}

const promptForDids = async (action: string): Promise<string[]> => {
  const { dids } = await inquirer.prompt<{ dids: string }>({
    type: 'input',
    name: 'dids',
    message: `Enter the dids you want to ${action.toLowerCase()} separated by spaces:`,
  })
  return dids.split(' ')
}

/**
 * cli action functions
 **/

const policy = (policy: MediationPolicies) => {
  return async function (
    { fileJson, interactive }: Pick<Options, 'fileJson' | 'interactive'>,
    cmd: Command,
  ): Promise<void> {
    try {
      if (fileJson && interactive) throw new Error('Please specify only one input method')

      const agent = await getAgent(cmd.optsWithGlobals().config)

      if (fileJson) {
        const jsonData = await import(fileJson, { assert: { type: 'json' } })
        const dids = jsonData.default
        await updatePolicies({ dids, agent, policy })
      } else if (interactive) {
        const dids = await promptForDids(policy)
        await updatePolicies({ dids, agent, policy })
      } else {
        const dids = cmd.args
        await updatePolicies({ dids, agent, policy })
      }

      console.log('Mediation policies updated')
    } catch (e) {
      console.error(e.message)
    }
  }
}

async function listPolicies(options: Pick<Options, 'allowFrom' | 'denyFrom'>, cmd: Command): Promise<void> {
  try {
    const agent = await getAgent(cmd.optsWithGlobals().config)

    const policies = await agent.dataStoreGetMediationPolicies()

    if (options.allowFrom) return console.log(policies.filter((policy) => policy.policy === ALLOW))
    else if (options.denyFrom) return console.log(policies.filter((policy) => policy.policy === DENY))
    else console.log(policies)
  } catch (e) {
    console.error(e.message)
  }
}

async function removePolicies(
  { fileJson, interactive }: Pick<Options, 'fileJson' | 'interactive'>,
  cmd: Command,
): Promise<void> {
  try {
    const agent = await getAgent(cmd.optsWithGlobals().config)

    if (fileJson) {
      const jsonData = await import(fileJson, { assert: { type: 'json' } })
      const dids = jsonData.default
      await updatePolicies({ dids, remove: true, agent })
    } else if (interactive) {
      const dids = await promptForDids('Remove')
      await updatePolicies({ dids, remove: true, agent })
    } else {
      const dids = cmd.args
      await updatePolicies({ dids, remove: true, agent })
    }

    console.log('Mediation policies removed')
  } catch (e) {
    console.error(e.message)
  }
}

const mediate = new Command('mediate').description('Mediate allow or deny policy on dids')

mediate
  .command('allow-from')
  .description('add dids that should be allowed for mediation')
  .option('-f, --file-json <string>', 'read dids from json file')
  .option('-i, --interactive', 'interactively input dids')
  .action(policy(ALLOW))

mediate
  .command('deny-from')
  .description('deny dids that should be denied for mediation')
  .option('-f, --file-json <string>', 'read dids from json file')
  .option('-i, --interactive', 'interactively input dids')
  .action(policy(DENY))

mediate
  .command('list')
  .description('list mediation policies')
  .option('-a, --allow-from', 'list allow policies')
  .option('-d, --deny-from', 'list deny policies')
  .action(listPolicies)

mediate
  .command('remove')
  .description('remove mediation policies')
  .option('-f, --file-json <string>', 'read dids from json file')
  .option('-i, --interactive', 'interactively input dids')
  .action(removePolicies)

export { mediate }
