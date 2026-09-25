// HOOP text-encoding: Hermes ships TextEncoder but not TextDecoder, and RN 0.87
// does not polyfill it. Consumers install an npm polyfill; fast-text-encoding
// (pinned 1.0.6) is the most-used one. It only fills globals that are missing,
// so Hermes' native TextEncoder is kept.
import 'fast-text-encoding'
