import { getAgent } from '../setup.js'
import { Command } from 'commander'
const program = new Command();
import { renderMainScreen } from './main.js'

program
  .command('explore')
  .description('launch Verifiable Data explorer')
  .action(async (cmd) => {
    const agent = await (program.opts().config)
    await renderMainScreen(agent)
  })
