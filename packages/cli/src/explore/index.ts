import { getAgent } from '../setup.js'
import { program } from 'commander'
import { renderMainScreen } from './main.js'

program
  .command('explore')
  .description('launch Verifiable Data explorer')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    await renderMainScreen(agent)
  })
