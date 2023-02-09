import { program } from 'commander'
import module from "module";
const requireCjs = module.createRequire(import.meta.url);
const data = requireCjs("../package.json");
const { version } = data

program.version(version, '-v, --version')

export {}
