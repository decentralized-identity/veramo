import blessed, { Widgets } from 'blessed'
import { IIdentity } from 'daf-core'
import { ConfiguredAgent } from '../setup'
import { styles } from './styles'

export const getManagedIdentitiesTable = async (agent: ConfiguredAgent, screen: Widgets.Screen) => {
  screen.title = 'Managed identities'

  const managedIdentitiesTable = blessed.listtable({
    top: '0',
    left: '0',
    border: 'line',
    align: 'left',
    tags: true,
    keys: true,
    width: '100%',
    height: '100%',
    mouse: true,
    style: styles.listtable,
  })

  const identities = await agent.identityManagerGetIdentities()
  managedIdentitiesTable.setData([['DID', 'Alias']].concat(identities.map((i) => [i.did, i.alias || ''])))

  managedIdentitiesTable.on('select', async function (data) {
    const i = managedIdentitiesTable.getItemIndex(data)
    showIdentity(identities[i - 1])
  })

  function showIdentity(identity: IIdentity) {
    const identityBox = blessed.box({
      label: identity.did,
      top: 'center',
      left: 'center',
      height: '90%',
      width: '90%',
      border: 'line',
      shadow: true,
      mouse: true,
      keys: true,
      scrollable: true,
      vi: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'grey',
        },
        style: {
          inverse: false,
        },
      },

      content: JSON.stringify(identity, null, 2),
    })
    identityBox.key(['escape'], function (ch, key) {
      identityBox.destroy()
      screen.render()
    })

    identityBox.focus()
    screen.append(identityBox)
    screen.render()
  }

  return managedIdentitiesTable
}
