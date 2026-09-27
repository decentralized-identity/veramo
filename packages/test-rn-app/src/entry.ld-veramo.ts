// LD-VERAMO entry: @veramo/credential-ld through its public entry point, all four suites, replaying the
// golden fixtures (src/ld.tests.ts). Hoops first, as at the top of an RN app's index.js.
import './rn-runtime'
import './hoops/text-encoding'
import './hoops/get-random-values'
import './hoops/subtle-digest'
import { runLd } from './ld.tests'
import { report } from './verdict.js'

runLd().then(report)
