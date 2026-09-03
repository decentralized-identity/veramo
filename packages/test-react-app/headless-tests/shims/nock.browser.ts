// Browser stub for `nock` used only by the Vitest browser runner (aliased in
// vitest.config.ts). nock intercepts Node's http module, which does not exist
// in the browser, so the real library cannot even be evaluated there (its
// @mswjs/interceptors engine extends net.Socket at module scope).
//
// The only shared-suite usage is __tests__/shared/verifiableDataLD.ts, which
// registers a mock JSON-LD context (nock(...).persist().get(...).reply(...))
// and calls nock.cleanAll() afterwards. In the browser that mock never
// intercepts; the agent fetches the context over the real network instead —
// exactly like the CRA/webpack browser run, where the live
// https://veramo.io/contexts/* endpoints serve identical documents.
//
// The stub therefore only needs to accept the chainable registration API as
// no-ops and expose the lifecycle functions used by the suites.
type Chain = ((...args: unknown[]) => Chain) & Record<string, (...args: unknown[]) => Chain>

function makeChain(): Chain {
  const fn = function () {
    return proxy
  } as unknown as Chain
  const proxy: Chain = new Proxy(fn, {
    get(_target, prop) {
      if (prop === 'then') return undefined
      if (prop === 'baseUri') return undefined
      return (..._args: unknown[]) => proxy
    },
    apply() {
      return proxy
    },
  })
  return proxy
}

const state = { registered: false }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nock: any = (_basePath: string, _options?: unknown) => {
  state.registered = true
  return makeChain()
}

Object.assign(nock, {
  cleanAll: () => {},
  removeAll: () => {},
  activate: () => {},
  isActive: () => state.registered,
  isDone: () => true,
  pendingMocks: () => [],
  activeMocks: () => [],
  removeInterceptor: () => {},
  disableNetConnect: () => {},
  enableNetConnect: () => {},
  abortPendingRequests: () => {},
  load: () => Promise.resolve([]),
  loadDefs: () => Promise.resolve([]),
  define: () => {},
  restore: () => {},
})

export default nock
