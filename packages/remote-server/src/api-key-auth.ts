import passport from 'passport'
import Bearer from 'passport-http-bearer'
import { Router } from 'express'

export function apiKeyAuth({ apiKey }: { apiKey: string }) {
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
