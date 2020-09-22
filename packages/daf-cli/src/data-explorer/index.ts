import { getAgent } from '../setup'
import program from 'commander'
import { renderMainScreen } from './main'

program
  .command('data-explorer')
  .description('Data explorer')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    await renderMainScreen(agent)
  })
