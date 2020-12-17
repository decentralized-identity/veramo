import { getAgent } from '../setup'
import program from 'commander'
import { renderMainScreen } from './main'

program
  .command('explore')
  .description('launch Verifiable Data explorer')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    await renderMainScreen(agent)
  })
