import { program } from 'commander'

const { version } = require('../package.json')

program.version(version, '-v, --version')
