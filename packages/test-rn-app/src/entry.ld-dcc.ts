// LD-DCC entry: the DCC (@digitalcredentials) JSON-LD stack used
// directly, no Veramo code.
import './rn-runtime'
import './hoops/text-encoding'
import './hoops/get-random-values'
import './hoops/subtle-digest'
import { dcc } from './stacks/dcc'
import { runLdLib } from './ld-lib.tests'
import { report } from './verdict.js'

runLdLib(dcc).then(report)
