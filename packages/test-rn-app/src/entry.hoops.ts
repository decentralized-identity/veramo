// HOOPS entry: the consumer polyfills a real RN app installs (imported first,
// as RN apps do at the top of index.js), then the same tests as entry.bare.ts.
// Every hoop here is a finding enumerated in packages/test-rn-app/README.md.
import './hoops/text-encoding'
import './hoops/get-random-values'
import { main } from './safe-set.tests'

main()
