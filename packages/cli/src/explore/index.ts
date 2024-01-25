import { getAgent } from '../setup'
import { Command } from 'commander'
import { renderMainScreen } from './main'

const explore = new Command('explore')
  .description('launch Verifiable Data explorer')
  .action(async (opts: {}, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)
    await renderMainScreen(agent)
  })

export { explore }
