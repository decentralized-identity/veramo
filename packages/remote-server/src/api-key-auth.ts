import passport from 'passport'
import Bearer from 'passport-http-bearer'
import { Router } from 'express'

/**
 * This provides a simple authorization mechanism based on a single pre-shared API key.
 *
 * @param apiKey - the pre-shared API key
 *
 * @public
 */
export function apiKeyAuth({ apiKey }: { apiKey: string }): Router {
  const router = Router()
  router.use(passport.initialize())
  passport.use(
    new Bearer.Strategy((token, done) => {
      if (!apiKey || apiKey === token) {
        done(null, {}, { scope: 'all' })
      } else {
        done(null, false)
      }
    }),
  )
  router.use(passport.authenticate('bearer', { session: false }))
  return router
}
