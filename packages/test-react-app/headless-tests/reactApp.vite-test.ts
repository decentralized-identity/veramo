// Resurrection of the "React App Smoke Test" — the "13th suite". The two
// jest-puppeteer snapshot tests that lived at the bottom of
// browserAgent.browser-test.ts (the `// ...issues/503` comment above them was
// stale — the tests themselves were live and passing under jest) have been
// REMOVED from that jest runner and rewritten here as Vitest browser-mode
// tests with Playwright selectors, so the smoke test now runs in the harness
// that survives (see ticket 04).
//
// There is no dev-server coupling and no `page.goto`: the real, unmodified
// <App /> component is mounted into the test iframe with react-dom/client, so
// the test runs the exact React app that Vite serves — App's own useEffect
// calls setup() from src/veramo/setup.ts, which spins up a fresh deterministic
// ganache chain and deploys a fresh ERC1056 registry, then resolves the two
// DIDs into `#result` and `#invalid-result`. The assertions are ported
// verbatim from the removed jest block (same DID document structure, same
// `invalidDid` error result).
//
// Selector mechanism: `@vitest/browser/context` exposes no public
// `page.locator('#id')`, but `locators.extend` is the sanctioned extension
// point — a method whose callback returns a selector string is wrapped into a
// real provider-backed Locator (Playwright here), both on `page` and on every
// Locator. `byCSS('#result')` therefore yields a genuine Playwright locator
// whose `findElement` auto-waits for the element to appear.
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { locators, page } from 'vitest/browser'
import type { Locator } from 'vitest/browser'
import App from '../src/App'
import { tearDown } from '../src/veramo/setup.js'

// The LocatorSelectors interface is declared in '@vitest/browser/context' and
// re-exported (via @vitest/browser-playwright/context) by the 'vitest/browser'
// module we import above, so the augmentation here makes `byCSS` available on
// `page` and on every Locator, and lets `locators.extend` accept it.
declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    byCSS: (css: string) => Locator
  }
}

locators.extend({
  byCSS(css: string) {
    return `css=${css}`
  },
})

// The old puppeteer tests used a 3 minute wait for the app to render its
// results: App's setup() (ganache startup + ERC1056 registry deploy) plus its
// issueCredential() call can take tens of seconds.
const TEST_TIMEOUT = 3 * 60 * 1000

describe('should initialize in the react app', () => {
  let container: HTMLDivElement | undefined
  let root: ReturnType<typeof createRoot> | undefined

  beforeAll(async () => {
    container = document.createElement('div')
    container.id = 'react-app-root'
    document.body.appendChild(container)
    root = createRoot(container)
    // The unmodified component under test: it runs setup() itself and renders
    // the DID resolution results into #result / #invalid-result.
    root.render(React.createElement(App))
  }, TEST_TIMEOUT)

  afterAll(async () => {
    root?.unmount()
    container?.remove()
    // Stop the ganache chain started by App's own setup().
    await tearDown()
  })

  it('should get didDoc data and match the snapshot', async () => {
    /**
     * this is a test case snapshot, provided by documentation on
     * https://veramo.io/docs/react_tutorials/react_setup_resolver,
     * to check if the app is returning the same results as expected.
     */
    const resultSnapshot = {
      didDocumentMetadata: {},
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
      },
      didDocument: {
        '@context': expect.anything(),
        id: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
        verificationMethod: [
          {
            id: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller',
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
            blockchainAccountId: 'eip155:1337:0x6AcF3bB1eF0eE84559De2bC2Bd9D91532062a730',
          },
        ],
        authentication: ['did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
        assertionMethod: ['did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
      },
    }

    const element = await page.byCSS('#result').findElement({ timeout: TEST_TIMEOUT })
    const parsedResult = JSON.parse(element.textContent!)
    expect(parsedResult).toMatchObject(resultSnapshot)
  }, TEST_TIMEOUT)

  it('should get didDoc data based on invalid URL', async () => {
    const resultSnapshot = {
      didDocumentMetadata: {},
      didResolutionMetadata: {
        error: 'invalidDid',
        message: 'Not a valid did:ethr: ganache:0x16acf3bb1ef0ee8459de2bc2bd9d91532062a7',
      },
      didDocument: null,
    }

    const element = await page.byCSS('#invalid-result').findElement({ timeout: TEST_TIMEOUT })
    const parsedResult = JSON.parse(element.textContent!)
    expect(parsedResult).toMatchObject(resultSnapshot)
  }, TEST_TIMEOUT)
})
