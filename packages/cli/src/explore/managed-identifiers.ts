import blessed, { Widgets } from 'blessed'
import { IIdentifier } from '@veramo/core-types'
import { copyToClipboard } from './utils.js'
import { ConfiguredAgent } from '../setup.js'
import { styles } from './styles.js'

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

  const identifiers = await agent.didManagerFind()
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
    identifierBox.key(['c'], function (ch, key) {
      var messageBox = blessed.message({
        parent: screen,
        top: 'center',
        left: 'center',
        height: 'shrink',
        width: 'shrink',
        border: 'line',
        shadow: true,
        style: {
          fg: 'green'
        },
      })
      const success = copyToClipboard(JSON.stringify(identifier, null, 2))
      const message = success ? 'Copied to clipboard.' : 'Could not copy to clipboard.'
      messageBox.display(message, () => {})
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
