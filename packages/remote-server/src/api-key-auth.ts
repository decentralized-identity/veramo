import passport from 'passport'
import Bearer from 'passport-http-bearer'

export function apiKeyAuth({ apiKey }: { apiKey: string }) {
  passport.use(
    new Bearer.Strategy((token, done) => {
      if (!apiKey || apiKey === token) {
        done(null, {}, { scope: 'all' })
      } else {
        done(null, false)
      }
    }),
  )
  return passport.authenticate('bearer', { session: false })
}
