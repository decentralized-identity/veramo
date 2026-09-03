// Browser fetch-intercepting shim for `nock`, aliased over the real package in
// vitest.config.ts. The real nock intercepts Node's http module and its
// @mswjs/interceptors engine extends net.Socket at module scope, so it cannot
// even be evaluated in a browser.
//
// The ONLY shared-suite usage is __tests__/shared/verifiableDataLD.ts, which
// registers one mocked JSON-LD context:
//
//   nock('https://veramo.io')
//     .persist()
//     .get('/contexts/discord-kudos/v1')
//     .reply(200, { '@context': { ... } })
//
// inside a `beforeAll` hook, and calls `nock.cleanAll()` in `afterAll`.
//
// This shim intercepts globalThis.fetch so the mocked endpoint is served
// locally: no CORS is involved and no request leaves the page (the old config
// rewrote the URL to a CORS-enabled mirror because the no-op stub let the
// fetch go to the real network; that rewrite is gone).
//
// Ordering guarantee: the fetch wrapper is installed when THIS module is
// evaluated. It is side-effect-imported by setup.vite-globals.ts (a vitest
// `setupFiles` entry), which runs before any test module and before any of
// their dependencies are evaluated. That matters because cross-fetch (used by
// @veramo/credential-ld's document loader) captures `globalThis.fetch` at
// module-evaluation time; any patch installed later would be bypassed. With
// the setupFiles import, the wrapper is on globalThis before cross-fetch (or
// anything else) executes. Actual context fetches only happen inside tests,
// i.e. after both the patch and the suite's beforeAll registration exist.
// The install is idempotent, so a second evaluation via the 'nock' alias (the
// suite's own import) is a no-op.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReplyFunction = (...args: any[]) => [number, unknown, ...unknown[]]

interface Route {
  origin: string
  method: string
  path: string
  status: number
  body: unknown
  headers: Record<string, string>
  persist: boolean
}

const routes: Route[] = []

const INSTALL_FLAG = Symbol.for('veramo.test-react-app.nockBrowserShim')

function installFetchInterceptor(): void {
  const globalAny = globalThis as any
  if (globalAny[INSTALL_FLAG]) return
  globalAny[INSTALL_FLAG] = true

  // Capture the pristine browser fetch. At setupFiles time nothing has wrapped
  // or replaced it yet, so this is the native implementation.
  const originalFetch = globalAny.fetch.bind(globalAny)

  const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string
    let method: string
    if (typeof input === 'string' || input instanceof URL) {
      url = input.toString()
      method = (init?.method ?? 'GET').toUpperCase()
    } else {
      url = input.url
      method = (init?.method ?? input.method).toUpperCase()
    }

    try {
      const parsed = new URL(url)
      const route = routes.find(
        (r) =>
          r.origin === parsed.origin &&
          r.path === parsed.pathname &&
          r.method === method,
      )
      if (route) {
        if (!route.persist) {
          routes.splice(routes.indexOf(route), 1)
        }
        let serialized: string
        if (typeof route.body === 'string') {
          serialized = route.body
        } else if (route.body === undefined || route.body === null) {
          serialized = ''
        } else {
          serialized = JSON.stringify(route.body)
        }
        const headers = new Headers(route.headers)
        if (!headers.has('content-type') && serialized !== '') {
          headers.set('content-type', 'application/json')
        }
        return new Response(serialized, { status: route.status, headers })
      }
    } catch {
      // Unparseable URL: fall through to the original fetch, which will
      // surface its own error.
    }

    // Non-matching requests go to the real network unchanged.
    return originalFetch(input, init)
  }

  globalAny.fetch = patchedFetch
}

function rejectUnsupported(name: string): never {
  throw new Error(
    `${name} is not supported by the browser nock shim (headless-tests/shims/nock.browser.ts). ` +
      `Only nock(origin).persist().get|post|put|patch|delete|head(path).reply(status, body, headers) ` +
      `and nock.cleanAll() are implemented.`,
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nock: any = (origin: string, _options?: unknown) => {
  if (typeof origin !== 'string' || !/^https?:\/\//.test(origin)) {
    throw new Error(`nock.browser shim: expected an http(s) origin string, got: ${String(origin)}`)
  }
  const normalizedOrigin = origin.replace(/\/+$/, '')

  let scopePersistent = false

  const register = (method: string, path: string) => ({
    // reply(status, body[, headers]) or reply((path, requestBody) => [status, body, headers])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reply: (statusOrFn: number | ReplyFunction, body?: unknown, headers?: any): unknown => {
      let status: number
      let routeBody: unknown
      let routeHeaders: Record<string, string>
      if (typeof statusOrFn === 'function') {
        const resolved = statusOrFn(path, undefined)
        ;[status, routeBody, routeHeaders] = resolved
      } else {
        status = statusOrFn
        routeBody = body
        routeHeaders = headers
      }
      const headerRecord: Record<string, string> = {}
      if (Array.isArray(routeHeaders)) {
        for (const [k, v] of routeHeaders) headerRecord[String(k).toLowerCase()] = String(v)
      } else if (routeHeaders && typeof routeHeaders === 'object') {
        for (const [k, v] of Object.entries(routeHeaders)) headerRecord[k.toLowerCase()] = String(v)
      }
      routes.push({
        origin: normalizedOrigin,
        method: method.toUpperCase(),
        path,
        status,
        body: routeBody,
        headers: headerRecord,
        persist: scopePersistent,
      })
      return scope
    },
  })

  const scope = {
    persist: () => {
      scopePersistent = true
      return scope
    },
    get: (path: string) => register('GET', path),
    post: (path: string) => register('POST', path),
    put: (path: string) => register('PUT', path),
    patch: (path: string) => register('PATCH', path),
    delete: (path: string) => register('DELETE', path),
    head: (path: string) => register('HEAD', path),
  }

  return scope
}

nock.cleanAll = (): void => {
  routes.length = 0
}

// Anything outside the implemented surface fails loudly instead of no-op'ing
// vacuously. `then`/symbols are passed through so promise/bundler interop
// probes don't trip the guard.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default new Proxy<any>(nock, {
  get(target, prop, receiver) {
    if (
      typeof prop === 'symbol' ||
      prop === 'then' ||
      prop in target ||
      prop in Function.prototype
    ) {
      return Reflect.get(target, prop, receiver)
    }
    return () =>
      rejectUnsupported(`nock.${String(prop)}`)
  },
})

installFetchInterceptor()
