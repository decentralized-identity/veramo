import nextConnect from 'next-connect'
import session, { MemoryStore } from 'express-session'

const middleware = nextConnect()
export const sessionStore = new MemoryStore()

const sess = session({
  secret: 'ZgeexV9agcU5NsW9Ge4yPnXBBWatZUj5',
  cookie: { maxAge: 10 * 60000 },
  saveUninitialized: true,
  resave: true,
  store: sessionStore,
})

middleware.use(sess)

export default middleware
