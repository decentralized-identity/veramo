import nextConnect from 'next-connect'
import middleware from '../../middlewares/session'

const handler = nextConnect()

handler.use(middleware)

export default handler
