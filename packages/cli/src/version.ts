import { program } from 'commander'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("../package.json");
const { version } = data

program.version(version, '-v, --version')
