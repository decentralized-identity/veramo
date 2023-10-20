import { Command } from 'commander'
import { getAgent } from './setup.js'

import { MediationPolicies } from '@veramo/core-types'

const ALLOW = MediationPolicies.ALLOW
const DENY = MediationPolicies.DENY

type Options = {
  allowFrom?: string
  denyFrom?: string
}

const parseStringToList = (list?: string): string[] => {
  if (!list) return []
  return list.split(' ').map((item) => item.trim())
}

const handleAction = async ({ allowFrom, denyFrom }: Options, cmd: Command): Promise<void> => {
  try {
    const agent = await getAgent(cmd.optsWithGlobals().config)
    const didsToAllow = parseStringToList(allowFrom)
    const didsToDeny = parseStringToList(denyFrom)
    didsToAllow.forEach(async (did) => await agent.dataStoreSaveMediationPolicy({ did, policy: ALLOW }))
    didsToDeny.forEach(async (did) => await agent.dataStoreSaveMediationPolicy({ did, policy: DENY }))
    console.log('Mediation policies updated')
  } catch (e) {
    console.error(e.message)
  }
}

const mediate = new Command('mediate')
  .description('Mediate allow or deny policy on dids')
  .option('-a, --allowFrom <string>', 'string containing a list of dids to allow')
  .option('-d, --denyFrom <string>', 'string containing a list of dids to deny')
  .action(handleAction)

export { mediate }
