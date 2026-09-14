// Browser globals for the dev app. The agent setup bundles ganache (a Node
// package) for the browser, whose deps use free `process`/`Buffer` globals.
// The Vite config (vite.config.ts + vite.shared.ts) rewrites free variables to
// `globalThis.process` / `globalThis.Buffer`, so the real values must be
// installed here before the app code runs. (The test runner does the same via
// headless-tests/setup.vite-globals.ts.)
import { Buffer } from 'buffer'
import * as processMock from 'node-stdlib-browser/mock/process'

const w = window as typeof window & { Buffer?: unknown; process?: unknown }
w.Buffer = w.Buffer ?? Buffer
w.process = w.process ?? processMock
