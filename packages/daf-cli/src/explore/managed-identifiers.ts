import blessed, { Widgets } from 'blessed'
import { IIdentifier } from 'daf-core'
import { ConfiguredAgent } from '../setup'
import { styles } from './styles'

export const getManagedIdentifiersTable = async (agent: ConfiguredAgent, screen: Widgets.Screen) => {
  screen.title = 'Managed identifiers'

  const managedIdentifiersTable = blessed.listtable({
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

  const identifiers = await agent.idManagerGetIdentifiers()
  managedIdentifiersTable.setData([['DID', 'Alias']].concat(identifiers.map((i) => [i.did, i.alias || ''])))

  managedIdentifiersTable.on('select', async function (data) {
    const i = managedIdentifiersTable.getItemIndex(data)
    showIdentifier(identifiers[i - 1])
  })

  function showIdentifier(identifier: IIdentifier) {
    const identifierBox = blessed.box({
      label: identifier.did,
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

      content: JSON.stringify(identifier, null, 2),
    })
    identifierBox.key(['escape'], function (ch, key) {
      identifierBox.destroy()
      screen.render()
    })

    identifierBox.focus()
    screen.append(identifierBox)
    screen.render()
  }

  return managedIdentifiersTable
}
