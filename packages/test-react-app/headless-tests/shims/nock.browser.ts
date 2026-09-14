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

// Interceptor reply callbacks receive nock's (path, requestBody) pair and
// return a [status, body, headers] triple.
type ReplyFunction = (path: string, requestBody?: unknown) => [number, unknown, ...unknown[]]

/** Coerces nock's accepted header forms (record or entry pairs) into a plain record. */
function normalizeHeaders(headers: unknown): Record<string, string> {
  const record: Record<string, string> = {}
  if (Array.isArray(headers)) {
    for (const [key, value] of headers) record[String(key).toLowerCase()] = String(value)
  } else if (headers !== null && typeof headers === 'object') {
    for (const [key, value] of Object.entries(headers)) record[key.toLowerCase()] = String(value)
  }
  return record
}

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

/**
 * Targeted augmentation of the page global used by the fetch interceptor: the
 * idempotency flag plus the `fetch` binding it patches. Avoids a blanket
 * `globalThis as any` while keeping the symbol-keyed flag type-safe.
 */
type InterceptorGlobal = typeof globalThis & { [INSTALL_FLAG]?: boolean }

function installFetchInterceptor(): void {
  const globalScope = globalThis as InterceptorGlobal
  if (globalScope[INSTALL_FLAG]) return
  globalScope[INSTALL_FLAG] = true

  // Capture the pristine browser fetch. At setupFiles time nothing has wrapped
  // or replaced it yet, so this is the native implementation.
  const originalFetch = globalScope.fetch.bind(globalScope)

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

  globalScope.fetch = patchedFetch
}

function rejectUnsupported(name: string): never {
  throw new Error(
    `${name} is not supported by the browser nock shim (headless-tests/shims/nock.browser.ts). ` +
      `Only nock(origin).persist().get|post|put|patch|delete|head(path).reply(status, body, headers) ` +
      `and nock.cleanAll() are implemented.`,
  )
}

// Minimal typing of the implemented nock surface (see the header comment).
// The default export is a Proxy that rejects everything outside this surface,
// so the types only describe what is actually implemented.
interface NockRoute {
  reply: (statusOrFn: number | ReplyFunction, body?: unknown, headers?: unknown) => NockScope
}

interface NockScope {
  persist: () => NockScope
  get: (path: string) => NockRoute
  post: (path: string) => NockRoute
  put: (path: string) => NockRoute
  patch: (path: string) => NockRoute
  delete: (path: string) => NockRoute
  head: (path: string) => NockRoute
}

interface NockShim {
  (origin: string, options?: unknown): NockScope
  cleanAll: () => void
}

const nockImpl = (origin: string, _options?: unknown): NockScope => {
  if (typeof origin !== 'string' || !/^https?:\/\//.test(origin)) {
    throw new Error(`nock.browser shim: expected an http(s) origin string, got: ${String(origin)}`)
  }
  const normalizedOrigin = origin.replace(/\/+$/, '')

  let scopePersistent = false

  const register = (method: string, path: string): NockRoute => ({
    // reply(status, body[, headers]) or reply((path, requestBody) => [status, body, headers])
    reply: (statusOrFn: number | ReplyFunction, body?: unknown, headers?: unknown): NockScope => {
      let status: number
      let routeBody: unknown
      let routeHeaders: unknown
      if (typeof statusOrFn === 'function') {
        ;[status, routeBody, routeHeaders] = statusOrFn(path, undefined)
      } else {
        status = statusOrFn
        routeBody = body
        routeHeaders = headers
      }
      const headerRecord = normalizeHeaders(routeHeaders)
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

  const scope: NockScope = {
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

const nock: NockShim = Object.assign(nockImpl, {
  cleanAll: (): void => {
    routes.length = 0
  },
})

// Anything outside the implemented surface fails loudly instead of no-op'ing
// vacuously. `then`/symbols are passed through so promise/bundler interop
// probes don't trip the guard.
export default new Proxy(nock, {
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
