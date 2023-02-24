import inquirer from 'inquirer'
import inquirerAutoPrompt from 'inquirer-autocomplete-prompt'

inquirer.registerPrompt('autocomplete', inquirerAutoPrompt)
import { veramo } from './createCommand.js'

if (!process.argv.slice(2).length) {
  veramo.outputHelp()
} else {
  veramo.parse(process.argv)
}
