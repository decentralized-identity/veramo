// LD-VERAMO entry: @veramo/credential-ld through its public entry
// point with ONE suite (src/stacks/veramo.ts). Every hoop is installed so that
// only the package itself can fail.
import './rn-runtime'
import './hoops/text-encoding'
import './hoops/get-random-values'
import './hoops/subtle-digest'
import { veramoEd25519Signature2020 } from './stacks/veramo'
import { runLd } from './ld.tests'
import { report } from './verdict.js'

runLd(veramoEd25519Signature2020()).then(report)
