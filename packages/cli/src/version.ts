import { Command } from 'commander';
const program = new Command();
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("../package.json");
const { version } = data

program.version(version, '-v, --version')
