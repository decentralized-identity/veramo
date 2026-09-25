// LD-UPSTREAM entry: the upstream digitalbazaar JSON-LD stack
// (jsonld@9, no forks) used directly, with the minimal hoop set it needs at
// runtime. Hermes cannot parse `import.meta`, so this entry only runs when the
// bundle is built with the import-meta hoop (see entry.ld-upstream.import-meta.ts);
// without it the runner asserts the recorded compile failure.
import './rn-runtime'
import './hoops/get-random-values'
import './hoops/subtle-digest'
import { upstream } from './stacks/upstream'
import { runLdLib } from './ld-lib.tests'
import { report } from './verdict.js'

runLdLib(upstream).then(report)
