// LD-VERAMO entry: @veramo/credential-ld through its public entry point, all four suites, replaying the
// golden fixtures (src/ld.tests.ts). Hoops first, as at the top of an RN app's index.js; this is the
// minimal set (credential-ld needs no getRandomValues and no crypto.subtle).
import './rn-runtime'
import './hoops/text-encoding'
import { runLd } from './ld.tests'
import { report } from './verdict.js'

runLd().then(report)
