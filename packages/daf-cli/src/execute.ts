import program from 'commander'
import inquirer from 'inquirer'
import { getAgent } from './setup'
const fs = require('fs')

program
  .command('execute')
  .description('Executes agent method')
  .option('-m, --method <string>', 'Method name')
  .option('-a, --argsJSON <string>', 'Method arguments')
  .option('-f, --argsFile <string>', 'Path to a file containing method arguments in a JSON string')
  .action(async (options) => {
    const agent = getAgent(program.config)

    try {
      let method = options.method
      let argsString = options.argsJSON
      let argsFile = options.argsFile

      const questions = []

      if (!method) {
        questions.push({
          type: 'list',
          name: 'method',
          choices: agent.availableMethods(),
          message: 'Method',
        })
      }

      if (!argsString && !argsFile) {
        questions.push({
          type: 'input',
          name: 'argsString',
          message: 'Arguments JSON',
        })
      }

      if (questions.length > 0) {
        const answers = await inquirer.prompt(questions)
        if (!method) {
          method = answers.method
        }
        if (!argsString && answers.argsString) {
          argsString = answers.argsString
        }
      }
      if (argsFile) {
        console.log({ argsFile })
        argsString = fs.readFileSync(argsFile)
      }

      const argsObj = argsString && argsString.length > 0 ? JSON.parse(argsString) : {}
      const result = await agent.execute(method, argsObj)
      console.log(result)
    } catch (e) {
      console.error(e.message)
    }
  })
