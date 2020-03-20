import { core } from '../../daf/setup'

export default async (req, res) => {
  if (req.query.type) {
    const identity = await core.identityManager.createIdentity(
      'rinkeby-ethr-did',
    )
    res.json({ data: identity.did })
  } else {
    const identities = await core.identityManager.getIdentities()

    if (identities.length === 0) {
      const identity = await core.identityManager.createIdentity(
        'rinkeby-ethr-did',
      )
      res.json([identity.did])
    } else {
      res.json(identities.map(identity => identity.did))
    }
  }
}
